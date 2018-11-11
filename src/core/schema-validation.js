const joi = require('joi');
const joiYml = require('joi-yml');

function resolveIunctioSchema(resource, handlerType, schemaType) {
  let schemaFileName = resource.metadata.schemas[`${handlerType}${schemaType}`];
  if (schemaFileName) {
    return resolveSchema(schemaFileName);
  } else {
    throw new Error(`Schema type ${schemaType} for handler ${handlerType} is undefined!`);
  }
}

function resolveSchema(schemaFileName){
  return joiYml.getBuilt(schemaFileName);
}

function validateIunctioObject(schema, obj, handlerType, isRequest) {
  if (handlerType === 'get' && isRequest) {
    return validate(schema, obj.query);
  } else {
    return validate(schema, obj.body);
  }
}

function validate(schema, obj){
  return joi.validate(obj, schema);
}

module.exports = { resolveSchema, validate, resolveIunctioSchema, validateIunctioObject };