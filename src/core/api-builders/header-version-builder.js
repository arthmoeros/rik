const express = require('express');
const commonBuilder = require('./common-builder');
const logger = require('../../support/iunctio-logger');
const iunctioHomeManager = require('./../iunctio-home.manager');

let iunctioSettings = iunctioHomeManager.getSettings();

/**
 * Builds the API, expecting a version header
 * 
 * @param {express.Router} apiRouter 
 * @param {*} resourcesObj
 */
function buildApi(apiRouter, resourcesObj) {
  let versionRouters = {};
  for (let version in resourcesObj) {
    let resources = resourcesObj[version];
    let versionRouter = express.Router();

    commonBuilder.setupResourcesRoutes(version, versionRouter, resources);

    versionRouters[version] = versionRouter;
  }

  let versionList = Object.keys(versionRouters);
  let lastVersion = versionList[versionList.length - 1];

  apiRouter.use('', (req, res, next) => {
    let headerVersionName = iunctioSettings.apiVersion.headerName || 'version';
    let defaultVersion = iunctioSettings.apiVersion.headerDefaultVersion || lastVersion;
    let selectedVersion;
    if (req.headers[headerVersionName]) {
      selectedVersion = req.headers[headerVersionName];
    } else {
      if(iunctioSettings.apiVersion.enforceVersionHeader){
        res.status(400);
        res.send(`Version header is required: "${headerVersionName}"`);
        return;
      }
      selectedVersion = defaultVersion;
    }
    if (versionRouters[selectedVersion] === undefined) {
      if (req.headers[headerVersionName]) {
        res.status(400);
        res.send(`Invalid api version header received: "${headerVersionName}: ${selectedVersion}"`);
        return;
      } else {
        res.status(500);
        res.send(`Default api version not found: "${selectedVersion}"`);
        logger.error(
          `Invalid setup, setted default api version does not exists: ${selectedVersion}`,
          'HeaderVersionBuilderMiddleware',
          'ApiVersionCheck'
        );
        return;
      }
    }
    versionRouters[selectedVersion](req, res, next);
  });
}

module.exports.buildApi = buildApi;