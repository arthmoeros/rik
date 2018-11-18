const express = require('express');
const commonBuilder = require('./common-builder');

function buildHealthChecks(apiRouter, resourcesObj){
  for (let version in resourcesObj) {
    let resources = resourcesObj[version];
    let versionRouter = express.Router();

    commonBuilder.setupHealthCheckRoutes(version, versionRouter, resources);

    apiRouter.use(`/${version}`, versionRouter);
  }
}

/**
 * Builds an API, including the version in the Path
 * 
 * @param {express.Router} apiRouter 
 * @param {*} resourcesObj
 */
function buildApi(apiRouter, resourcesObj) {
  for (let version in resourcesObj) {
    let resources = resourcesObj[version];
    let versionRouter = express.Router();

    commonBuilder.setupResourcesRoutes(version, versionRouter, resources);

    apiRouter.use(`/${version}`, versionRouter);
  }
}

module.exports.buildHealthChecks = buildHealthChecks;
module.exports.buildApi = buildApi;