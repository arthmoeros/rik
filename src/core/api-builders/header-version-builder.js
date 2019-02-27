const express = require('express');
const CommonBuilder = require('./common-builder');
const logger = require('../../support/rik-logger');
const rikHomeManager = require('./../rik-home.manager');

const rikSettings = rikHomeManager.getSettings();

class HeaderVersionBuilder {

  constructor(){
    this.commonBuilder = new CommonBuilder();
  }

  buildHealthChecks(apiRouter, resourcesObj) {
    let versionRouters = {};
    for (let version in resourcesObj) {
      let resources = resourcesObj[version];
      let versionRouter = express.Router();

      this.commonBuilder.setupHealthCheckRoutes(version, versionRouter, resources);

      versionRouters[version] = versionRouter;
    }
    this._setupRouter(apiRouter, versionRouters);
  }

  /**
   * Builds the API, expecting a version header
   * 
   * @param {express.Router} apiRouter 
   * @param {*} resourcesObj
   */
  buildApi(apiRouter, resourcesObj) {
    let versionRouters = {};
    for (let version in resourcesObj) {
      let resources = resourcesObj[version];
      let versionRouter = express.Router();

      this.commonBuilder.setupResourcesRoutes(version, versionRouter, resources);

      versionRouters[version] = versionRouter;
    }

    this._setupRouter(apiRouter, versionRouters);
  }

  _setupRouter(apiRouter, versionRouters) {
    let versionList = Object.keys(versionRouters);
    let lastVersion = versionList[versionList.length - 1];

    apiRouter.use('', (req, res, next) => {
      let headerVersionName = rikSettings.apiVersion.headerName || 'version';
      let defaultVersion = rikSettings.apiVersion.headerDefaultVersion || lastVersion;
      let selectedVersion;
      if (req.headers[headerVersionName]) {
        selectedVersion = req.headers[headerVersionName];
      } else {
        if (rikSettings.apiVersion.enforceVersionHeader) {
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

}

module.exports = HeaderVersionBuilder;