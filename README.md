# IUNCTIO
A library for easy development of REST APIs using an Express definition layer.

***Requires native Async/Await support, Node 8 or later is recommended***

## Why should I use this?
If you want to save yourself the trouble of:
- Setting up Express Routes for an apt REST API.
- Data validation for requests and responses on your API.
- Without losing the capability of customizing the Express main Router.

You can use this library, for each resource you only need to:

- Write a js file defining your controller via a ES6 class and four methods: get, post, patch and delete.
- Write a small yaml file describing its metadata (for now only version number is required).
- Write schemas using yaml joi-json based files, for each method and request/response

Having that, Iunctio will start with your resource ready to go.

## How to start it?
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

## Can I add middlewares to the main Express Router before and after Iunctio sets the API?
Yes, you can do so adding a **iunctio-customization.js** file at the root of your resources folder. Iunctio will look for this file and expect the *setupRouterBeforeApi* and *setupRouterAfterApi* functions to be exported and expect an Express Router as the only parameter.

Those functions will be called before and after (respectively) Iunctio sets up the methods for your API on the main Router.

## Is there an example of this?
Yes, in this repository the folder [libtest](libtest) contains a resources folder and a sample http GET request to test it, it can be run using `npm test` here.

## TO-DO

- Set a healthcheck endpoint using [iunctio-health](https://github.com/arthmoeros/iunctio-health) (yet to be tested).
- Implement a custom logger feature (for now it only sends logging to console).
- Subresources feature (ie: GET /api/v1/mainResource/:id/subResource/:id)
- Anything else that may come up.
