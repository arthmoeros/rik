const express = require('express');
const serializeError = require('serialize-error');
const rikHealth = require('rik-health');
const logger = require('../../support/rik-logger');
const SchemaValidation = require('./../schema-validation');
const rikHomeManager = require('../rik-home.manager');

const debugMode = process.env.RIK_DEBUG || false;
const selectedResources = process.env.RIK_RESOURCES ? process.env.RIK_RESOURCES.split(',') : undefined;
const rikSettings = rikHomeManager.getSettings();

class CommonBuilder {

  constructor(){
    this.schemaValidation = new SchemaValidation();
  }

  /**
   * Common setup of healthcheck endpoints
   * @param {string} version 
   * @param {express.Router} router 
   * @param {string[]} resources 
   */
  setupHealthCheckRoutes(version, router, resources) {
    resources.forEach((resourceName) => {
      if (this._checkSelectiveResourceLoading(resourceName)) {
        return;
      }
      let healthCheck = rikHomeManager.getHealthCheck(version, resourceName);
      if (healthCheck) {
        rikHealth(router, resourceName, healthCheck, logger);
      }
    });
  }

  /**
   * Common setup of resources routes for an API
   * 
   * @param {string} version 
   * @param {express.Router} versionRouter 
   * @param {string[]} resources 
   */
  setupResourcesRoutes(version, versionRouter, resources) {
    this._setCorsHandler(versionRouter);

    let rikCustomization = rikHomeManager.getExpressCustomization(version);
    if (rikCustomization) {
      if (rikCustomization.setupRouterBeforeApi
        && typeof (rikCustomization.setupRouterBeforeApi) === 'function') {
        rikCustomization.setupRouterBeforeApi(versionRouter);
      } else {
        logger.warn(
          `Found a RIK customization file for ${version}, but it doesn't export the setupRouterBeforeApi function`,
          `SetupResourcesRoutes#${version}`,
          'SetupVersionRouterBeforeApi'
        );
      }
    }

    resources.forEach((resourceName) => {
      if (this._checkSelectiveResourceLoading(resourceName)) {
        return;
      }
      let resource = rikHomeManager.getResourceConfig(version, resourceName);
      let createdMethods = this._setResourceVerbsHandlers(versionRouter, resource, resources);
      logger.info(
        `Resource created - API Version: ${version}, Name: ${resource.metadata.name}, Methods: ${createdMethods}`,
        `SetupResourcesRoutes#${version}`,
        'SetupVersionRouterApi'
      );
    });

    if (rikCustomization) {
      if (rikCustomization.setupRouterAfterApi
        && typeof (rikCustomization.setupRouterAfterApi) === 'function') {
        rikCustomization.setupRouterAfterApi(versionRouter);
      } else {
        logger.warn(
          `Found a RIK customization file for ${version}, but it doesn't export the setupRouterAfterApi function`,
          `SetupResourcesRoutes#${version}`,
          'SetupVersionRouterAfterApi'
        );
      }
    }
  }

  _setCorsHandler(router) {
    router.options('/*', (req, res, next) => {
      res.setHeader('Access-Control-Allow-Headers', rikSettings.cors.allowedHeaders);
      res.setHeader('Access-Control-Allow-Methods', ['HEAD', 'GET', 'POST', 'PATCH', 'DELETE', 'PUT']);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send();
    });
  }

  _createHandler(resource, handlerType) {
    let reqSchema = this.schemaValidation.resolveRIKSchema(resource, handlerType, 'Request');
    let resSchema = this.schemaValidation.resolveRIKSchema(resource, handlerType, 'Response');
    let handler = (req, res, next) => {
      let reqValErrors = this.schemaValidation.validateRIKObject(reqSchema, req, handlerType, true);
      if (reqValErrors && reqValErrors.error) {
        res.status(400);
        res.send(`Sent request failed schema validation, details -> ${JSON.stringify(reqValErrors)}`);
        next();
        return;
      }
      resource.resourceController[handlerType](req.params, req.query, req.headers, req.body).then((apiResponse) => {
        res.setHeader('Access-Control-Allow-Headers', rikSettings.cors.allowedHeaders);
        res.setHeader('Access-Control-Allow-Methods', ['HEAD', 'GET', 'POST', 'PATCH', 'DELETE', 'PUT']);
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (apiResponse.statusCode
          && apiResponse.statusCode !== 200
          && apiResponse.statusCode !== 201) {
          res.status(apiResponse.statusCode);
          res.send(apiResponse.body);
          next();
          return;
        }
        let respValErrors = this.schemaValidation.validateRIKObject(resSchema, apiResponse, handlerType, false);
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

  _createDisabledHandler() {
    return (req, res, next) => {
      res.status(405);
      res.send('This method on the specified resource is not available');
      next();
    }
  }

  _checkSelectiveResourceLoading(resourceName) {
    if (selectedResources && selectedResources.length > 0 && selectedResources.indexOf(resourceName) === -1) {
      return true;
    } else {
      return false;
    }
  }

  _setResourceVerbsHandlers(versionRouter, resource, resources) {
    let verbs = ['get', 'post', 'patch', 'delete'];
    let createdMethods = [];
    verbs.forEach((verb) => {
      let withParam = verb === 'get' || verb === 'patch' || verb === 'delete' ? true : false;
      let resourcePath = `/${resource.metadata.name}`;
      let parentResourcePath = `/${resource.metadata.subOf}`;

      if (resource.resourceController[verb] !== undefined) {
        let handler = this._createHandler(resource, verb);
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
        versionRouter[verb](resourcePath, this._createDisabledHandler());
        if (withParam) {
          versionRouter[verb](`${resourcePath}/:${resource.metadata.name}`, this._createDisabledHandler());
        }
      }
    });
    return createdMethods;
  }
}


module.exports = CommonBuilder;