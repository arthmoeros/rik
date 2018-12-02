const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const path = require('path');

describe('IunctioHomeManager', () => {

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
    });
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should setSettings and getSettings', () => {

    const homeManager = require('./iunctio-home.manager');
    homeManager.setSettings('mock settings');

    expect(homeManager.getSettings()).to.be.eq('mock settings', 'expected getSetting to return "mock settings"');
  });

  it('should getResourceConfig', () => {

    const homeManager = require('./iunctio-home.manager');
    homeManager.initialize('.');

    class MockResourceController {
      async get(param, query, header, body){}
    }
    MockResourceController.subOf = 'parentDummy';

    mockery.registerMock(path.join('.','v1','dummy','controller'), MockResourceController);

    let resource = homeManager.getResourceConfig('v1', 'dummy');

    expect(resource.metadata.name).to.be.eq('dummy', 'expected resource.metadata.name to be "dummy"');
    expect(resource.metadata.subOf).to.be.eq('parentDummy', 'expected resource.metadata.subOf to be "parentDummy"');
    expect(resource.resourceController).to.not.be.undefined;
  });

  it('should getResourceConfig (< 4args method error)', () => {

    const homeManager = require('./iunctio-home.manager');
    homeManager.initialize('.');

    class MockResourceController {
      async get(query, header, body){}
    }
    MockResourceController.subOf = 'parentDummy';

    mockery.registerMock(path.join('.','v1','dummy','controller'), MockResourceController);
    try {
      homeManager.getResourceConfig('v1', 'dummy');
      expect(true, 'expected thrown error').to.be.false;
    } catch (error) {
      expect(error).to.not.be.undefined;
      expect(error.message).to.contain(`method of the ResourceController doesn't expect four arguments`);
    }
  });

  it('should getResourceConfig (not async method)', () => {

    const homeManager = require('./iunctio-home.manager');
    homeManager.initialize('.');

    class MockResourceController {
      get(param, query, header, body){}
    }
    MockResourceController.subOf = 'parentDummy';

    mockery.registerMock(path.join('.','v1','dummy','controller'), MockResourceController);
    try {
      homeManager.getResourceConfig('v1', 'dummy');
      expect(true, 'expected thrown error').to.be.false;
    } catch (error) {
      expect(error).to.not.be.undefined;
      expect(error.message).to.contain(`method of the ResourceController isn't declared as async`);
    }
  });

  it('should getHealthCheck', () => {
    let mockFS = {
      existsSync: sinon.stub().returns(true),
      readFileSync: sinon.stub().returns('')
    };

    let mockJsYaml = {
      load: sinon.stub().returns('mock healthcheck')
    };

    mockery.registerMock('fs', mockFS);
    mockery.registerMock('js-yaml', mockJsYaml);
    
    const homeManager = require('./iunctio-home.manager');
    homeManager.initialize('.');
    let hc = homeManager.getHealthCheck('v1', 'dummy');

    expect(hc).to.be.eq('mock healthcheck');
    expect(mockFS.existsSync.called).to.be.true;
    expect(mockFS.readFileSync.called).to.be.true;
  });

  it('should getHealthCheck (non-existing healthcheck)', () => {
    let mockFS = {
      existsSync: sinon.stub().returns(false),
      readFileSync: sinon.stub().returns('')
    };

    let mockJsYaml = {
      load: sinon.stub().returns('mock healthcheck')
    };

    mockery.registerMock('fs', mockFS);
    mockery.registerMock('js-yaml', mockJsYaml);
    
    const homeManager = require('./iunctio-home.manager');
    homeManager.initialize('.');
    let hc = homeManager.getHealthCheck('v1', 'dummy');

    expect(hc).to.be.undefined;
    expect(mockFS.existsSync.called).to.be.true;
    expect(mockFS.readFileSync.called).to.be.false;
  });

  it('should getAvailableResources', () => {
    let mockFS = {
      readdirSync: sinon.stub().onFirstCall().returns(['v1']).onSecondCall().returns(['dummy']),
      lstatSync: sinon.stub().returns({
        isDirectory: sinon.stub().returns(true)
      }),
      existsSync: sinon.stub().returns(true)
    };

    mockery.registerMock('fs', mockFS);
    
    const homeManager = require('./iunctio-home.manager');
    homeManager.initialize('.');
    let resources = homeManager.getAvailableResources();

    expect(resources).to.not.be.undefined;
    expect(resources.v1).to.be.deep.eq(['dummy']);
  });

  it('should getAvailableResources (resource skipped because missing controller.js)', () => {
    let mockFS = {
      readdirSync: sinon.stub().onFirstCall().returns(['v1']).onSecondCall().returns(['dummy']),
      lstatSync: sinon.stub().returns({
        isDirectory: sinon.stub().returns(true)
      }),
      existsSync: sinon.stub().returns(false)
    };

    mockery.registerMock('fs', mockFS);
    
    const homeManager = require('./iunctio-home.manager');
    homeManager.initialize('.');
    let resources = homeManager.getAvailableResources();

    expect(resources).to.not.be.undefined;
    expect(resources.v1).to.be.deep.eq([]);
  });

  it('should getAvailableResources (resource skipped because name is not folder)', () => {
    let mockIsDirectory = sinon.stub().onFirstCall().returns(true).onSecondCall().returns(false);
    let mockFS = {
      readdirSync: sinon.stub().onFirstCall().returns(['v1']).onSecondCall().returns(['dummy']),
      lstatSync: sinon.stub().returns({
        isDirectory: mockIsDirectory
      })
    };

    mockery.registerMock('fs', mockFS);
    
    const homeManager = require('./iunctio-home.manager');
    homeManager.initialize('.');
    let resources = homeManager.getAvailableResources();

    expect(resources).to.not.be.undefined;
    expect(resources.v1).to.be.deep.eq([]);
  });

  it('should getAvailableResources (version skipped because name is in version format)', () => {
    let mockIsDirectory = sinon.stub().returns(true);
    let mockFS = {
      readdirSync: sinon.stub().returns(['x1']),
      lstatSync: sinon.stub().returns({
        isDirectory: mockIsDirectory
      })
    };

    mockery.registerMock('fs', mockFS);
    
    const homeManager = require('./iunctio-home.manager');
    homeManager.initialize('.');
    let resources = homeManager.getAvailableResources();

    expect(resources).to.not.be.undefined;
    expect(resources.x1).to.be.undefined;
  });

  it('should getAvailableResources (version skipped because name is not a folder)', () => {
    let mockIsDirectory = sinon.stub().returns(false);
    let mockFS = {
      readdirSync: sinon.stub().returns(['v1']),
      lstatSync: sinon.stub().returns({
        isDirectory: mockIsDirectory
      })
    };

    mockery.registerMock('fs', mockFS);
    
    const homeManager = require('./iunctio-home.manager');
    homeManager.initialize('.');
    let resources = homeManager.getAvailableResources();

    expect(resources).to.not.be.undefined;
    expect(resources.v1).to.be.undefined;
  });

  it('should getExpressCustomization', () => {
    let mockFS = {
      existsSync: sinon.stub().returns(true)
    };

    mockery.registerMock(path.join('.','v1','iunctio-customization'), {});
    mockery.registerMock('fs', mockFS);
    
    const homeManager = require('./iunctio-home.manager');
    homeManager.initialize('.');
    let customization = homeManager.getExpressCustomization('v1');

    expect(customization).to.not.be.undefined;
  });

  it('should getExpressCustomization (root customization)', () => {
    let mockFS = {
      existsSync: sinon.stub().returns(true)
    };

    mockery.registerMock(path.join('.','','iunctio-customization'), {});
    mockery.registerMock('fs', mockFS);
    
    const homeManager = require('./iunctio-home.manager');
    homeManager.initialize('.');
    let customization = homeManager.getExpressCustomization();

    expect(customization).to.not.be.undefined;
  });

  it('should getExpressCustomization (non-existing customization)', () => {
    let mockFS = {
      existsSync: sinon.stub().returns(false)
    };

    mockery.registerMock(path.join('.','','iunctio-customization'), {});
    mockery.registerMock('fs', mockFS);
    
    const homeManager = require('./iunctio-home.manager');
    homeManager.initialize('.');
    let customization = homeManager.getExpressCustomization();

    expect(customization).to.be.undefined;
  });

});