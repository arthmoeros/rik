#!/usr/bin/env node
const joi = require('joi');
const joiYml = require('joi-yml');
const serializeError = require('serialize-error');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ResourceLoader = require('./resource.loader');
const debugMode = process.env.IUNCTIO_DEBUG || false;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 58080;

var router = express.Router();
let resourceLoader = new ResourceLoader();
let resources = resourceLoader.getAvailableResourcesNames();

function _resolveSchema(resource, handlerType, schemaType){
  let schemaFileName = resource.metadata.schemas[`${handlerType}${schemaType}`];
  if(schemaFileName){
    return joiYml.getBuilt(schemaFileName);
  }else{
    throw new Error(`Schema type ${schemaType} for handler ${handlerType} is undefined!`);
  }
}

function _validate(schema, obj, handlerType, isRequest){
  if(handlerType === 'get' && isRequest){
    return joi.validate(obj.query,schema);
  }else{
    return joi.validate(obj.body,schema);
  }
}

function createHandler(resource, handlerType) {
  let reqSchema = _resolveSchema(resource, handlerType, 'Request');
  let resSchema = _resolveSchema(resource, handlerType, 'Response');
  return (req, res) => {
    let reqValErrors = _validate(reqSchema, req, handlerType, true);
    if(reqValErrors && reqValErrors.error){
      res.status(400);
      res.send(`Sent request failed schema validation, details -> ${JSON.stringify(reqValErrors)}`);
      return;
    }
    resource.resourceController[handlerType](req.params, req.query, req.headers, req.body).then((apiResponse) => {
      let respValErrors = _validate(resSchema, apiResponse, handlerType, false);
      if(respValErrors && respValErrors.error){
        res.status(500);
        res.send(`Response created by service failed schema validation, details -> ${JSON.stringify(respValErrors)}`);
        return;
      }
      for (let key in apiResponse.header) {
        res.setHeader(key, apiResponse.header[key]);
      }
      res.status(apiResponse.statusCode || 200);
      res.send(apiResponse.body);
    }).catch((error) => {
      res.status(500);
      res.send(`An unexpected error has ocurred, details -> ${debugMode ? serializeError(error) : error.message}`);
    });
  };
}

function createDisabledHandler() {
  return (req, res) => {
    res.status(405);
    res.send('This method on the specified resource is not available');
  }
}

resources.forEach((resourceName) => {
  let resource = resourceLoader.getResourceConfig(resourceName);
  if (resource.resourceController.get !== undefined) {
    router.get(`/${resource.metadata.version}/${resource.metadata.name}`, createHandler(resource, 'get'));
    router.get(`/${resource.metadata.version}/${resource.metadata.name}/:id`, createHandler(resource, 'get'));
  } else {
    router.get(`/${resource.metadata.version}/${resource.metadata.name}`, createDisabledHandler());
    router.get(`/${resource.metadata.version}/${resource.metadata.name}/:id`, createDisabledHandler());
  }
  if (resource.resourceController.post !== undefined) {
    router.post(`/${resource.metadata.version}/${resource.metadata.name}`, createHandler(resource, 'post'));
  } else {
    router.post(`/${resource.metadata.version}/${resource.metadata.name}`, createDisabledHandler());
  }
  if (resource.resourceController.patch !== undefined) {
    router.patch(`/${resource.metadata.version}/${resource.metadata.name}`, createHandler(resource, 'patch'));
  } else {
    router.patch(`/${resource.metadata.version}/${resource.metadata.name}`, createDisabledHandler());
  }
  if (resource.resourceController.delete !== undefined) {
    router.delete(`/${resource.metadata.version}/${resource.metadata.name}`, createHandler(resource, 'delete'));
  } else {
    router.delete(`/${resource.metadata.version}/${resource.metadata.name}`, createDisabledHandler());
  }
});

app.use('/api', router);
app.listen(port);