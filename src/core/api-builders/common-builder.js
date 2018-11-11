const express = require('express');
const serializeError = require('serialize-error');
const logger = require('../../support/iunctio-logger');
const { resolveIunctioSchema, validateIunctioObject } = require('./../schema-validation');
const iunctioHomeManager = require('../iunctio-home.manager');
const debugMode = process.env.IUNCTIO_DEBUG || false;

let iunctioSettings = iunctioHomeManager.getSettings();

function _setCorsHandler(router){
  router.options('/*', (req,res,next) => {
    res.setHeader('Access-Control-Allow-Headers', iunctioSettings.cors.allowedHeaders);
    res.setHeader('Access-Control-Allow-Methods', ['head','get','post','patch','delete']);
    res.send();
  });
}

function _createHandler(resource, handlerType) {
  let reqSchema = resolveIunctioSchema(resource, handlerType, 'Request');
  let resSchema = resolveIunctioSchema(resource, handlerType, 'Response');
  let handler = (req, res, next) => {
    let reqValErrors = validateIunctioObject(reqSchema, req, handlerType, true);
    if (reqValErrors && reqValErrors.error) {
      res.status(400);
      res.send(`Sent request failed schema validation, details -> ${JSON.stringify(reqValErrors)}`);
      next();
      return;
    }
    resource.resourceController[handlerType](req.params, req.query, req.headers, req.body).then((apiResponse) => {
      let respValErrors = validateIunctioObject(resSchema, apiResponse, handlerType, false);
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
      logger.error(
        'Unexpected error',
        `ResourceHandler#${resource.metadata.name}.${handlerType}`,
        'Catch',
        error
      )
    });
    next();
  };
  return handler;
}

function _createDisabledHandler() {
  return (req, res, next) => {
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
  _setCorsHandler(versionRouter);

  let iunctioCustomization = iunctioHomeManager.getExpressCustomization(version);
  if (iunctioCustomization) {
    if (iunctioCustomization.setupRouterBeforeApi
      && typeof (iunctioCustomization.setupRouterBeforeApi) === 'function') {
      iunctioCustomization.setupRouterBeforeApi(versionRouter);
    } else {
      logger.warn(
        `Found a Iunctio customization file for ${version}, but it doesn't export the setupRouterBeforeApi function`,
        `SetupResourcesRoutes#${version}`,
        'SetupVersionRouterBeforeApi'
      );
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

    logger.info(
      `Resource created - API Version: ${version}, Name: ${resource.metadata.name}, Methods: ${createdMethods}`,
      `SetupResourcesRoutes#${version}`,
      'SetupVersionRouterApi'
    );
  });

  if (iunctioCustomization) {
    if (iunctioCustomization.setupRouterAfterApi
      && typeof (iunctioCustomization.setupRouterAfterApi) === 'function') {
      iunctioCustomization.setupRouterAfterApi(versionRouter);
    } else {
      logger.warn(
        `Found a Iunctio customization file for ${version}, but it doesn't export the setupRouterAfterApi function`,
        `SetupResourcesRoutes#${version}`,
        'SetupVersionRouterAfterApi'
      );
    }
  }
}

module.exports.setupResourcesRoutes = setupResourcesRoutes;