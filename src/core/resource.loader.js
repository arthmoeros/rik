const fs = require('fs');
const jsYaml = require('js-yaml');
const RESOURCES_PATH = process.env.IUNCTIO_HOME || `${process.cwd()}/resources`

if (!RESOURCES_PATH.startsWith('/')) {
  throw new Error('IUNCTIO_HOME must be an absolute path');
}

class ResourceLoader {

  getResourceConfig(name) {
    let resourcePath = `${RESOURCES_PATH}/${name}`;
    let ResourceController = require(`${resourcePath}/controller`);
    let resource = {
      resourceController: new ResourceController(),
      metadata: jsYaml.load(fs.readFileSync(`${resourcePath}/metadata.yml`))
    };
    resource.metadata.name = name;
    let validationErrors = this._checkResourceControllerFunctions(resource);
    if (validationErrors.length > 0) {
      throw new Error(`Encountered validation errors on resource "${resource.metadata.name}":\n${validationErrors.join('\n')}`);
    }
    resource.metadata.schemas = this._initSchemaFilenames(resourcePath);
    return resource;
  }

  _initSchemaFilenames(resourcePath){
    let schemas = {};
    schemas.getRequest = `${resourcePath}/schemas/get.request.yml`;
    schemas.getResponse = `${resourcePath}/schemas/get.response.yml`;
    schemas.postRequest = `${resourcePath}/schemas/post.request.yml`;
    schemas.postResponse = `${resourcePath}/schemas/post.response.yml`;
    schemas.patchRequest = `${resourcePath}/schemas/patch.request.yml`;
    schemas.patchResponse = `${resourcePath}/schemas/patch.response.yml`;
    schemas.deleteRequest = `${resourcePath}/schemas/delete.request.yml`;
    schemas.deleteResponse = `${resourcePath}/schemas/delete.response.yml`;
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

  _checkMethod(resource, method, validationErrors){
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
    return fs.readdirSync(RESOURCES_PATH);
  }

}

module.exports = ResourceLoader;