const express = require('express');
const serializeError = require('serialize-error');
const logger = require('../../support/iunctio-logger');
const { resolveSchema, validate } = require('./../schema-validation');
const IunctioHomeManager = require('../iunctio-home.manager');
const debugMode = process.env.IUNCTIO_DEBUG || false;

let iunctioHomeManager = new IunctioHomeManager();

function _createHandler(resource, handlerType) {
  let reqSchema = resolveSchema(resource, handlerType, 'Request');
  let resSchema = resolveSchema(resource, handlerType, 'Response');
  let handler = (req, res, next) => {
    let reqValErrors = validate(reqSchema, req, handlerType, true);
    if (reqValErrors && reqValErrors.error) {
      res.status(400);
      res.send(`Sent request failed schema validation, details -> ${JSON.stringify(reqValErrors)}`);
      next();
      return;
    }
    resource.resourceController[handlerType](req.params, req.query, req.headers, req.body).then((apiResponse) => {
      let respValErrors = validate(resSchema, apiResponse, handlerType, false);
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

function _createDisabledHandler() {
  return (req, res) => {
    res.status(405);
    res.send('This method on the specified resource is not available');
    next();
  }
}

/**
 * Common setup of resources routes for an API
 * 
 * @param {string} version 
 * @param {express.Router} versionRouter 
 * @param {string[]} resources 
 */
function setupResourcesRoutes(version, versionRouter, resources) {
  let expressCustomization = iunctioHomeManager.getExpressCustomization(version);
  if (expressCustomization) {
    if (expressCustomization.setupRouterBeforeApi
      && typeof (expressCustomization.setupRouterBeforeApi) === 'function') {
      expressCustomization.setupRouterBeforeApi(versionRouter);
    } else {
      logger.warn(`Found a Iunctio customization file for ${version}, but it doesn't export the setupRouterBeforeApi function`);
    }
  }

  resources.forEach((resourceName) => {
    let resource = iunctioHomeManager.getResourceConfig(version, resourceName);
    let resourcePath = `/${resource.metadata.name}`;
    let createdMethods = [];
    if (resource.resourceController.get !== undefined) {
      createdMethods.push('get');
      versionRouter.get(resourcePath, _createHandler(resource, 'get', resourcePath, version));
      versionRouter.get(`${resourcePath}/:id`, _createHandler(resource, 'get', `${resourcePath}/:id`, version));
    } else {
      versionRouter.get(resourcePath, _createDisabledHandler());
      versionRouter.get(`${resourcePath}/:id`, _createDisabledHandler());
    }
    if (resource.resourceController.post !== undefined) {
      createdMethods.push('post');
      versionRouter.post(resourcePath, _createHandler(resource, 'post', resourcePath, version));
    } else {
      versionRouter.post(resourcePath, _createDisabledHandler());
    }
    if (resource.resourceController.patch !== undefined) {
      createdMethods.push('patch');
      versionRouter.patch(resourcePath, _createHandler(resource, 'patch', resourcePath, version));
      versionRouter.patch(`${resourcePath}/:id`, _createHandler(resource, 'patch', `${resourcePath}/:id`, version));
    } else {
      versionRouter.patch(resourcePath, _createDisabledHandler());
      versionRouter.patch(`${resourcePath}/:id`, _createDisabledHandler());
    }
    if (resource.resourceController.delete !== undefined) {
      createdMethods.push('delete');
      versionRouter.delete(resourcePath, _createHandler(resource, 'delete', resourcePath, version));
      versionRouter.delete(`${resourcePath}/:id`, _createHandler(resource, 'delete', version));
    } else {
      versionRouter.delete(resourcePath, _createDisabledHandler());
      versionRouter.delete(`${resourcePath}/:id`, _createDisabledHandler());
    }

    logger.info('=== RESOURCE CREATED ===');
    logger.info(`API Version: ${version}`);
    logger.info(`Name: ${resource.metadata.name}`);
    logger.info(`Methods: ${createdMethods}`);
  });

  if (expressCustomization) {
    if (expressCustomization.setupRouterAfterApi
      && typeof (expressCustomization.setupRouterAfterApi) === 'function') {
      expressCustomization.setupRouterAfterApi(versionRouter);
    } else {
      logger.warn(`Found a Iunctio customization file for ${version}, but it doesn't export the setupRouterAfterApi function`);
    }
  }
}

module.exports.setupResourcesRoutes = setupResourcesRoutes;