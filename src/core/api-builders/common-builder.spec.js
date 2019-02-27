const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require('sinon');

describe('CommonBuilder', () => {

  beforeEach(() => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });
    mockery.registerMock('../../support/rik-logger', {
      info: () => { },
      warn: () => { },
      error: () => { },
    });
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('Should successfully setupHealthCheckRoutes, set healthcheck, without selectedResources', () => {
    delete process.env.RIK_RESOURCES;
    class SchemaValidationMock { };
    let rikHomeManagerMock = {
      getHealthCheck: () => ({}),
      getSettings: sinon.spy()
    };
    sinon.spy(rikHomeManagerMock, 'getHealthCheck');
    let rikHealthMock = sinon.spy();
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);
    mockery.registerMock('rik-health', rikHealthMock);

    const CommonBuilder = require('./common-builder');

    let router = {};
    let resources = ['customer', 'contact'];

    let builder = new CommonBuilder();
    builder.setupHealthCheckRoutes('v1', router, resources);

    expect(rikHomeManagerMock.getHealthCheck.called, 'Expect rikHomeManagerMock.getHealthCheck to be called').to.be.true;
    expect(rikHealthMock.called, 'Expect rikHealthMock to be called').to.be.true;
  });

  it('Should successfully setupHealthCheckRoutes, unset healthcheck, without selectedResources', () => {
    delete process.env.RIK_RESOURCES;
    class SchemaValidationMock { };
    let rikHomeManagerMock = {
      getHealthCheck: () => undefined,
      getSettings: sinon.spy()
    };
    sinon.spy(rikHomeManagerMock, 'getHealthCheck');
    let rikHealthMock = sinon.spy();
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);
    mockery.registerMock('rik-health', rikHealthMock);

    const CommonBuilder = require('./common-builder');

    let router = {};
    let resources = ['customer', 'contact'];

    let builder = new CommonBuilder();
    builder.setupHealthCheckRoutes('v1', router, resources);

    expect(rikHomeManagerMock.getHealthCheck.called, 'Expect rikHomeManagerMock.getHealthCheck to be called').to.be.true;
    expect(rikHealthMock.notCalled, 'Expect rikHealthMock to not be called').to.be.true;
  });

  it('Should successfully setupHealthCheckRoutes, unset healthcheck, with selectedResources', () => {
    delete process.env.RIK_RESOURCES;
    process.env.RIK_RESOURCES = 'customer';
    class SchemaValidationMock { };
    let rikHomeManagerMock = {
      getHealthCheck: () => undefined,
      getSettings: sinon.spy()
    };
    sinon.spy(rikHomeManagerMock, 'getHealthCheck');
    let rikHealthMock = sinon.spy();
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);
    mockery.registerMock('rik-health', rikHealthMock);

    const CommonBuilder = require('./common-builder');

    let router = {};
    let resources = ['customer', 'contact'];

    let builder = new CommonBuilder();
    builder.setupHealthCheckRoutes('v1', router, resources);

    expect(rikHomeManagerMock.getHealthCheck.called, 'Expect rikHomeManagerMock.getHealthCheck to be called').to.be.true;
    expect(rikHealthMock.notCalled, 'Expect rikHealthMock to not be called').to.be.true;
  });

  it('Should successfully setupResourcesRoutes, with rik customization(before and after), with selectedResources, all verbs set', () => {
    delete process.env.RIK_RESOURCES;
    process.env.RIK_RESOURCES = 'customer';
    let rikCustomizationMock = {
      setupRouterBeforeApi: sinon.spy(),
      setupRouterAfterApi: sinon.spy()
    };
    let resourceConfigMock = {
      metadata: {
        name: 'mock'
      },
      resourceController: {
        get: sinon.spy(),
        post: sinon.spy(),
        patch: sinon.spy(),
        delete: sinon.spy()
      }
    }
    class SchemaValidationMock {
      resolveRIKSchema() {

      }
      validateRIKObject() {

      }
    };
    let rikHomeManagerMock = {
      getExpressCustomization: () => rikCustomizationMock,
      getResourceConfig: () => resourceConfigMock,
      getSettings: () => ({
        cors: []
      })
    };
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);

    const CommonBuilder = require('./common-builder');

    let router = {
      options: sinon.spy(),
      get: sinon.spy(),
      post: sinon.spy(),
      patch: sinon.spy(),
      delete: sinon.spy()
    };
    let resources = ['customer', 'contact'];

    let builder = new CommonBuilder();
    builder.setupResourcesRoutes('v1', router, resources);

    expect(rikCustomizationMock.setupRouterBeforeApi.called, 'Expect rikCustomizationMock.setupRouterBeforeApi to be called').to.be.true;
    expect(rikCustomizationMock.setupRouterAfterApi.called, 'Expect rikCustomizationMock.setupRouterAfterApi to be called').to.be.true;
    expect(router.options.args[0][1], 'Expect router.options to be called with a function').to.not.be.undefined;
    expect(router.get.args[0][1], 'Expect router.get to be called').to.not.be.undefined;
    expect(router.post.args[0][1], 'Expect router.post to be called').to.not.be.undefined;
    expect(router.patch.args[0][1], 'Expect router.patch to be called').to.not.be.undefined;
    expect(router.delete.args[0][1], 'Expect router.delete to be called').to.not.be.undefined;

    let res = {
      setHeader: sinon.spy(),
      send: sinon.spy()
    }
    router.options.args[0][1]({}, res);

    expect(res.setHeader.called, 'Expect res.setHeader to be called').to.be.true;
    expect(res.send.calledWith(), 'Expect res.send to be called with no arguments').to.be.true;

    res = {
      setHeader: sinon.spy(),
      send: sinon.spy()
    }
    router.options.args[0][1]({}, res);

    expect(res.setHeader.called, 'Expect res.setHeader to be called').to.be.true;
    expect(res.send.calledWith(), 'Expect res.send to be called with no arguments').to.be.true;
  });

  it('Should successfully setupResourcesRoutes, with rik customization(w/o before and after), with selectedResources, all verbs set', () => {
    delete process.env.RIK_RESOURCES;
    process.env.RIK_RESOURCES = 'customer';
    let rikCustomizationMock = {
    };
    let resourceConfigMock = {
      metadata: {
        name: 'mock'
      },
      resourceController: {
        get: sinon.spy(),
        post: sinon.spy(),
        patch: sinon.spy(),
        delete: sinon.spy()
      }
    }
    class SchemaValidationMock {
      resolveRIKSchema() {

      }
      validateRIKObject() {

      }
    };
    let rikHomeManagerMock = {
      getExpressCustomization: () => rikCustomizationMock,
      getResourceConfig: () => resourceConfigMock,
      getSettings: () => ({
        cors: []
      })
    };
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);

    const CommonBuilder = require('./common-builder');

    let router = {
      options: sinon.spy(),
      get: sinon.spy(),
      post: sinon.spy(),
      patch: sinon.spy(),
      delete: sinon.spy()
    };
    let resources = ['customer', 'contact'];

    let builder = new CommonBuilder();
    builder.setupResourcesRoutes('v1', router, resources);

    expect(router.options.args[0][1], 'Expect router.options to be called with a function').to.not.be.undefined;
    expect(router.get.args[0][1], 'Expect router.get to be called').to.not.be.undefined;
    expect(router.post.args[0][1], 'Expect router.post to be called').to.not.be.undefined;
    expect(router.patch.args[0][1], 'Expect router.patch to be called').to.not.be.undefined;
    expect(router.delete.args[0][1], 'Expect router.delete to be called').to.not.be.undefined;

    let res = {
      setHeader: sinon.spy(),
      send: sinon.spy()
    }
    router.options.args[0][1]({}, res);

    expect(res.setHeader.called, 'Expect res.setHeader to be called').to.be.true;
    expect(res.send.calledWith(), 'Expect res.send to be called with no arguments').to.be.true;

    res = {
      setHeader: sinon.spy(),
      send: sinon.spy()
    }
    router.options.args[0][1]({}, res);

    expect(res.setHeader.called, 'Expect res.setHeader to be called').to.be.true;
    expect(res.send.calledWith(), 'Expect res.send to be called with no arguments').to.be.true;
  });

  it('Should successfully setupResourcesRoutes, without rik customization, with selectedResources, all verbs set', () => {
    delete process.env.RIK_RESOURCES;
    process.env.RIK_RESOURCES = 'customer';
    let resourceConfigMock = {
      metadata: {
        name: 'mock'
      },
      resourceController: {
        get: sinon.spy(),
        post: sinon.spy(),
        patch: sinon.spy(),
        delete: sinon.spy()
      }
    }
    class SchemaValidationMock {
      resolveRIKSchema() {

      }
      validateRIKObject() {

      }
    };
    let rikHomeManagerMock = {
      getExpressCustomization: () => undefined,
      getResourceConfig: () => resourceConfigMock,
      getSettings: () => ({
        cors: []
      })
    };
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);

    const CommonBuilder = require('./common-builder');

    let router = {
      options: sinon.spy(),
      get: sinon.spy(),
      post: sinon.spy(),
      patch: sinon.spy(),
      delete: sinon.spy()
    };
    let resources = ['customer', 'contact'];

    let builder = new CommonBuilder();
    builder.setupResourcesRoutes('v1', router, resources);

    expect(router.options.args[0][1], 'Expect router.options to be called with a function').to.not.be.undefined;
    expect(router.get.args[0][1], 'Expect router.get to be called').to.not.be.undefined;
    expect(router.post.args[0][1], 'Expect router.post to be called').to.not.be.undefined;
    expect(router.patch.args[0][1], 'Expect router.patch to be called').to.not.be.undefined;
    expect(router.delete.args[0][1], 'Expect router.delete to be called').to.not.be.undefined;

    let res = {
      setHeader: sinon.spy(),
      send: sinon.spy()
    }
    router.options.args[0][1]({}, res);

    expect(res.setHeader.called, 'Expect res.setHeader to be called').to.be.true;
    expect(res.send.calledWith(), 'Expect res.send to be called with no arguments').to.be.true;

    res = {
      setHeader: sinon.spy(),
      send: sinon.spy()
    }
    router.options.args[0][1]({}, res);

    expect(res.setHeader.called, 'Expect res.setHeader to be called').to.be.true;
    expect(res.send.calledWith(), 'Expect res.send to be called with no arguments').to.be.true;
  });

  
  it('Should successfully _createHandler and run it', () => {
    delete process.env.RIK_RESOURCES;
    process.env.RIK_RESOURCES = 'customer';
    let mockApiResponse = {
      body: {},
      header: {
        mockHeader: ''
      }
    };
    let mockPromise = {
      then: sinon.stub().returnsThis(),
      catch: sinon.stub().returnsThis()
    };
    let resourceConfigMock = {
      metadata: {
        name: 'mock'
      },
      resourceController: {
        get: sinon.stub().returns(mockPromise)
      }
    }
    class SchemaValidationMock {
      resolveRIKSchema() {

      }
      validateRIKObject() {

      }
    };
    let rikHomeManagerMock = {
      getExpressCustomization: () => undefined,
      getResourceConfig: () => resourceConfigMock,
      getSettings: () => ({
        cors: []
      })
    };
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);

    const CommonBuilder = require('./common-builder');

    let builder = new CommonBuilder();
    let handler = builder._createHandler(resourceConfigMock, 'get');
    let mockRes = {
      setHeader: sinon.spy(),
      status: sinon.spy(),
      send: sinon.spy()
    };
    let nextMdw = sinon.spy();
    handler({},mockRes,nextMdw);
    mockPromise.then.yield(mockApiResponse);

    expect(nextMdw.called, 'Expected "next" to be called').to.be.true;
    expect(mockRes.setHeader.called, 'Expected "res.setHeader" to be called').to.be.true;
    expect(mockRes.status.called, 'Expected "res.status" to be called').to.be.true;
    expect(mockRes.send.called, 'Expected "res.send" to be called').to.be.true;
    expect(resourceConfigMock.resourceController.get.called, 'Expected "resourceController.get" to be called').to.be.true;
  });

  
  it('Should successfully _createHandler and run it, with request validation error', () => {
    delete process.env.RIK_RESOURCES;
    process.env.RIK_RESOURCES = 'customer';
    let mockApiResponse = {
      body: {}
    };
    let mockPromise = {
      then: sinon.stub().returnsThis(),
      catch: sinon.stub().returnsThis()
    };
    let resourceConfigMock = {
      metadata: {
        name: 'mock'
      },
      resourceController: {
        get: sinon.stub().returns(mockPromise)
      }
    }
    class SchemaValidationMock {
      resolveRIKSchema() {

      }
      validateRIKObject() {
        return {
          error: 'mock error'
        };
      }
    };
    let rikHomeManagerMock = {
      getExpressCustomization: () => undefined,
      getResourceConfig: () => resourceConfigMock,
      getSettings: () => ({
        cors: []
      })
    };
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);

    const CommonBuilder = require('./common-builder');

    let builder = new CommonBuilder();
    let handler = builder._createHandler(resourceConfigMock, 'get');
    let mockRes = {
      status: sinon.spy(),
      send: sinon.spy()
    };
    let nextMdw = sinon.spy();
    handler({},mockRes,nextMdw);
    //mockPromise.then.yield(mockApiResponse);

    expect(nextMdw.called, 'Expected "next" to be called').to.be.true;
    expect(mockRes.status.called, 'Expected "res.status" to be called').to.be.true;
    expect(mockRes.send.called, 'Expected "res.send" to be called').to.be.true;
    expect(resourceConfigMock.resourceController.get.called, 'Expected "resourceController.get" to not be called').to.be.false;
  });
  
  it('Should successfully _createHandler and run it, with response containing error status code', () => {
    delete process.env.RIK_RESOURCES;
    process.env.RIK_RESOURCES = 'customer';
    let mockApiResponse = {
      statusCode: 410,
      body: {}
    };
    let mockPromise = {
      then: sinon.stub().returnsThis(),
      catch: sinon.stub().returnsThis()
    };
    let resourceConfigMock = {
      metadata: {
        name: 'mock'
      },
      resourceController: {
        get: sinon.stub().returns(mockPromise)
      }
    }
    class SchemaValidationMock {
      resolveRIKSchema() {

      }
      validateRIKObject() {
      }
    };
    let rikHomeManagerMock = {
      getExpressCustomization: () => undefined,
      getResourceConfig: () => resourceConfigMock,
      getSettings: () => ({
        cors: []
      })
    };
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);

    const CommonBuilder = require('./common-builder');

    let builder = new CommonBuilder();
    let handler = builder._createHandler(resourceConfigMock, 'get');
    let mockRes = {
      setHeader: sinon.spy(),
      status: sinon.spy(),
      send: sinon.spy()
    };
    let nextMdw = sinon.spy();
    handler({},mockRes,nextMdw);
    mockPromise.then.yield(mockApiResponse);

    expect(nextMdw.called, 'Expected "next" to be called').to.be.true;
    expect(mockRes.status.calledWith(410), 'Expected "res.status" to be called with 410').to.be.true;
    expect(mockRes.send.called, 'Expected "res.send" to be called').to.be.true;
    expect(resourceConfigMock.resourceController.get.called, 'Expected "resourceController.get" to be called').to.be.true;
  });
  
  it('Should successfully _createHandler and run it, with response validation error', () => {
    delete process.env.RIK_RESOURCES;
    process.env.RIK_RESOURCES = 'customer';
    let mockApiResponse = {
      body: {}
    };
    let mockPromise = {
      then: sinon.stub().returnsThis(),
      catch: sinon.stub().returnsThis()
    };
    let resourceConfigMock = {
      metadata: {
        name: 'mock'
      },
      resourceController: {
        get: sinon.stub().returns(mockPromise)
      }
    }
    class SchemaValidationMock {
      constructor(){
        this.validateRIKObject = sinon.stub().onSecondCall().returns({error: 'mock response error'});
      }
      resolveRIKSchema() {

      }
    };
    let rikHomeManagerMock = {
      getExpressCustomization: () => undefined,
      getResourceConfig: () => resourceConfigMock,
      getSettings: () => ({
        cors: []
      })
    };
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);

    const CommonBuilder = require('./common-builder');

    let builder = new CommonBuilder();
    let handler = builder._createHandler(resourceConfigMock, 'get');
    let mockRes = {
      setHeader: sinon.spy(),
      status: sinon.spy(),
      send: sinon.spy()
    };
    let nextMdw = sinon.spy();
    handler({},mockRes,nextMdw);
    mockPromise.then.yield(mockApiResponse);

    expect(nextMdw.called, 'Expected "next" to be called').to.be.true;
    expect(mockRes.status.calledWith(500), 'Expected "res.status" to be called with 500').to.be.true;
    expect(mockRes.send.called, 'Expected "res.send" to be called').to.be.true;
    expect(resourceConfigMock.resourceController.get.called, 'Expected "resourceController.get" to be called').to.be.true;
  });
  
  it('Should successfully _createHandler and run it, with catch promise rejection', () => {
    delete process.env.RIK_RESOURCES;
    process.env.RIK_RESOURCES = 'customer';
    let mockApiResponse = {
      body: {}
    };
    let mockPromise = {
      then: sinon.stub().returnsThis(),
      catch: sinon.stub().returnsThis()
    };
    let resourceConfigMock = {
      metadata: {
        name: 'mock'
      },
      resourceController: {
        get: sinon.stub().returns(mockPromise)
      }
    }
    class SchemaValidationMock {
      constructor(){
        this.validateRIKObject = sinon.stub().onSecondCall().returns({error: 'mock response error'});
      }
      resolveRIKSchema() {

      }
    };
    let rikHomeManagerMock = {
      getExpressCustomization: () => undefined,
      getResourceConfig: () => resourceConfigMock,
      getSettings: () => ({
        cors: []
      })
    };
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);

    const CommonBuilder = require('./common-builder');

    let builder = new CommonBuilder();
    let handler = builder._createHandler(resourceConfigMock, 'get');
    let mockRes = {
      status: sinon.spy(),
      send: sinon.spy()
    };
    let nextMdw = sinon.spy();
    handler({},mockRes,nextMdw);
    mockPromise.catch.yield(new Error('mock error'));

    expect(nextMdw.called, 'Expected "next" to be called').to.be.true;
    expect(mockRes.status.calledWith(500), 'Expected "res.status" to be called with 500').to.be.true;
    expect(mockRes.send.called, 'Expected "res.send" to be called').to.be.true;
    expect(resourceConfigMock.resourceController.get.called, 'Expected "resourceController.get" to be called').to.be.true;
  });
  
  it('Should successfully _createHandler and run it, with catch promise rejection (debug enabled)', () => {
    delete process.env.RIK_RESOURCES;
    process.env.RIK_RESOURCES = 'customer';
    process.env.RIK_DEBUG = true;
    let mockApiResponse = {
      body: {}
    };
    let mockPromise = {
      then: sinon.stub().returnsThis(),
      catch: sinon.stub().returnsThis()
    };
    let resourceConfigMock = {
      metadata: {
        name: 'mock'
      },
      resourceController: {
        get: sinon.stub().returns(mockPromise)
      }
    }
    class SchemaValidationMock {
      constructor(){
        this.validateRIKObject = sinon.stub().onSecondCall().returns({error: 'mock response error'});
      }
      resolveRIKSchema() {

      }
    };
    let rikHomeManagerMock = {
      getExpressCustomization: () => undefined,
      getResourceConfig: () => resourceConfigMock,
      getSettings: () => ({
        cors: []
      })
    };
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);

    const CommonBuilder = require('./common-builder');

    let builder = new CommonBuilder();
    let handler = builder._createHandler(resourceConfigMock, 'get');
    let mockRes = {
      status: sinon.spy(),
      send: sinon.spy()
    };
    let nextMdw = sinon.spy();
    handler({},mockRes,nextMdw);
    mockPromise.catch.yield(new Error('mock error'));

    expect(nextMdw.called, 'Expected "next" to be called').to.be.true;
    expect(mockRes.status.calledWith(500), 'Expected "res.status" to be called with 500').to.be.true;
    expect(mockRes.send.called, 'Expected "res.send" to be called').to.be.true;
    expect(resourceConfigMock.resourceController.get.called, 'Expected "resourceController.get" to be called').to.be.true;
  });
  
  it('Should successfully _createDisabledHandler and run it', () => {
    let rikHomeManagerMock = {
      getExpressCustomization: () => undefined,
      getResourceConfig: () => resourceConfigMock,
      getSettings: () => ({
        cors: []
      })
    };
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);

    const CommonBuilder = require('./common-builder');

    let builder = new CommonBuilder();
    let handler = builder._createDisabledHandler();
    let mockRes = {
      status: sinon.spy(),
      send: sinon.spy()
    };
    let nextMdw = sinon.spy();
    handler({},mockRes,nextMdw);

    expect(nextMdw.called, 'Expected "next" to be called').to.be.true;
    expect(mockRes.status.calledWith(405), 'Expected "res.status" to be called with 405').to.be.true;
    expect(mockRes.send.called, 'Expected "res.send" to be called').to.be.true;
  });
  
  it('Should successfully _setResourceVerbsHandlers, with undefined verbs (post defined) and subresource of', () => {
    class SchemaValidationMock {
      resolveRIKSchema() {

      }
      validateRIKObject() {
      }
    };
    let rikHomeManagerMock = {
      getExpressCustomization: () => undefined,
      getResourceConfig: () => resourceConfigMock,
      getSettings: () => ({
        cors: []
      })
    };
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);

    const CommonBuilder = require('./common-builder');

    let builder = new CommonBuilder();

    let resourceConfigMock = {
      metadata: {
        name: 'contact',
        subOf: 'customer'
      },
      resourceController: {
        get: sinon.stub(),
        post: sinon.stub()
      }
    }
    
    let router = {
      options: sinon.spy(),
      get: sinon.spy(),
      post: sinon.spy(),
      patch: sinon.spy(),
      delete: sinon.spy()
    };
    let resources = ['customer', 'contact'];

    builder._setResourceVerbsHandlers(router, resourceConfigMock, resources);

    expect(router.get.called, 'Expected "router.get" to be called').to.be.true;
    expect(router.post.called, 'Expected "router.post" to be called').to.be.true;
    expect(router.patch.called, 'Expected "router.patch" to be called').to.be.true;
    expect(router.delete.called, 'Expected "router.delete" to be called').to.be.true;
  });

  
  it('Should successfully _setResourceVerbsHandlers, with undefined verbs (post undefined) and subresource of', () => {
    class SchemaValidationMock {
      resolveRIKSchema() {

      }
      validateRIKObject() {
      }
    };
    let rikHomeManagerMock = {
      getExpressCustomization: () => undefined,
      getResourceConfig: () => resourceConfigMock,
      getSettings: () => ({
        cors: []
      })
    };
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../rik-home.manager', rikHomeManagerMock);

    const CommonBuilder = require('./common-builder');

    let builder = new CommonBuilder();

    let resourceConfigMock = {
      metadata: {
        name: 'contact',
        subOf: 'customer'
      },
      resourceController: {
        get: sinon.stub()
      }
    }
    
    let router = {
      options: sinon.spy(),
      get: sinon.spy(),
      post: sinon.spy(),
      patch: sinon.spy(),
      delete: sinon.spy()
    };
    let resources = ['customer', 'contact'];

    builder._setResourceVerbsHandlers(router, resourceConfigMock, resources);

    expect(router.get.called, 'Expected "router.get" to be called').to.be.true;
    expect(router.post.called, 'Expected "router.post" to be called').to.be.true;
    expect(router.patch.called, 'Expected "router.patch" to be called').to.be.true;
    expect(router.delete.called, 'Expected "router.delete" to be called').to.be.true;
  });

});