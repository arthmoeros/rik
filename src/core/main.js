#!/usr/bin/env node
const logger = require('../support/rik-logger');
const express = require('express');
const setup = require('./setup');
const bodyParser = require('body-parser');

function main(){
  try {
    setup();
    const rikHomeManager = require('./rik-home.manager');
    const app = express();
  
    let rikCustomization = rikHomeManager.getExpressCustomization();
    if (rikCustomization && rikCustomization.getCustomLogger) {
      logger.setCustomLogger(rikCustomization.getCustomLogger());
    }
  
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
  
    let port = process.env.PORT || 58080;
  
    let apiRouter = express.Router();
    let rikSettings = rikHomeManager.getSettings();
    let resourcesObj = rikHomeManager.getAvailableResources();
    
    let ApiBuilderType;
    if (rikSettings.apiVersion.mode === 'path') {
      ApiBuilderType = require('./api-builders/path-version-builder');
    } else if (rikSettings.apiVersion.mode === 'header') {
      ApiBuilderType = require('./api-builders/header-version-builder');
    } else {
      throw new Error(`Unsupported apiVersion mode: ${rikSettings.apiVersion.mode}`);
    }
    
    let apiBuilder = new ApiBuilderType();
    apiBuilder.buildHealthChecks(apiRouter, resourcesObj);
  
    if (rikCustomization) {
      if (rikCustomization.setupRouterBeforeApi
        && typeof (rikCustomization.setupRouterBeforeApi) === 'function') {
        rikCustomization.setupRouterBeforeApi(apiRouter);
      } else {
        logger.warn(
          `Found a global RIK customization file, but it doesn't export the setupRouterBeforeApi function`,
          'Main',
          'SetupMainRouterBeforeApi'
        );
      }
    }
  
    apiBuilder.buildApi(apiRouter, resourcesObj);
  
    if (rikCustomization) {
      if (rikCustomization.setupRouterAfterApi
        && typeof (rikCustomization.setupRouterAfterApi) === 'function') {
        rikCustomization.setupRouterAfterApi(apiRouter);
      } else {
        logger.warn(
          `Found a global RIK customization file, but it doesn't export the setupRouterAfterApi function`,
          'Main',
          'SetupMainRouterAfterApi'
        );
      }
    }
  
    app.use('/api', apiRouter);
    let server = app.listen(port);
    logger.info(
      `RIK instance is listening on port ${port}`,
      'Main',
      'RIKStarted'
    );
    process.on('SIGINT', closeServerCallback(server, 'SIGINT'));
    process.on('SIGTERM', closeServerCallback(server, 'SIGTERM'));
  } catch (error) {
    logger.error(
      'Unhandled Error',
      'Main',
      'Catch',
      error
    );
    throw error;
  }
}

function closeServerCallback(server, signal){
  return () => {
    server.close();
    logger.info(
      `${signal} received, stopped RIK instance`,
      'Main',
      'closeServerCallback'
    );
  }
}

main();
module.exports = main;