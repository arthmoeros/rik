# IUNCTIO
A framework for easy development of REST APIs using an Express definition layer.

***Requires native Async/Await support, Node 8 or later is recommended***

## Why should you should use this
If you want to save yourself the trouble of:
- Setting up Express Routers for an apt REST API.
- Data validation for requests and responses on your API.
- Without losing the capability of customizing the Express main Router.
- Better organization of your API versions

You can use this library, for each resource you only need to:

- Write a js file defining your controller via a ES6 class and four methods: get, post, patch and delete.
- Put it in a "version" folder
- Write schemas using yaml [joi-json](https://github.com/vandium-io/joi-json) based files, for each method and request/response

Having that, Iunctio will start with your resources ready to go.

## Running it
First, install it on your base project:

```
npm install iunctio
```

Iunctio needs to know where to locate the resources, it has three ways to do so:

- First argument on Iunctio command is a relative path from where it is run.
- Environment variable IUNCTIO_HOME is set to an absolute path
- Fallbacks to a folder named "resources" in the working directory where Iunctio command is run

For example:

```bash
# will look for resources at /mydir/arg/otherresources
me@here:/mydir$ node ./node_modules/.bin/./iunctio ./arg/otherresources

# will look for resources at /anywhere/myresources
me@here:/mydir$ export IUNCTIO_HOME=/anywhere/myresources
me@here:/mydir$ node ./node_modules/.bin/./iunctio

# will look for resources at /mydir/resources
me@here:/mydir$ node ./node_modules/.bin/./iunctio
```

## Settings available
Iunctio has a feature for additional configuration using a *settings.yml* file, in the current version supports the following:

```yaml
# API Version configuration
apiVersion:
  # Mode, can be "uri" or "header", affects how api version is exposed and expected
  mode: 'string:regex=^uri|header$,required'
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
Iunctio has two modes of api version exposure, "uri" and "header"

### URI mode
In URI mode, the versioning of the api is denoted in the URI, like this:

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

## Provided Example
In this repository the folder [libtest](libtest) contains a resources folder and a sample http GET request to test it, it can be run using `npm test` here.

## TO-DO

- Selective resource startup via environment (for more granular microservices, ideal for dockerizing).
- Set a healthcheck endpoint using [iunctio-health](https://github.com/arthmoeros/iunctio-health) (yet to be tested).
- Subresources feature (ie: GET /api/v1/mainResource/:id/subResource/:id).
- Unit tests.
- Anything else that may come up.
