const joi = require('joi');
const joiYml = require('joi-yml');

function resolveSchema(resource, handlerType, schemaType) {
  let schemaFileName = resource.metadata.schemas[`${handlerType}${schemaType}`];
  if (schemaFileName) {
    return joiYml.getBuilt(schemaFileName);
  } else {
    throw new Error(`Schema type ${schemaType} for handler ${handlerType} is undefined!`);
  }
}

function validate(schema, obj, handlerType, isRequest) {
  if (handlerType === 'get' && isRequest) {
    return joi.validate(obj.query, schema);
  } else {
    return joi.validate(obj.body, schema);
  }
}

module.exports = { resolveSchema, validate };