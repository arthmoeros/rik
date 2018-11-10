const fs = require('fs');
const path = require('path');
const jsYaml = require('js-yaml');
const logger = require('../support/iunctio-logger');

const REGEX_API_VERSION = /v[0-9]*/;

let argumentIunctioHome = process.argv[2];
if (argumentIunctioHome) {
  if (!path.isAbsolute(argumentIunctioHome)) {
    argumentIunctioHome = path.join(process.cwd(), argumentIunctioHome);
  }
}
const RESOURCES_PATH = argumentIunctioHome || process.env.IUNCTIO_HOME || path.join(process.cwd(), 'resources')

if (!path.isAbsolute(RESOURCES_PATH)) {
  throw new Error('IUNCTIO_HOME must be an absolute path');
}

if (!fs.existsSync(RESOURCES_PATH)) {
  throw new Error(`Couldn't find the resources path folder -> ${RESOURCES_PATH}`);
}

logger.info(`Using resources from ${RESOURCES_PATH}`);

let settingsFilePath = path.join(RESOURCES_PATH, 'settings.yml');
let settings;
if(fs.existsSync(settingsFilePath)){
  settings = jsYaml.load(fs.readFileSync(path.join(RESOURCES_PATH, 'settings.yml')));
}else{
  logger.warn(`Couldn't locate Iunctio settings file at: ${settingsFilePath}, using fallback settings instead`);
  settings = {
    apiVersion: {
      mode: 'uri'
    }
  };
}

logger.info(`Iunctio will use API Version mode: ${settings.apiVersion.mode || 'uri'}`);

class IunctioHomeManager {

  getResourceConfig(version, name) {
    let resourcePath = path.join(RESOURCES_PATH, version, name);
    let ResourceController = require(path.join(resourcePath, 'controller'));
    let resource = {
      resourceController: new ResourceController(),
      metadata: {}
    };
    //jsYaml.load(fs.readFileSync(path.join(resourcePath, 'metadata.yml')))
    resource.metadata.name = name;
    let validationErrors = this._checkResourceControllerFunctions(resource);
    if (validationErrors.length > 0) {
      throw new Error(`Encountered validation errors on resource "${resource.metadata.name}":\n${validationErrors.join('\n')}`);
    }
    resource.metadata.schemas = this._initSchemaFilenames(resourcePath);
    return resource;
  }

  _initSchemaFilenames(resourcePath) {
    let schemas = {};
    schemas.getRequest = path.join(resourcePath, 'schemas', 'get.request.yml');
    schemas.getResponse = path.join(resourcePath, 'schemas', 'get.response.yml');
    schemas.postRequest = path.join(resourcePath, 'schemas', 'post.request.yml');
    schemas.postResponse = path.join(resourcePath, 'schemas', 'post.response.yml');
    schemas.patchRequest = path.join(resourcePath, 'schemas', 'patch.request.yml');
    schemas.patchResponse = path.join(resourcePath, 'schemas', 'patch.response.yml');
    schemas.deleteRequest = path.join(resourcePath, 'schemas', 'delete.request.yml');
    schemas.deleteResponse = path.join(resourcePath, 'schemas', 'delete.response.yml');
    return schemas;
  }

  _checkResourceControllerFunctions(resource) {
    let validationErrors = [];
    this._checkMethod(resource, 'get', validationErrors);
    this._checkMethod(resource, 'post', validationErrors);
    this._checkMethod(resource, 'patch', validationErrors);
    this._checkMethod(resource, 'delete', validationErrors);
    return validationErrors;
  }

  _checkMethod(resource, method, validationErrors) {
    let resourceController = resource.resourceController;
    if (resourceController[method] !== undefined) {
      if (resourceController[method].length !== 4) {
        validationErrors.push(this._methodArgsErrorMsg(method));
      }
      if (!resourceController[method].toString().startsWith('async')) {
        validationErrors.push(this._methodNotAsyncErrorMsg(method));
      }
    }
  }

  _methodArgsErrorMsg(method) {
    return `The "${method}" method of the ResourceController doesn't expect four arguments`;
  }

  _methodNotAsyncErrorMsg(method) {
    return `The "${method}" method of the ResourceController isn't declared as async`;
  }

  getAvailableResources() {
    const versionsList = fs.readdirSync(RESOURCES_PATH);
    const resourcesObj = {};
    versionsList.forEach((versionDirName) => {
      let versionDir = path.join(RESOURCES_PATH, versionDirName);
      if (fs.lstatSync(versionDir).isDirectory()) {
        if (REGEX_API_VERSION.test(versionDirName)) {
          resourcesObj[versionDirName] = [];
          let resourcesList = fs.readdirSync(versionDir);
          resourcesList.forEach((resourceDirName) => {
            let resourceDir = path.join(versionDir, resourceDirName);
            if (fs.lstatSync(resourceDir).isDirectory()) {
              if (fs.existsSync(path.join(resourceDir, 'controller.js'))) {
                resourcesObj[versionDirName].push(resourceDirName);
              } else {
                logger.warn(`Ignoring directory '${path.join(versionDirName, resourceDirName)}' found at resources path (it lacks a controller.js file)`);
              }
            }
          });
        } else {
          logger.warn(`Ignoring directory '${elem}' found at resources path (it doesn't have version format)`);
        }
      }
    });
    return resourcesObj;
  }

  getExpressCustomization(versionPath) {
    if(versionPath === undefined){
      versionPath = '';
    }
    let customizationPath = path.join(RESOURCES_PATH, versionPath, 'iunctio-customization');
    if (fs.existsSync(`${customizationPath}.js`)) {
      return require(customizationPath);
    }
    return undefined;
  }

  getSettings(){
    return settings;
  }

}

module.exports = IunctioHomeManager;