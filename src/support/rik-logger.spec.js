const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

describe('RIKLogger', () => {

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

  it('should log info into console without customLogger set', () => {
    let consoleLogBk = console.log;
    let consoleLogMock = sinon.stub();
    
    const logger = require('./rik-logger');
    logger.setCustomLogger(undefined);
    
    console.log = consoleLogMock;
    logger.info('','','');
    console.log = consoleLogBk;

    expect(consoleLogMock.called).to.be.true;
  });

  it('should log info into customLogger set', () => {
    const logger = require('./rik-logger');
    let customLogger = {
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub()
    }
    logger.setCustomLogger(customLogger);
    
    logger.info('','','');

    expect(customLogger.info.called).to.be.true;
  });

  it('should log warn into console without customLogger set', () => {
    let consoleLogBk = console.log;
    let consoleLogMock = sinon.stub();
    
    const logger = require('./rik-logger');
    logger.setCustomLogger(undefined);
    
    console.log = consoleLogMock;
    logger.warn('','','');
    logger.warn('','','', new Error());
    console.log = consoleLogBk;

    expect(consoleLogMock.called).to.be.true;
  });

  it('should log warn into customLogger set', () => {
    let mockSerializeError = sinon.stub();
    mockery.registerMock('serialize-error', mockSerializeError);
    
    const logger = require('./rik-logger');
    let customLogger = {
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub()
    }
    logger.setCustomLogger(customLogger);
    
    logger.warn('','','');
    logger.warn('','','', new Error());

    expect(mockSerializeError.called).to.be.true;
    expect(customLogger.warn.called).to.be.true;
  });

  it('should log error into console without customLogger set', () => {
    let consoleLogBk = console.log;
    let consoleLogMock = sinon.stub();
    
    const logger = require('./rik-logger');
    logger.setCustomLogger(undefined);
    
    console.log = consoleLogMock;
    logger.error('','','');
    logger.error('','','', new Error());
    console.log = consoleLogBk;

    expect(consoleLogMock.called).to.be.true;
  });

  it('should log error into customLogger set', () => {
    let mockSerializeError = sinon.stub();
    mockery.registerMock('serialize-error', mockSerializeError);
    
    const logger = require('./rik-logger');
    let customLogger = {
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub()
    }
    logger.setCustomLogger(customLogger);
    
    logger.error('','','');
    logger.error('','','', new Error());

    expect(mockSerializeError.called).to.be.true;
    expect(customLogger.error.called).to.be.true;
  });

});