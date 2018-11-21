const express = require('express');
const serializeError = require('serialize-error');
const iunctioHealth = require('iunctio-health');
const logger = require('../../support/iunctio-logger');
const { resolveIunctioSchema, validateIunctioObject } = require('./../schema-validation');
const iunctioHomeManager = require('../iunctio-home.manager');
const debugMode = process.env.IUNCTIO_DEBUG || false;
const selectedResources = process.env.IUNCTIO_RESOURCES ? process.env.IUNCTIO_RESOURCES.split(',') : undefined;

let iunctioSettings = iunctioHomeManager.getSettings();

function _setCorsHandler(router) {
  router.options('/*', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', iunctioSettings.cors.allowedHeaders);
    res.setHeader('Access-Control-Allow-Methods', ['head', 'get', 'post', 'patch', 'delete']);
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
      if (apiResponse.statusCode
        && apiResponse.statusCode !== 200
        && apiResponse.statusCode !== 201) {
        res.status(apiResponse.statusCode);
        res.send(apiResponse.body);
        next();
        return;
      }
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
      next();
    }).catch((error) => {
      res.status(500);
      res.send(`An unexpected error has ocurred, details -> ${debugMode ? JSON.stringify(serializeError(error)) : error.message}`);
      logger.error(
        'Unexpected error',
        `ResourceHandler#${resource.metadata.name}.${handlerType}`,
        'Catch',
        error
      );
      next();
    });
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

function _checkSelectiveResourceLoading(resourceName) {
  if (selectedResources && selectedResources.length > 0 && selectedResources.indexOf(resourceName) === -1) {
    return true;
  } else {
    return false;
  }
}

function setupHealthCheckRoutes(version, router, resources) {
  resources.forEach((resourceName) => {
    if (_checkSelectiveResourceLoading(resourceName)) {
      return;
    }
    let healthCheck = iunctioHomeManager.getHealthCheck(version, resourceName);
    if (healthCheck) {
      iunctioHealth(router, resourceName, healthCheck, logger);
    }
  });
}

function _setResourceVerbsHandlers(versionRouter, resource, resources) {
  let verbs = ['get', 'post', 'patch', 'delete'];
  let createdMethods = [];
  verbs.forEach((verb) => {
    let withParam = verb === 'get' || verb === 'patch' || verb === 'delete' ? true : false;
    let resourcePath = `/${resource.metadata.name}`;
    let parentResourcePath = `/${resource.metadata.subOf}`;

    if (resource.resourceController[verb] !== undefined) {
      let handler = _createHandler(resource, verb);
      versionRouter[verb](resourcePath, handler);
      if (withParam) {
        versionRouter[verb](`${resourcePath}/:${resource.metadata.name}`, handler);
      }
      createdMethods.push(verb);
      if (resource.metadata.subOf !== undefined && resources.indexOf(resource.metadata.subOf) !== -1) {
        versionRouter[verb](`${parentResourcePath}/:${resource.metadata.subOf}/${resource.metadata.name}`, handler);
        if (withParam) {
          versionRouter[verb](`${parentResourcePath}/:${resource.metadata.subOf}/${resource.metadata.name}/:${resource.metadata.name}`, handler);
        }
        createdMethods.push(`${verb}(sub of ${resource.metadata.subOf})`);
      }
    } else {
      versionRouter[verb](resourcePath, _createDisabledHandler());
      if (withParam) {
        versionRouter[verb](`${resourcePath}/:${resource.metadata.name}`, _createDisabledHandler());
      }
    }
  });
  return createdMethods;
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
    if (_checkSelectiveResourceLoading(resourceName)) {
      return;
    }
    let resource = iunctioHomeManager.getResourceConfig(version, resourceName);
    let createdMethods = _setResourceVerbsHandlers(versionRouter, resource, resources);
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

module.exports.setupHealthCheckRoutes = setupHealthCheckRoutes;
module.exports.setupResourcesRoutes = setupResourcesRoutes;