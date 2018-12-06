const logger = require('../support/iunctio-logger');
const fs = require('fs');
const path = require('path');
const jsYaml = require('js-yaml');
const SchemaValidation = require('./schema-validation');
const iunctioHomeManager = require('./iunctio-home.manager');

function setup() {
  let schemaValidation = new SchemaValidation();
  let argumentIunctioHome = process.argv[2];
  if (argumentIunctioHome) {
    if (!path.isAbsolute(argumentIunctioHome)) {
      argumentIunctioHome = path.join(process.cwd(), argumentIunctioHome);
    }
  }
  const IUNCTIO_HOME = argumentIunctioHome || process.env.IUNCTIO_HOME || path.join(process.cwd(), 'iunctio')

  if (!path.isAbsolute(IUNCTIO_HOME)) {
    throw new Error('IUNCTIO_HOME must be an absolute path');
  }

  if (!fs.existsSync(IUNCTIO_HOME)) {
    throw new Error(`Couldn't find the iunctio path folder -> ${IUNCTIO_HOME}`);
  }

  // Set IUNCTIO_HOME to home manager to be able to use it
  iunctioHomeManager.initialize(IUNCTIO_HOME);

  // Logger is first set here
  let iunctioCustomization = iunctioHomeManager.getExpressCustomization();
  if (iunctioCustomization && iunctioCustomization.getCustomLogger) {
    logger.setCustomLogger(iunctioCustomization.getCustomLogger());
  }

  logger.info(
    `Using resources from ${IUNCTIO_HOME}`,
    'Setup',
    'LocatedResourcesPathFolder'
  );

  let settingsFilePath = path.join(IUNCTIO_HOME, 'settings.yml');
  let settings;
  if (fs.existsSync(settingsFilePath)) {
    settings = jsYaml.load(fs.readFileSync(path.join(IUNCTIO_HOME, 'settings.yml')));
    let settingsSchema = schemaValidation.resolveSchema(path.join(__dirname, '../support/schemas/settings.schema.yml'));
    let errors = schemaValidation.validate(settingsSchema, settings);
    if (errors && errors.error) {
      throw new Error(`Invalid Iunctio settings file at ${settingsFilePath}, details -> ${JSON.stringify(errors)}`);
    }

  } else {
    logger.warn(
      `Couldn't locate Iunctio settings file at: ${settingsFilePath}, using fallback settings instead`,
      'Setup',
      'LoadSettings'
    );
    settings = {
      apiVersion: {
        mode: 'path'
      },
      cors: {
        allowedHeaders: []
      }
    };
  }
  iunctioHomeManager.setSettings(settings);

  logger.info(
    `Iunctio will use API Version mode: ${settings.apiVersion.mode}`,
    'Setup',
    'LoadSettings'
  );
}

module.exports = setup;