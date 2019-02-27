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
    mockery.registerMock('../support/rik-logger', {
      info: () => { },
      warn: () => { },
      error: () => { },
    });
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should resolveRIKSchema', () => {
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
    let schema = validator.resolveRIKSchema(mockResource,'get','req');

    expect(schema).to.not.be.undefined;
  });

  it('should resolveRIKSchema (undefined schema requested)', () => {
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
      validator.resolveRIKSchema(mockResource,'get','req');
      expect(true,'expected thrown error').to.be.false;
    } catch (error) {
      expect(error.message).to.be.eq('Schema type req for handler get is undefined!');
    }
  });

  it('should validateRIKObject', () => {
    let mockJoi = {
      validate: sinon.stub().returns({})
    };

    mockery.registerMock('joi', mockJoi);
    
    const SchemaValidation = require('./schema-validation');
    const validator = new SchemaValidation();
    let validationError = validator.validateRIKObject({},{},'post',true);

    expect(validationError).to.not.be.undefined;
    expect(mockJoi.validate.called).to.be.true;
  });

  it('should validateRIKObject (get request)', () => {
    let mockJoi = {
      validate: sinon.stub().returns({})
    };

    mockery.registerMock('joi', mockJoi);
    
    const SchemaValidation = require('./schema-validation');
    const validator = new SchemaValidation();
    let validationError = validator.validateRIKObject({},{},'get',true);

    expect(validationError).to.not.be.undefined;
    expect(mockJoi.validate.called).to.be.true;
  });

});