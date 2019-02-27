const joi = require('joi');
const joiYml = require('joi-yml');

class SchemaValidation {

  resolveRIKSchema(resource, handlerType, schemaType) {
    let schemaFileName = resource.metadata.schemas[`${handlerType}${schemaType}`];
    if (schemaFileName) {
      return this.resolveSchema(schemaFileName);
    } else {
      throw new Error(`Schema type ${schemaType} for handler ${handlerType} is undefined!`);
    }
  }
  
  resolveSchema(schemaFileName){
    return joiYml.getBuilt(schemaFileName);
  }
  
  validateRIKObject(schema, obj, handlerType, isRequest) {
    if (handlerType === 'get' && isRequest) {
      return this.validate(schema, obj.query);
    } else {
      return this.validate(schema, obj.body);
    }
  }
  
  validate(schema, obj){
    return joi.validate(obj, schema);
  }

}

module.exports = SchemaValidation;