const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

describe('HeaderVersionBuilder', () => {

  beforeEach(() => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });
    mockery.registerMock('../../support/iunctio-logger', {
      info: () => {},
      warn: () => {},
      error: () => {},
    })
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  const expressMock = {
    Router: () => () => {}
  };

  class CommonBuilderMock {
    setupHealthCheckRoutes() { }
    setupResourcesRoutes() {}
  };

  class MockApiRouter {
    use(path, handler){
      this.handler = handler;
    }
  }

  it('Should successfully invoke healthCheck endpoint using set headerName, set default version, without enforcingVersionHeader', () => {
    let mockSettings = {
      apiVersion: {
        headerName: 'accept-version',
        headerDefaultVersion: 'v1',
        enforceVersionHeader: false
      }
    };
    let mockIunctioHomeManager = {
      getSettings: () => mockSettings
    };
    const routerMock = sinon.spy();
    const expressMock = {
      Router: () => routerMock
    };
    mockery.registerMock('express', expressMock);
    mockery.registerMock('./common-builder', CommonBuilderMock);
    mockery.registerMock('./../iunctio-home.manager', mockIunctioHomeManager);

    const PathVersionBuilder = require('./header-version-builder');
    
    let mockApiRouter = new MockApiRouter();

    let mockResourcesObj = {
      v1: []
    };

    let builder = new PathVersionBuilder();

    builder.buildHealthChecks(mockApiRouter, mockResourcesObj);

    expect(mockApiRouter.handler, 'Expect mockApiRouter handler to be defined').to.exist;

    let req = {
      headers: {}
    };
    let res = {
      status: sinon.spy(),
      send: sinon.spy()
    }

    mockApiRouter.handler(req, res);

    expect(routerMock.called).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.send.called).to.be.false;
  });

  it('Should unsuccessfully invoke healthCheck endpoint using set headerName, set default version, with enforcingVersionHeader, without set version header', () => {
    let mockSettings = {
      apiVersion: {
        headerName: 'accept-version',
        headerDefaultVersion: 'v1',
        enforceVersionHeader: true
      }
    };
    let mockIunctioHomeManager = {
      getSettings: () => mockSettings
    };
    const routerMock = sinon.spy();
    const expressMock = {
      Router: () => routerMock
    };
    mockery.registerMock('express', expressMock);
    mockery.registerMock('./common-builder', CommonBuilderMock);
    mockery.registerMock('./../iunctio-home.manager', mockIunctioHomeManager);

    const PathVersionBuilder = require('./header-version-builder');
    
    let mockApiRouter = new MockApiRouter();

    let mockResourcesObj = {
      v1: []
    };

    let builder = new PathVersionBuilder();

    builder.buildHealthChecks(mockApiRouter, mockResourcesObj);

    expect(mockApiRouter.handler, 'Expect mockApiRouter handler to be defined').to.exist;

    let req = {
      headers: {}
    };
    let res = {
      status: sinon.spy(),
      send: sinon.spy()
    }

    mockApiRouter.handler(req, res);

    expect(routerMock.called).to.be.false;
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.send.calledWith(`Version header is required: "accept-version"`)).to.be.true;
  });

  it('Should successfully invoke healthCheck endpoint using set headerName, set default version, without enforcingVersionHeader, with set version header', () => {
    let mockSettings = {
      apiVersion: {
        headerName: 'accept-version',
        headerDefaultVersion: 'v1',
        enforceVersionHeader: false
      }
    };
    let mockIunctioHomeManager = {
      getSettings: () => mockSettings
    };
    const routerMock = sinon.spy();
    const expressMock = {
      Router: () => routerMock
    };
    mockery.registerMock('express', expressMock);
    mockery.registerMock('./common-builder', CommonBuilderMock);
    mockery.registerMock('./../iunctio-home.manager', mockIunctioHomeManager);

    const PathVersionBuilder = require('./header-version-builder');
    
    let mockApiRouter = new MockApiRouter();

    let mockResourcesObj = {
      v1: []
    };

    let builder = new PathVersionBuilder();

    builder.buildHealthChecks(mockApiRouter, mockResourcesObj);

    expect(mockApiRouter.handler, 'Expect mockApiRouter handler to be defined').to.exist;

    let req = {
      headers: {
        'accept-version': 'v1'
      }
    };
    let res = {
      status: sinon.spy(),
      send: sinon.spy()
    }

    mockApiRouter.handler(req, res);

    expect(routerMock.called).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.send.called).to.be.false;
  });

  it('Should unsuccessfully invoke healthCheck endpoint using set headerName, set default non existing version, without enforcingVersionHeader', () => {
    let mockSettings = {
      apiVersion: {
        headerName: 'accept-version',
        headerDefaultVersion: 'v666',
        enforceVersionHeader: false
      }
    };
    let mockIunctioHomeManager = {
      getSettings: () => mockSettings
    };
    const routerMock = sinon.spy();
    const expressMock = {
      Router: () => routerMock
    };
    mockery.registerMock('express', expressMock);
    mockery.registerMock('./common-builder', CommonBuilderMock);
    mockery.registerMock('./../iunctio-home.manager', mockIunctioHomeManager);

    const PathVersionBuilder = require('./header-version-builder');
    
    let mockApiRouter = new MockApiRouter();

    let mockResourcesObj = {
      v1: []
    };

    let builder = new PathVersionBuilder();

    builder.buildHealthChecks(mockApiRouter, mockResourcesObj);

    expect(mockApiRouter.handler, 'Expect mockApiRouter handler to be defined').to.exist;

    let req = {
      headers: {
      }
    };
    let res = {
      status: sinon.spy(),
      send: sinon.spy()
    }

    mockApiRouter.handler(req, res);

    expect(routerMock.called).to.be.false;
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.send.calledWith(`Default api version not found: "v666"`)).to.be.true;
  });

  it('Should successfully invoke healthCheck endpoint using set headerName, set default version, without enforcingVersionHeader, with set non existing version header', () => {
    let mockSettings = {
      apiVersion: {
        headerName: 'accept-version',
        headerDefaultVersion: 'v1',
        enforceVersionHeader: false
      }
    };
    let mockIunctioHomeManager = {
      getSettings: () => mockSettings
    };
    const routerMock = sinon.spy();
    const expressMock = {
      Router: () => routerMock
    };
    mockery.registerMock('express', expressMock);
    mockery.registerMock('./common-builder', CommonBuilderMock);
    mockery.registerMock('./../iunctio-home.manager', mockIunctioHomeManager);

    const PathVersionBuilder = require('./header-version-builder');
    
    let mockApiRouter = new MockApiRouter();

    let mockResourcesObj = {
      v1: []
    };

    let builder = new PathVersionBuilder();

    builder.buildHealthChecks(mockApiRouter, mockResourcesObj);

    expect(mockApiRouter.handler, 'Expect mockApiRouter handler to be defined').to.exist;

    let req = {
      headers: {
        'accept-version': 'v666'
      }
    };
    let res = {
      status: sinon.spy(),
      send: sinon.spy()
    }

    mockApiRouter.handler(req, res);

    expect(routerMock.called).to.be.false;
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.send.calledWith(`Invalid api version header received: "accept-version: v666"`)).to.be.true;
  });

  it('Should successfully invoke healthCheck endpoint using unset headerName, set default version, without enforcingVersionHeader', () => {
    let mockSettings = {
      apiVersion: {
        headerDefaultVersion: 'v1',
        enforceVersionHeader: false
      }
    };
    let mockIunctioHomeManager = {
      getSettings: () => mockSettings
    };
    const routerMock = sinon.spy();
    const expressMock = {
      Router: () => routerMock
    };
    mockery.registerMock('express', expressMock);
    mockery.registerMock('./common-builder', CommonBuilderMock);
    mockery.registerMock('./../iunctio-home.manager', mockIunctioHomeManager);

    const PathVersionBuilder = require('./header-version-builder');
    
    let mockApiRouter = new MockApiRouter();

    let mockResourcesObj = {
      v1: []
    };

    let builder = new PathVersionBuilder();

    builder.buildHealthChecks(mockApiRouter, mockResourcesObj);

    expect(mockApiRouter.handler, 'Expect mockApiRouter handler to be defined').to.exist;

    let req = {
      headers: {}
    };
    let res = {
      status: sinon.spy(),
      send: sinon.spy()
    }

    mockApiRouter.handler(req, res);

    expect(routerMock.called).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.send.called).to.be.false;
  });

  it('Should successfully invoke healthCheck endpoint using unset headerName, unset default version, without enforcingVersionHeader', () => {
    let mockSettings = {
      apiVersion: {
        enforceVersionHeader: false
      }
    };
    let mockIunctioHomeManager = {
      getSettings: () => mockSettings
    };
    const routerMock = sinon.spy();
    const expressMock = {
      Router: () => routerMock
    };
    mockery.registerMock('express', expressMock);
    mockery.registerMock('./common-builder', CommonBuilderMock);
    mockery.registerMock('./../iunctio-home.manager', mockIunctioHomeManager);

    const PathVersionBuilder = require('./header-version-builder');
    
    let mockApiRouter = new MockApiRouter();

    let mockResourcesObj = {
      v1: []
    };

    let builder = new PathVersionBuilder();

    builder.buildHealthChecks(mockApiRouter, mockResourcesObj);

    expect(mockApiRouter.handler, 'Expect mockApiRouter handler to be defined').to.exist;

    let req = {
      headers: {}
    };
    let res = {
      status: sinon.spy(),
      send: sinon.spy()
    }

    mockApiRouter.handler(req, res);

    expect(routerMock.called).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.send.called).to.be.false;
  });

  it('Should successfully buildApi', () => {
    mockery.registerMock('express', expressMock);
    mockery.registerMock('./common-builder', CommonBuilderMock);

    const PathVersionBuilder = require('./header-version-builder');

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