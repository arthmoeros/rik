const express = require('express');

/**
 * 
 * @param {express.Router} router 
 */
function setupRouterBeforeApi(router) {
  router.use((req, res, next) => {
    console.log('v1 middleware executed before api router');
    next();
  });
}

/**
 * 
 * @param {express.Router} router 
 */
function setupRouterAfterApi(router) {
  router.use((req, res, next) => {
    console.log('v1 middleware executed after api router');
    next();
  });
}

module.exports.setupRouterBeforeApi = setupRouterBeforeApi;
module.exports.setupRouterAfterApi = setupRouterAfterApi;