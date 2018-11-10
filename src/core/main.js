#!/usr/bin/env node
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const IunctioHomeManager = require('./iunctio-home.manager');
const logger = require('../support/iunctio-logger');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let port = process.env.PORT || 58080;

let apiRouter = express.Router();
let iunctioHomeManager = new IunctioHomeManager();
let iunctioSettings = iunctioHomeManager.getSettings();
let resourcesObj = iunctioHomeManager.getAvailableResources();

let expressCustomization = iunctioHomeManager.getExpressCustomization();
if (expressCustomization) {
  if (expressCustomization.setupRouterBeforeApi
    && typeof (expressCustomization.setupRouterBeforeApi) === 'function') {
      expressCustomization.setupRouterBeforeApi(apiRouter);
  } else {
    logger.warn(`Found a global Iunctio customization file, but it doesn't export the setupRouterBeforeApi function`);
  }
}

let apiBuilder;
if(iunctioSettings.apiVersion.mode === 'uri'){
  apiBuilder = require('./api-builders/uri-version-builder');
}else if(iunctioSettings.apiVersion.mode === 'header'){
  apiBuilder = require('./api-builders/header-version-builder');
}else{
  throw new Error(`Unsupported apiVersion mode: ${iunctioSettings.apiVersion.mode}`);
}
apiBuilder.buildApi(apiRouter, resourcesObj);

if (expressCustomization) {
  if (expressCustomization.setupRouterAfterApi
    && typeof (expressCustomization.setupRouterAfterApi) === 'function') {
      expressCustomization.setupRouterAfterApi(apiRouter);
  } else {
    logger.warn(`Found a global Iunctio customization file, but it doesn't export the setupRouterAfterApi function`);
  }
}

app.use('/api', apiRouter);
app.listen(port);
logger.info(`=> Iunctio instance is listening on port ${port} <=`);