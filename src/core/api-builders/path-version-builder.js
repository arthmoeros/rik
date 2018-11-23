const express = require('express');
const CommonBuilder = require('./common-builder');

class PathVersionBuilder {

  constructor(){
    this.commonBuilder = new CommonBuilder();
  }

  buildHealthChecks(apiRouter, resourcesObj){
    for (let version in resourcesObj) {
      let resources = resourcesObj[version];
      let versionRouter = express.Router();
  
      this.commonBuilder.setupHealthCheckRoutes(version, versionRouter, resources);
  
      apiRouter.use(`/${version}`, versionRouter);
    }
  }
  
  /**
   * Builds an API, including the version in the Path
   * 
   * @param {express.Router} apiRouter 
   * @param {*} resourcesObj
   */
  buildApi(apiRouter, resourcesObj) {
    for (let version in resourcesObj) {
      let resources = resourcesObj[version];
      let versionRouter = express.Router();
  
      this.commonBuilder.setupResourcesRoutes(version, versionRouter, resources);
  
      apiRouter.use(`/${version}`, versionRouter);
    }
  }
  
}

module.exports = PathVersionBuilder;