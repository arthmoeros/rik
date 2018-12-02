const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

describe('SchemaValidation', () => {

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

  it('should resolveIunctioSchema', () => {
    let mockJoiYml = {
      getBuilt: sinon.stub().returns({})
    };

    mockery.registerMock('joi-yml', mockJoiYml);
    
    const SchemaValidation = require('./schema-validation');
    const validator = new SchemaValidation();
    let mockResource = {
      metadata: {
        schemas: {
          getreq: {}
        }
      }
    }
    let schema = validator.resolveIunctioSchema(mockResource,'get','req');

    expect(schema).to.not.be.undefined;
  });

  it('should resolveIunctioSchema (undefined schema requested)', () => {
    let mockJoiYml = {
      getBuilt: sinon.stub().returns({})
    };

    mockery.registerMock('joi-yml', mockJoiYml);
    
    const SchemaValidation = require('./schema-validation');
    const validator = new SchemaValidation();
    let mockResource = {
      metadata: {
        schemas: {
        }
      }
    }
    try {
      validator.resolveIunctioSchema(mockResource,'get','req');
      expect(true,'expected thrown error').to.be.false;
    } catch (error) {
      expect(error.message).to.be.eq('Schema type req for handler get is undefined!');
    }
  });

  it('should validateIunctioObject', () => {
    let mockJoi = {
      validate: sinon.stub().returns({})
    };

    mockery.registerMock('joi', mockJoi);
    
    const SchemaValidation = require('./schema-validation');
    const validator = new SchemaValidation();
    let validationError = validator.validateIunctioObject({},{},'post',true);

    expect(validationError).to.not.be.undefined;
    expect(mockJoi.validate.called).to.be.true;
  });

  it('should validateIunctioObject (get request)', () => {
    let mockJoi = {
      validate: sinon.stub().returns({})
    };

    mockery.registerMock('joi', mockJoi);
    
    const SchemaValidation = require('./schema-validation');
    const validator = new SchemaValidation();
    let validationError = validator.validateIunctioObject({},{},'get',true);

    expect(validationError).to.not.be.undefined;
    expect(mockJoi.validate.called).to.be.true;
  });

});