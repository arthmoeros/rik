const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

describe('Main', () => {

  beforeEach(() => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });
    mockery.registerMock('../support/iunctio-logger', {
      info: () => { },
      warn: () => { },
      error: () => { },
      setCustomLogger: () => {}
    });
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should startup (path mode, w/ global customization, w/ customlogger)', () => {
    let mockSetup = sinon.stub();
    let homeManagerReturns = {
      getExpressCustomization: {
        getCustomLogger: sinon.stub().returns({}),
        setupRouterBeforeApi: sinon.stub(),
        setupRouterAfterApi: sinon.stub()
      },
      getSettings: {
        apiVersion: {
          mode: 'path'
        }
      },
      getAvailableResources: []
    };
    let mockHomeManager = getMockHomeManager(homeManagerReturns);
    let mockExpress = getMockExpress();
    let mockBodyParser = getMockBodyParser();
    let mockApiBuilder = {
      buildHealthChecks: sinon.stub(),
      buildApi: sinon.stub()
    };
    let mockApiBuilderClass = class ApiBuilder {
      constructor(){
        this.buildHealthChecks = mockApiBuilder.buildHealthChecks;
        this.buildApi = mockApiBuilder.buildApi;
      }
    };

    mockery.registerMock('./setup', mockSetup);
    mockery.registerMock('express', mockExpress);
    mockery.registerMock('body-parser', mockBodyParser);
    mockery.registerMock('./iunctio-home.manager', mockHomeManager);
    mockery.registerMock('./api-builders/path-version-builder', mockApiBuilderClass);
    mockery.registerMock('./api-builders/header-version-builder', mockApiBuilderClass);

    require('./main');
    
    expect(mockSetup.called).to.be.true;
    expect(mockHomeManager.getExpressCustomization.called).to.be.true;
    expect(homeManagerReturns.getExpressCustomization.getCustomLogger.called).to.be.true;
    expect(mockHomeManager.getSettings.called).to.be.true;
    expect(mockHomeManager.getAvailableResources.called).to.be.true;
    expect(mockApiBuilder.buildHealthChecks.called).to.be.true;
    expect(homeManagerReturns.getExpressCustomization.setupRouterBeforeApi.called).to.be.true;
    expect(mockApiBuilder.buildApi.called).to.be.true;
    expect(homeManagerReturns.getExpressCustomization.setupRouterAfterApi.called).to.be.true;
    expect(mockExpress.mockInstance.listen.called).to.be.true;
  });

  it('should startup (header mode, w/o global customization methods, w/o customlogger)', () => {
    let mockSetup = sinon.stub();
    let homeManagerReturns = {
      getExpressCustomization: {
      },
      getSettings: {
        apiVersion: {
          mode: 'header'
        }
      },
      getAvailableResources: []
    };
    let mockHomeManager = getMockHomeManager(homeManagerReturns);
    let mockExpress = getMockExpress();
    let mockBodyParser = getMockBodyParser();
    let mockApiBuilder = {
      buildHealthChecks: sinon.stub(),
      buildApi: sinon.stub()
    };
    let mockApiBuilderClass = class ApiBuilder {
      constructor(){
        this.buildHealthChecks = mockApiBuilder.buildHealthChecks;
        this.buildApi = mockApiBuilder.buildApi;
      }
    };

    mockery.registerMock('./setup', mockSetup);
    mockery.registerMock('express', mockExpress);
    mockery.registerMock('body-parser', mockBodyParser);
    mockery.registerMock('./iunctio-home.manager', mockHomeManager);
    mockery.registerMock('./api-builders/path-version-builder', mockApiBuilderClass);
    mockery.registerMock('./api-builders/header-version-builder', mockApiBuilderClass);

    require('./main');
    
    expect(mockSetup.called).to.be.true;
    expect(mockHomeManager.getExpressCustomization.called).to.be.true;
    expect(mockHomeManager.getSettings.called).to.be.true;
    expect(mockHomeManager.getAvailableResources.called).to.be.true;
    expect(mockApiBuilder.buildHealthChecks.called).to.be.true;
    expect(mockApiBuilder.buildApi.called).to.be.true;
    expect(mockExpress.mockInstance.listen.called).to.be.true;
  });

  it('should startup (header mode, w/o global customization, w/o customlogger)', () => {
    let mockSetup = sinon.stub();
    let homeManagerReturns = {
      getSettings: {
        apiVersion: {
          mode: 'header'
        }
      },
      getAvailableResources: []
    };
    let mockHomeManager = getMockHomeManager(homeManagerReturns);
    let mockExpress = getMockExpress();
    let mockBodyParser = getMockBodyParser();
    let mockApiBuilder = {
      buildHealthChecks: sinon.stub(),
      buildApi: sinon.stub()
    };
    let mockApiBuilderClass = class ApiBuilder {
      constructor(){
        this.buildHealthChecks = mockApiBuilder.buildHealthChecks;
        this.buildApi = mockApiBuilder.buildApi;
      }
    };

    mockery.registerMock('./setup', mockSetup);
    mockery.registerMock('express', mockExpress);
    mockery.registerMock('body-parser', mockBodyParser);
    mockery.registerMock('./iunctio-home.manager', mockHomeManager);
    mockery.registerMock('./api-builders/path-version-builder', mockApiBuilderClass);
    mockery.registerMock('./api-builders/header-version-builder', mockApiBuilderClass);

    require('./main');
    
    expect(mockSetup.called).to.be.true;
    expect(mockHomeManager.getExpressCustomization.called).to.be.true;
    expect(mockHomeManager.getSettings.called).to.be.true;
    expect(mockHomeManager.getAvailableResources.called).to.be.true;
    expect(mockApiBuilder.buildHealthChecks.called).to.be.true;
    expect(mockApiBuilder.buildApi.called).to.be.true;
    expect(mockExpress.mockInstance.listen.called).to.be.true;
  });

  it('should startup (w/ error cuz invalid mode)', () => {
    let mockSetup = sinon.stub();
    let homeManagerReturns = {
      getSettings: {
        apiVersion: {
          mode: 'invalid'
        }
      },
      getAvailableResources: []
    };
    let mockHomeManager = getMockHomeManager(homeManagerReturns);
    let mockExpress = getMockExpress();
    let mockBodyParser = getMockBodyParser();
    let mockApiBuilder = {
      buildHealthChecks: sinon.stub(),
      buildApi: sinon.stub()
    };
    let mockApiBuilderClass = class ApiBuilder {
      constructor(){
        this.buildHealthChecks = mockApiBuilder.buildHealthChecks;
        this.buildApi = mockApiBuilder.buildApi;
      }
    };

    mockery.registerMock('./setup', mockSetup);
    mockery.registerMock('express', mockExpress);
    mockery.registerMock('body-parser', mockBodyParser);
    mockery.registerMock('./iunctio-home.manager', mockHomeManager);
    mockery.registerMock('./api-builders/path-version-builder', mockApiBuilderClass);
    mockery.registerMock('./api-builders/header-version-builder', mockApiBuilderClass);

    try {
      require('./main'); 
      expect(true,'expected thrown error').to.be.false;
    } catch (error) {
      expect(mockSetup.called).to.be.true;
      expect(mockHomeManager.getExpressCustomization.called).to.be.true;
      expect(mockHomeManager.getSettings.called).to.be.true;
      expect(mockHomeManager.getAvailableResources.called).to.be.true;
      expect(error.message).to.be.eq('Unsupported apiVersion mode: invalid');
    }
  });

  it('should stop gracefully on SIGINT, SIGTERM and SIGKILL', () => {
    let mockSetup = sinon.stub();
    let mockServer = {
      close: sinon.stub()
    };
    let homeManagerReturns = {
      getExpressCustomization: {
        getCustomLogger: sinon.stub().returns({}),
        setupRouterBeforeApi: sinon.stub(),
        setupRouterAfterApi: sinon.stub()
      },
      getSettings: {
        apiVersion: {
          mode: 'path'
        }
      },
      getAvailableResources: []
    };
    let mockHomeManager = getMockHomeManager(homeManagerReturns);
    let mockExpress = getMockExpress({listen: mockServer});
    let mockBodyParser = getMockBodyParser();
    let mockApiBuilder = {
      buildHealthChecks: sinon.stub(),
      buildApi: sinon.stub()
    };
    let mockApiBuilderClass = class ApiBuilder {
      constructor(){
        this.buildHealthChecks = mockApiBuilder.buildHealthChecks;
        this.buildApi = mockApiBuilder.buildApi;
      }
    };

    mockery.registerMock('./setup', mockSetup);
    mockery.registerMock('express', mockExpress);
    mockery.registerMock('body-parser', mockBodyParser);
    mockery.registerMock('./iunctio-home.manager', mockHomeManager);
    mockery.registerMock('./api-builders/path-version-builder', mockApiBuilderClass);
    mockery.registerMock('./api-builders/header-version-builder', mockApiBuilderClass);

    let bkProcessOn = process.on;
    process.on = (event, cb) => {
      cb();
    };
    require('./main');
    process.on = bkProcessOn;

    expect(mockServer.close.calledThrice).to.be.true;
  });

});

function getMockHomeManager(returns){
  return {
    getExpressCustomization: sinon.stub().returns(returns.getExpressCustomization),
    getSettings: sinon.stub().returns(returns.getSettings),
    getAvailableResources: sinon.stub().returns(returns.getAvailableResources)
  }
}

function getMockExpress(returns){
  returns = returns !== undefined ? returns : {};
  let mockInstance = {
    use: sinon.stub(),
    listen: sinon.stub().returns(returns.listen)
  };
  let mockExpress = sinon.stub().returns(mockInstance);
  mockExpress.mockInstance = mockInstance
  mockExpress.Router = sinon.stub();
  return mockExpress;
}

function getMockBodyParser(returns){
  return {
    urlencoded: sinon.stub(),
    json: sinon.stub()
  }
}