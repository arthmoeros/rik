const express = require('express');

/**
 * 
 * @param {express.Router} router 
 */
function setupRouterBeforeApi(router) {
  router.use((req, res, next) => {
    console.log('Global middleware executed before api router');
    next();
  });
}

/**
 * 
 * @param {express.Router} router 
 */
function setupRouterAfterApi(router) {
  router.use((req, res, next) => {
    console.log('Global middleware executed after api router');
    next();
  });
}

function getCustomLogger(){
  const mylogger = {
    info: (obj) => {
      obj.level = 'info';
      obj.environment = process.env.NODE_ENV;
      console.log(obj);
    },
    warn: (obj) => {
      obj.level = 'warn';
      obj.environment = process.env.NODE_ENV;
      console.log(obj);
    },
    error: (obj) => {
      obj.level = 'error';
      obj.environment = process.env.NODE_ENV;
      console.log(obj);
    }
  };
  return mylogger;
}

module.exports.setupRouterBeforeApi = setupRouterBeforeApi;
module.exports.setupRouterAfterApi = setupRouterAfterApi;
module.exports.getCustomLogger = getCustomLogger;