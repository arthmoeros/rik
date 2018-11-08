#!/usr/bin/env node
const joi = require('joi');
const joiYml = require('joi-yml');
const serializeError = require('serialize-error');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ResourceLoader = require('./resource.loader');
const logger = require('../support/iunctio-logger');
const debugMode = process.env.IUNCTIO_DEBUG || false;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let port = process.env.PORT || 58080;

let apiRouter = express.Router();
let resourceLoader = new ResourceLoader();
let resources = resourceLoader.getAvailableResourcesNames();

function _resolveSchema(resource, handlerType, schemaType) {
  let schemaFileName = resource.metadata.schemas[`${handlerType}${schemaType}`];
  if (schemaFileName) {
    logger.info(`Building JOI Schema for ${schemaFileName}`);
    return joiYml.getBuilt(schemaFileName);
  } else {
    throw new Error(`Schema type ${schemaType} for handler ${handlerType} is undefined!`);
  }
}

function _validate(schema, obj, handlerType, isRequest) {
  if (handlerType === 'get' && isRequest) {
    return joi.validate(obj.query, schema);
  } else {
    return joi.validate(obj.body, schema);
  }
}

function createHandler(resource, handlerType, uri) {
  logger.info('================ HANDLER CREATION =================');
  logger.info(`Resource: ${resource.metadata.name}(${resource.metadata.version})`);
  logger.info(`Method: ${handlerType}`);
  logger.info(`At: ${uri}`);
  let reqSchema = _resolveSchema(resource, handlerType, 'Request');
  let resSchema = _resolveSchema(resource, handlerType, 'Response');
  let handler = (req, res, next) => {
    let reqValErrors = _validate(reqSchema, req, handlerType, true);
    if (reqValErrors && reqValErrors.error) {
      res.status(400);
      res.send(`Sent request failed schema validation, details -> ${JSON.stringify(reqValErrors)}`);
      next();
      return;
    }
    resource.resourceController[handlerType](req.params, req.query, req.headers, req.body).then((apiResponse) => {
      let respValErrors = _validate(resSchema, apiResponse, handlerType, false);
      if (respValErrors && respValErrors.error) {
        res.status(500);
        res.send(`Response created by service failed schema validation, details -> ${JSON.stringify(respValErrors)}`);
        next();
        return;
      }
      for (let key in apiResponse.header) {
        res.setHeader(key, apiResponse.header[key]);
      }
      res.status(apiResponse.statusCode || 200);
      res.send(apiResponse.body);
    }).catch((error) => {
      res.status(500);
      res.send(`An unexpected error has ocurred, details -> ${debugMode ? JSON.stringify(serializeError(error)) : error.message}`);
    });
    next();
  };
  return handler;
}

function createDisabledHandler() {
  return (req, res) => {
    res.status(405);
    res.send('This method on the specified resource is not available');
    next();
  }
}

let expressCustomization = resourceLoader.getExpressCustomization();
if (expressCustomization) {
  if (expressCustomization.setupRouterBeforeApi
    && typeof (expressCustomization.setupRouterBeforeApi) === 'function') {
      expressCustomization.setupRouterBeforeApi(apiRouter);
  } else {
    logger.warn(`Found an Iunctio customization file, but it doesn't export the setupRouterBeforeApi function`);
  }
}

resources.forEach((resourceName) => {
  let resource = resourceLoader.getResourceConfig(resourceName);
  let resourcePath = `/${resource.metadata.version}/${resource.metadata.name}`;
  if (resource.resourceController.get !== undefined) {
    apiRouter.get(resourcePath, createHandler(resource, 'get', resourcePath));
    apiRouter.get(`${resourcePath}/:id`, createHandler(resource, 'get', `${resourcePath}/:id`));
  } else {
    apiRouter.get(resourcePath, createDisabledHandler());
    apiRouter.get(`${resourcePath}/:id`, createDisabledHandler());
  }
  if (resource.resourceController.post !== undefined) {
    apiRouter.post(resourcePath, createHandler(resource, 'post', resourcePath));
  } else {
    apiRouter.post(resourcePath, createDisabledHandler());
  }
  if (resource.resourceController.patch !== undefined) {
    apiRouter.patch(resourcePath, createHandler(resource, 'patch', resourcePath));
    apiRouter.patch(`${resourcePath}/:id`, createHandler(resource, 'patch', `${resourcePath}/:id`));
  } else {
    apiRouter.patch(resourcePath, createDisabledHandler());
    apiRouter.patch(`${resourcePath}/:id`, createDisabledHandler());
  }
  if (resource.resourceController.delete !== undefined) {
    apiRouter.delete(resourcePath, createHandler(resource, 'delete', resourcePath));
    apiRouter.delete(`${resourcePath}/:id`, createHandler(resource, 'delete'));
  } else {
    apiRouter.delete(resourcePath, createDisabledHandler());
    apiRouter.delete(`${resourcePath}/:id`, createDisabledHandler());
  }
});

if (expressCustomization) {
  if (expressCustomization.setupRouterAfterApi
    && typeof (expressCustomization.setupRouterAfterApi) === 'function') {
      expressCustomization.setupRouterAfterApi(apiRouter);
  } else {
    logger.warn(`Found an Iunctio customization file, but it doesn't export the setupRouterAfterApi function`);
  }
}

app.use('/api', apiRouter);
app.listen(port);
logger.info(`=> Iunctio instance is listening on port ${port} <=`);