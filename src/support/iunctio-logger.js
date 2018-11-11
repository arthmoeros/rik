const serializeError = require('serialize-error');

class IunctioLogger {

  static getInstance(){
    return LOGGER_INSTANCE;
  }

  setCustomLogger(customLogger) {
    this.customLogger = customLogger;
  }

  info(message, component, stage) {
    if (this.customLogger) {
      this.customLogger.info({
        message,
        component,
        stage
      });
    } else {
      console.log(`INFO [${component}:${stage}:${new Date().toISOString()}] ${message}`);
    }
  }

  warn(message, component, stage, error) {
    if (this.customLogger) {
      this.customLogger.warn({
        message,
        component,
        stage,
        error: error !== undefined ? serializeError(error) : ''
      });
    } else {
      console.log(`WARN [${component}:${stage}:${new Date().toISOString()}] ${message} ${error}`);
    }
  }

  error(message, component, stage, error) {
    if (this.customLogger) {
      this.customLogger.warn({
        message,
        component,
        stage,
        error: error !== undefined ? serializeError(error) : ''
      });
    } else {
      console.log(`ERROR [${component}:${stage}:${new Date().toISOString()}] ${message} ${error}`);
    }
  }

}

const LOGGER_INSTANCE = new IunctioLogger();

module.exports = IunctioLogger.getInstance();