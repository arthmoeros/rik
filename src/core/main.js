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

/**
 * @param {function(*,*,*,*)} resourceControllerMethod
 */
function createHandler(resourceControllerMethod) {
  return (req, res) => {
    resourceControllerMethod(req.params, req.query, req.headers, req.body).then((apiResponse) => {
      for (let key in apiResponse.headers) {
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
    router.get(`/${resource.metadata.version}/${resource.metadata.name}`, createHandler(resource.resourceController.get));
  } else {
    router.get(`/${resource.metadata.version}/${resource.metadata.name}`, createDisabledHandler());
  }
  if (resource.resourceController.post !== undefined) {
    router.post(`/${resource.metadata.version}/${resource.metadata.name}`, createHandler(resource.resourceController.post));
  } else {
    router.post(`/${resource.metadata.version}/${resource.metadata.name}`, createDisabledHandler());
  }
  if (resource.resourceController.patch !== undefined) {
    router.patch(`/${resource.metadata.version}/${resource.metadata.name}`, createHandler(resource.resourceController.patch));
  } else {
    router.patch(`/${resource.metadata.version}/${resource.metadata.name}`, createDisabledHandler());
  }
  if (resource.resourceController.delete !== undefined) {
    router.delete(`/${resource.metadata.version}/${resource.metadata.name}`, createHandler(resource.resourceController.delete));
  } else {
    router.delete(`/${resource.metadata.version}/${resource.metadata.name}`, createDisabledHandler());
  }
});

app.use('/api', router);
app.listen(port);