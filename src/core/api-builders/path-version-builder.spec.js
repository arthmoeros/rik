const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

describe('PathVersionBuilder', () => {

  beforeEach(() => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  const expressMock = {
    Router: () => ({})
  };

  class CommonBuilderMock {
    setupHealthCheckRoutes() { }
    setupResourcesRoutes() {}
  };

  it('Should successfully buildHealthChecks', () => {
    mockery.registerMock('express', expressMock);
    mockery.registerMock('./common-builder', CommonBuilderMock);

    const PathVersionBuilder = require('./path-version-builder');
    
    let mockApiRouter = {
      use: sinon.spy()
    };

    let mockResourcesObj = {
      v1: []
    };

    let builder = new PathVersionBuilder();

    builder.buildHealthChecks(mockApiRouter, mockResourcesObj);

    expect(mockApiRouter.use.called, 'Expect mockApiRouter.use to be called').to.be.true;
  });

  it('Should successfully buildApi', () => {
    mockery.registerMock('express', expressMock);
    mockery.registerMock('./common-builder', CommonBuilderMock);

    const PathVersionBuilder = require('./path-version-builder');

    let mockApiRouter = {
      use: sinon.spy()
    };

    let mockResourcesObj = {
      v1: []
    };

    let builder = new PathVersionBuilder();

    builder.buildApi(mockApiRouter, mockResourcesObj);

    expect(mockApiRouter.use.called, 'Expect mockApiRouter.use to be called').to.be.true;
  });
});