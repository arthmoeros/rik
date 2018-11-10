const express = require('express');
const commonBuilder = require('./common-builder');

/**
 * Builds an API, including the version in the URI
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

module.exports.buildApi = buildApi;