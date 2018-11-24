const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

describe('CommonBuilder', () => {

  beforeEach(() => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });
    mockery.registerMock('../../support/iunctio-logger', {
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
    delete process.env.IUNCTIO_RESOURCES;
    class SchemaValidationMock { };
    let iunctioHomeManagerMock = {
      getHealthCheck: () => ({}),
      getSettings: sinon.spy()
    };
    sinon.spy(iunctioHomeManagerMock, 'getHealthCheck');
    let iunctioHealthMock = sinon.spy();
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../iunctio-home.manager', iunctioHomeManagerMock);
    mockery.registerMock('iunctio-health', iunctioHealthMock);

    const CommonBuilder = require('./common-builder');

    let router = {};
    let resources = ['customer', 'contact'];

    let builder = new CommonBuilder();
    builder.setupHealthCheckRoutes('v1', router, resources);

    expect(iunctioHomeManagerMock.getHealthCheck.called, 'Expect iunctioHomeManagerMock.getHealthCheck to be called').to.be.true;
    expect(iunctioHealthMock.called, 'Expect iunctioHealthMock to be called').to.be.true;
  });

  it('Should successfully setupHealthCheckRoutes, unset healthcheck, without selectedResources', () => {
    delete process.env.IUNCTIO_RESOURCES;
    class SchemaValidationMock { };
    let iunctioHomeManagerMock = {
      getHealthCheck: () => undefined,
      getSettings: sinon.spy()
    };
    sinon.spy(iunctioHomeManagerMock, 'getHealthCheck');
    let iunctioHealthMock = sinon.spy();
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../iunctio-home.manager', iunctioHomeManagerMock);
    mockery.registerMock('iunctio-health', iunctioHealthMock);

    const CommonBuilder = require('./common-builder');

    let router = {};
    let resources = ['customer', 'contact'];

    let builder = new CommonBuilder();
    builder.setupHealthCheckRoutes('v1', router, resources);

    expect(iunctioHomeManagerMock.getHealthCheck.called, 'Expect iunctioHomeManagerMock.getHealthCheck to be called').to.be.true;
    expect(iunctioHealthMock.notCalled, 'Expect iunctioHealthMock to not be called').to.be.true;
  });

  it('Should successfully setupHealthCheckRoutes, unset healthcheck, with selectedResources', () => {
    delete process.env.IUNCTIO_RESOURCES;
    process.env.IUNCTIO_RESOURCES = 'customer';
    class SchemaValidationMock { };
    let iunctioHomeManagerMock = {
      getHealthCheck: () => undefined,
      getSettings: sinon.spy()
    };
    sinon.spy(iunctioHomeManagerMock, 'getHealthCheck');
    let iunctioHealthMock = sinon.spy();
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../iunctio-home.manager', iunctioHomeManagerMock);
    mockery.registerMock('iunctio-health', iunctioHealthMock);

    const CommonBuilder = require('./common-builder');

    let router = {};
    let resources = ['customer', 'contact'];

    let builder = new CommonBuilder();
    builder.setupHealthCheckRoutes('v1', router, resources);

    expect(iunctioHomeManagerMock.getHealthCheck.called, 'Expect iunctioHomeManagerMock.getHealthCheck to be called').to.be.true;
    expect(iunctioHealthMock.notCalled, 'Expect iunctioHealthMock to not be called').to.be.true;
  });

  it('Should successfully setupResourcesRoutes, with iunctio customization(before and after), with selectedResources, all verbs set', () => {
    delete process.env.IUNCTIO_RESOURCES;
    process.env.IUNCTIO_RESOURCES = 'customer';
    let iunctioCustomizationMock = {
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
      resolveIunctioSchema() {

      }
      validateIunctioObject() {

      }
    };
    let iunctioHomeManagerMock = {
      getExpressCustomization: () => iunctioCustomizationMock,
      getResourceConfig: () => resourceConfigMock,
      getSettings: () => ({
        cors: []
      })
    };
    mockery.registerMock('./../schema-validation', SchemaValidationMock);
    mockery.registerMock('../iunctio-home.manager', iunctioHomeManagerMock);

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

    expect(iunctioCustomizationMock.setupRouterBeforeApi.called, 'Expect iunctioCustomizationMock.setupRouterBeforeApi to be called').to.be.true;
    expect(iunctioCustomizationMock.setupRouterAfterApi.called, 'Expect iunctioCustomizationMock.setupRouterAfterApi to be called').to.be.true;
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

    let res = {
      setHeader: sinon.spy(),
      send: sinon.spy()
    }
    router.options.args[0][1]({}, res);

    expect(res.setHeader.called, 'Expect res.setHeader to be called').to.be.true;
    expect(res.send.calledWith(), 'Expect res.send to be called with no arguments').to.be.true;
  });

});