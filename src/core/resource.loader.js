const fs = require('fs');
const path = require('path');
const jsYaml = require('js-yaml');
const logger = require('../support/iunctio-logger');
let argumentIunctioHome = process.argv[2];
if (argumentIunctioHome) {
  if (!path.isAbsolute(argumentIunctioHome)) {
    argumentIunctioHome = path.join(process.cwd(),argumentIunctioHome);
  }
}
const RESOURCES_PATH = argumentIunctioHome || process.env.IUNCTIO_HOME || path.join(process.cwd(),'resources')

if (!path.isAbsolute(RESOURCES_PATH)) {
  throw new Error('IUNCTIO_HOME must be an absolute path');
}

if (!fs.existsSync(RESOURCES_PATH)) {
  throw new Error(`Couldn't find the resources path folder -> ${RESOURCES_PATH}`);
}

logger.info(`Using resources from ${RESOURCES_PATH}`);

class ResourceLoader {

  getResourceConfig(name) {
    let resourcePath = path.join(RESOURCES_PATH,name);
    let ResourceController = require(path.join(resourcePath,'controller'));
    let resource = {
      resourceController: new ResourceController(),
      metadata: jsYaml.load(fs.readFileSync(path.join(resourcePath,'metadata.yml')))
    };
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
    schemas.getRequest = path.join(resourcePath,'schemas','get.request.yml');
    schemas.getResponse = path.join(resourcePath,'schemas','get.response.yml');
    schemas.postRequest = path.join(resourcePath,'schemas','post.request.yml');
    schemas.postResponse = path.join(resourcePath,'schemas','post.response.yml');
    schemas.patchRequest = path.join(resourcePath,'schemas','patch.request.yml');
    schemas.patchResponse = path.join(resourcePath,'schemas','patch.response.yml');
    schemas.deleteRequest = path.join(resourcePath,'schemas','delete.request.yml');
    schemas.deleteResponse = path.join(resourcePath,'schemas','delete.response.yml');
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

  getAvailableResourcesNames() {
    const dir = fs.readdirSync(RESOURCES_PATH);
    const resources = [];
    dir.forEach((elem) => {
      if (fs.lstatSync(path.join(RESOURCES_PATH, elem)).isDirectory()) {
        resources.push(elem);
      }
    });
    return resources;
  }

  getExpressCustomization() {
    let customizationPath = path.join(RESOURCES_PATH, 'iunctio-customization');
    if (fs.existsSync(`${customizationPath}.js`)) {
      return require(customizationPath);
    }
    return undefined;
  }

}

module.exports = ResourceLoader;