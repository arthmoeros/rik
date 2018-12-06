const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

describe('Setup', () => {

  beforeEach(() => {
    delete process.env.IUNCTIO_HOME;
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

  it('should setup (unspecified resources path, w/ custom logger, w/ valid settings)', () => {
    let argvBk = process.argv;
    let mockFS = {
      existsSync: sinon.stub().returns(true),
      readFileSync: sinon.stub().returns('')
    };
    let mockJsYaml = {
      load: sinon.stub().returns({
        apiVersion: {
          mode: 'path'
        }
      })
    }
    let schemaValidationReturns = {
      validate: undefined,
      resolveSchema: {}
    };
    let homeManagerReturns = {
      getExpressCustomization: {
        getCustomLogger: sinon.stub()
      }
    }
    let mockSchemaValidation = getMockSchemaValidation(schemaValidationReturns);
    let mockHomeManager = getMockHomeManager(homeManagerReturns);

    mockery.registerMock('fs', mockFS);
    mockery.registerMock('js-yaml', mockJsYaml);
    mockery.registerMock('./schema-validation', mockSchemaValidation);
    mockery.registerMock('./iunctio-home.manager', mockHomeManager);

    process.argv = [];
    let setup = require('./setup');
    setup();
    process.argv = argvBk;

    expect(mockSchemaValidation.stubs.resolveSchema.called).to.be.true;
    expect(mockSchemaValidation.stubs.validate.called).to.be.true;
    expect(mockJsYaml.load.called).to.be.true;
    expect(mockHomeManager.setSettings.called).to.be.true;
  });

  it('should setup (specified resources path w/ parameter, w/o custom logger, w/o settings)', () => {
    let argvBk = process.argv;
    let mockFS = {
      existsSync: sinon.stub().onFirstCall().returns(true).onSecondCall().returns(false),
      readFileSync: sinon.stub().returns('')
    };
    let mockJsYaml = {
      load: sinon.stub().returns({
        apiVersion: {
          mode: 'path'
        }
      })
    }
    let schemaValidationReturns = {
      validate: undefined,
      resolveSchema: {}
    };
    let homeManagerReturns = {
      getExpressCustomization: undefined
    }
    let mockSchemaValidation = getMockSchemaValidation(schemaValidationReturns);
    let mockHomeManager = getMockHomeManager(homeManagerReturns);

    mockery.registerMock('fs', mockFS);
    mockery.registerMock('js-yaml', mockJsYaml);
    mockery.registerMock('./schema-validation', mockSchemaValidation);
    mockery.registerMock('./iunctio-home.manager', mockHomeManager);

    process.argv = [null, null, 'myresources'];
    let setup = require('./setup');
    setup();
    process.argv = argvBk;

    expect(mockSchemaValidation.stubs.resolveSchema.called).to.be.false;
    expect(mockSchemaValidation.stubs.validate.called).to.be.false;
    expect(mockJsYaml.load.called).to.be.false;
    expect(mockHomeManager.setSettings.called).to.be.true;
  });

  it('should setup (specified resources path w/ parameter absolute, w/o custom logger, w/o settings)', () => {
    let argvBk = process.argv;
    let mockFS = {
      existsSync: sinon.stub().onFirstCall().returns(true).onSecondCall().returns(false),
      readFileSync: sinon.stub().returns('')
    };
    let mockJsYaml = {
      load: sinon.stub().returns({
        apiVersion: {
          mode: 'path'
        }
      })
    }
    let schemaValidationReturns = {
      validate: undefined,
      resolveSchema: {}
    };
    let homeManagerReturns = {
      getExpressCustomization: undefined
    }
    let mockSchemaValidation = getMockSchemaValidation(schemaValidationReturns);
    let mockHomeManager = getMockHomeManager(homeManagerReturns);

    mockery.registerMock('fs', mockFS);
    mockery.registerMock('js-yaml', mockJsYaml);
    mockery.registerMock('./schema-validation', mockSchemaValidation);
    mockery.registerMock('./iunctio-home.manager', mockHomeManager);

    process.argv = [null, null, '/myresources'];
    let setup = require('./setup');
    setup();
    process.argv = argvBk;

    expect(mockSchemaValidation.stubs.resolveSchema.called).to.be.false;
    expect(mockSchemaValidation.stubs.validate.called).to.be.false;
    expect(mockJsYaml.load.called).to.be.false;
    expect(mockHomeManager.setSettings.called).to.be.true;
  });

  it('should setup (error on invalid settings)', () => {
    let argvBk = process.argv;
    let mockFS = {
      existsSync: sinon.stub().onFirstCall().returns(true).onSecondCall().returns(false),
      readFileSync: sinon.stub().returns('')
    };
    let mockJsYaml = {
      load: sinon.stub().returns({
        apiVersion: {
          mode: 'path'
        }
      })
    }
    let schemaValidationReturns = {
      validate: {},
      resolveSchema: {}
    };
    let homeManagerReturns = {
      getExpressCustomization: undefined
    }
    let mockSchemaValidation = getMockSchemaValidation(schemaValidationReturns);
    let mockHomeManager = getMockHomeManager(homeManagerReturns);

    mockery.registerMock('fs', mockFS);
    mockery.registerMock('js-yaml', mockJsYaml);
    mockery.registerMock('./schema-validation', mockSchemaValidation);
    mockery.registerMock('./iunctio-home.manager', mockHomeManager);

    try {
      process.argv = [null, null, '/myresources'];
      let setup = require('./setup');
      setup();
      process.argv = argvBk;
      expect(true,'expected thrown error').to.be.true;
    } catch (error) {
      process.argv = argvBk;
      expect(error.message).to.contain('Invalid Iunctio settings file at');
    }
  });

  it('should setup (error on invalid settings)', () => {
    let argvBk = process.argv;
    let mockFS = {
      existsSync: sinon.stub().returns(true),
      readFileSync: sinon.stub().returns('')
    };
    let mockJsYaml = {
      load: sinon.stub().returns({
        apiVersion: {
          mode: 'path'
        }
      })
    }
    let schemaValidationReturns = {
      validate: {
        error: {}
      },
      resolveSchema: {}
    };
    let homeManagerReturns = {
      getExpressCustomization: undefined
    }
    let mockSchemaValidation = getMockSchemaValidation(schemaValidationReturns);
    let mockHomeManager = getMockHomeManager(homeManagerReturns);

    mockery.registerMock('fs', mockFS);
    mockery.registerMock('js-yaml', mockJsYaml);
    mockery.registerMock('./schema-validation', mockSchemaValidation);
    mockery.registerMock('./iunctio-home.manager', mockHomeManager);

    try {
      process.argv = [null, null, '/myresources'];
      let setup = require('./setup');
      setup();
      process.argv = argvBk;
      expect(true,'expected thrown error').to.be.true;
    } catch (error) {
      process.argv = argvBk;
      expect(error.message).to.contain('Invalid Iunctio settings file at');
    }
  });

  it('should setup (error on non-absolute path in IUNCTIO_HOME)', () => {
    let argvBk = process.argv;
    let mockFS = {
      existsSync: sinon.stub().returns(true),
      readFileSync: sinon.stub().returns('')
    };
    let mockJsYaml = {
      load: sinon.stub().returns({
        apiVersion: {
          mode: 'path'
        }
      })
    };
    let schemaValidationReturns = {
      validate: {
        error: {}
      },
      resolveSchema: {}
    };
    let homeManagerReturns = {
      getExpressCustomization: undefined
    };
    let mockSchemaValidation = getMockSchemaValidation(schemaValidationReturns);
    let mockHomeManager = getMockHomeManager(homeManagerReturns);

    mockery.registerMock('fs', mockFS);
    mockery.registerMock('js-yaml', mockJsYaml);
    mockery.registerMock('./schema-validation', mockSchemaValidation);
    mockery.registerMock('./iunctio-home.manager', mockHomeManager);

    try {
      process.argv = [];
      process.env.IUNCTIO_HOME = 'notAbsolute';
      let setup = require('./setup');
      setup();
      process.argv = argvBk;
      expect(true,'expected thrown error').to.be.true;
    } catch (error) {
      process.argv = argvBk;
      expect(error.message).to.contain('IUNCTIO_HOME must be an absolute path');
    }
  });

  it('should setup (error on non-existing iunctio path folder)', () => {
    let argvBk = process.argv;
    let mockFS = {
      existsSync: sinon.stub().returns(false),
      readFileSync: sinon.stub().returns('')
    };
    let mockJsYaml = {
      load: sinon.stub().returns({
        apiVersion: {
          mode: 'path'
        }
      })
    };
    let schemaValidationReturns = {
      validate: {
        error: {}
      },
      resolveSchema: {}
    };
    let homeManagerReturns = {
      getExpressCustomization: undefined
    };
    let mockSchemaValidation = getMockSchemaValidation(schemaValidationReturns);
    let mockHomeManager = getMockHomeManager(homeManagerReturns);

    mockery.registerMock('fs', mockFS);
    mockery.registerMock('js-yaml', mockJsYaml);
    mockery.registerMock('./schema-validation', mockSchemaValidation);
    mockery.registerMock('./iunctio-home.manager', mockHomeManager);

    try {
      process.argv = [];
      process.env.IUNCTIO_HOME = '/absolute';
      let setup = require('./setup');
      setup();
      process.argv = argvBk;
      expect(true,'expected thrown error').to.be.true;
    } catch (error) {
      process.argv = argvBk;
      expect(error.message).to.contain(`Couldn't find the iunctio path folder`);
    }
  });

});

function getMockSchemaValidation(returns){
  let stubs = {
    validate: sinon.stub().returns(returns.validate),
    resolveSchema: sinon.stub().returns(returns.resolveSchema)
  };
  let returnedClass = class SchemaValidation{
    constructor(){
      this.validate = stubs.validate;
      this.resolveSchema = stubs.resolveSchema;
    }
  }
  returnedClass.stubs = stubs;
  return returnedClass;
}

function getMockHomeManager(returns){
  return {
    initialize: sinon.stub(),
    getExpressCustomization: sinon.stub().returns(returns.getExpressCustomization),
    setSettings: sinon.stub()
  }
}