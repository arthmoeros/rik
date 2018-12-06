# IUNCTIO
A framework for easy development of REST APIs using an Express definition layer.

***Requires native Async/Await support, Node 8 or later is recommended***

**WARNING!, breaking changes in 1.1, resources now must be put inside a "resources" folder inside the "version" folder**

## Why should you should use this
If you want to save yourself the trouble of:
- Setting up Express Routers for an apt REST API.
- Data validation for requests and responses on your API.
- Without losing the capability of customizing the Express main Router.
- Better organization of your API versions.

You can use this library, for each resource you only need to:

- Write a js file defining your controller via a ES6 class and four methods: get, post, patch and delete.
- Put it in a "version"/resources folder.
- Write schemas using yaml [joi-json](https://github.com/vandium-io/joi-json) based files, for each method and request/response.

Having that, Iunctio will start with your resources ready to go, or said in another way...

Having this controller and its validation schemas...

![Example Step 1 Iunctio](https://raw.githubusercontent.com/arthmoeros/iunctio/master/docs/aux1.png)


You will have a working API like this...

![Example Step 2 Iunctio](https://raw.githubusercontent.com/arthmoeros/iunctio/master/docs/aux2.png)

## Running it
First, install it on your base project:

```
npm install iunctio
```

Iunctio needs to know where to locate the iunctio_home, it has three ways to do so:

- First argument on **iunctio** command is a relative path from where it is run.
- Environment variable IUNCTIO_HOME is set to an absolute path
- Fallbacks to a folder named "iunctio" in the working directory where **iunctio** command is run

For example:

```bash
# will look for resources at /mydir/arg/otheriunctio
me@here:/mydir$ node ./node_modules/.bin/./iunctio ./arg/otheriunctio

# will look for resources at /anywhere/myiunctio
me@here:/mydir$ export IUNCTIO_HOME=/anywhere/myiunctio
me@here:/mydir$ node ./node_modules/.bin/./iunctio

# will look for resources at /mydir/iunctio
me@here:/mydir$ node ./node_modules/.bin/./iunctio
```

## Settings available
Iunctio has a feature for additional configuration using a *settings.yml* file, in the current version supports the following:

```yaml
# API Version configuration
apiVersion:
  # Mode, can be "path" or "header", affects how api version is exposed and expected
  mode: 'string:regex=^path|header$,required'
  # If mode is set to "header" sets the name of the expected header with version
  headerName: 'string:regex=^[a-zA-Z0-9_-]*$'
  # If mode is set to "header" sets a default version in case the header is not sent
  headerDefaultVersion: 'string:regex=^v[0-9]*$'
  # If mode is set to "header", enforces the presence of the version header in each request (default is false)
  enforceVersionHeader: 'boolean'
# CORS configuration
cors:
  '@required': true
  # Headers to be added to the Access-Control-Allow-Headers header, default is no headers
  allowedHeaders: 'array:required'
```

This file must be located at the root of the resources folder.

## API Version handling
Iunctio has two modes of api version exposure, "path" and "header"

### Path mode
In Path mode, the versioning of the api is denoted in the Path, like this:

(Customer Resource): /api/**v1**/customer

This mode implicitly enforces that a required api version is specified by the client.

### Header mode
In header mode, the versioning of the api is handled by a header, for example:

```http
GET http://myapi:58080/api/customer
Content-Type: application/json
Version: v1
```

This mode by default supports the absence of the version header providing a default version (if not specified in the settings, assumes the latest available), allowing the client to not specify the expected version. However if the setting *apiVersion.enforceVersionHeader* is set to **true**, it will respond with a *400 Bad request* asking for the explicit version header.

## Resource Controller methods
Each resource must contain a *controller.js* file, which must export an ES6 class that can contain up to four methods related to the supported http verbs: get, post, patch and delete. Each method must declare four arguments (even if in some cases some may never be used):

- params (URL parameters)
- query (query string values)
- header (sent headers)
- body (sent http request body parsed to json)

In general the params argument will only contain the URL parameter matching the resource name, intended for example, getting a specific instance of the resource in a GET request. It may also contain another parameter if the request is done in a subresource context (see Subresource definition below).

## Subresource definition
A resource can be declared as usable as a subresource of another resource, this can be achieved by simply adding the following line in the resource controller file before the export:

```js
Controller.subOf = 'customer';
module.exports = Controller;
```

This will inject the **subOf** value to the resource controller instance, which will be used to also set a subresource endpoint for the resource controller, resulting in two endpoints to the same resource, for example...

```
Resource "customer"
Resource "contact" -> Declares subOf "customer"

Produces the endpoints
(GET,POST,PATCH,DELETE) /api/contact/
(GET,PATCH,DELETE) /api/contact/:contact
(GET,POST,PATCH,DELETE) /api/customer/:customer/contact/
(GET,PATCH,DELETE) /api/customer/:customer/contact/:contact
```

Then each method in the resource controller must handle both cases, when it receives only the "contact" parameter or both the "contact" and "customer" parameters.

## Selective resource loading
If you have a baseline project with multiple resources but you need to distribute the resource loading across different Iunctio instances (like in Docker containers/services), you can indicate to Iunctio via an environment variable which resources must be loaded on a specific Iunctio instance execution.

This can be achieved through setting of the environment variable *IUNCTIO_RESOURCES*, containing an string with the resources names to be loaded, separated by comma.

```bash
export IUNCTIO_RESOURCES=customer,account,contact
```

Any other existing resources in the resources folder will be skipped in the resource loading stage, if a specified resource in *IUNCTIO_RESOURCES* doesn't exists in the resources folder there is no effect.

## Extending the pre-setted Express Routers
Iunctio lifecycle allows for additional setups to the main Express Router and for each version Express Router, providing an **iunctio-customization.js** file, which must export the *setupRouterBeforeApi* and *setupRouterAfterApi* functions, depending where you put this file (or multiple ones), they will affect the Express middleware order in different ways, to put it simply in a normal case, the order is:

1. Iunctio receives a request
2. Global middlewares set before the main Router are run (file is located at the root of the resources folder)
3. Version middlewares set before the version Router are run (file is located at the version folder)
4. The specific method of the specified resource is run
5. Iunctio sends back the response
6. Version middlewares set after the version Router are run (file is located at the version folder)
7. Global middlewares set after the main Router are run (file is located at the root of the resources folder)

Iunctio sends the specific Router to each *setupRouterBeforeApi* and *setupRouterAfterApi* functions.

## Logging handling 
By default all logging is sent to console.log in a specific format using only info, warn and error levels.
Every log message contains four attributes: message, component, stage and error object (last one only for warn and error levels).

The format is: `LEVEL [COMPONENT:STAGE:TIMESTAMP] MESSAGE ERROR`

However, it is possible to implement a custom logger to extend the logging handling to a file or whatever the user of the library sees fit. Using the *"root"* **iunctio-customization.js** file, a function named *getCustomLogger* can be exported and Iunctio will use the object that returns to call the info, warn and error methods that contains. It will send the same object that is handled by the default logger.
```js
{
    message,
    component,
    stage,
    error
}
```

Then the library user can redirect the data for each level to the logging library that fits their requirements.

## Enabling HealthCheck
Iunctio uses the [iunctio-health](https://github.com/arthmoeros/iunctio-health) utility for healthcheck endpoint setup, if a resource contains a *healthcheck.yml* file, Iunctio will expect it to comply with the following schema and load it using the [iunctio-health](https://github.com/arthmoeros/iunctio-health) utility.

```yaml
dependencies:
  '@items':
    name: 'string:required'
    endpoint: 'string:required'
    timeout: 'number:required'
    expectedStatusCode: 'number:required'
```

## Provided Example
In this repository the folder [libtest](libtest) contains a iunctio folder and a sample http GET request to test it, it can be run using `npm run libtest-start` here.

## TO-DO

- Refactoring Unit tests.
- Anything else that may come up.
