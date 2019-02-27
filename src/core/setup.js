const logger = require('../support/rik-logger');
const fs = require('fs');
const path = require('path');
const jsYaml = require('js-yaml');
const SchemaValidation = require('./schema-validation');
const rikHomeManager = require('./rik-home.manager');

function setup() {
  let schemaValidation = new SchemaValidation();
  let argumentRIKHome = process.argv[2];
  if (argumentRIKHome) {
    if (!path.isAbsolute(argumentRIKHome)) {
      argumentRIKHome = path.join(process.cwd(), argumentRIKHome);
    }
  }
  const RIK_HOME = argumentRIKHome || process.env.RIK_HOME || path.join(process.cwd(), 'rik')

  if (!path.isAbsolute(RIK_HOME)) {
    throw new Error('RIK_HOME must be an absolute path');
  }

  if (!fs.existsSync(RIK_HOME)) {
    throw new Error(`Couldn't find the rik path folder -> ${RIK_HOME}`);
  }

  // Set RIK_HOME to home manager to be able to use it
  rikHomeManager.initialize(RIK_HOME);

  // Logger is first set here
  let rikCustomization = rikHomeManager.getExpressCustomization();
  if (rikCustomization && rikCustomization.getCustomLogger) {
    logger.setCustomLogger(rikCustomization.getCustomLogger());
  }

  logger.info(
    `Using resources from ${RIK_HOME}`,
    'Setup',
    'LocatedResourcesPathFolder'
  );

  let settingsFilePath = path.join(RIK_HOME, 'settings.yml');
  let settings;
  if (fs.existsSync(settingsFilePath)) {
    settings = jsYaml.load(fs.readFileSync(path.join(RIK_HOME, 'settings.yml')));
    let settingsSchema = schemaValidation.resolveSchema(path.join(__dirname, '../support/schemas/settings.schema.yml'));
    let errors = schemaValidation.validate(settingsSchema, settings);
    if (errors && errors.error) {
      throw new Error(`Invalid RIK settings file at ${settingsFilePath}, details -> ${JSON.stringify(errors)}`);
    }

  } else {
    logger.warn(
      `Couldn't locate RIK settings file at: ${settingsFilePath}, using fallback settings instead`,
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
  rikHomeManager.setSettings(settings);

  logger.info(
    `RIK will use API Version mode: ${settings.apiVersion.mode}`,
    'Setup',
    'LoadSettings'
  );
}

module.exports = setup;