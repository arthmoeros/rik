const fs = require('fs');
const jsYaml = require('js-yaml');
const RESOURCES_PATH = process.env.IUNCTIO_HOME || `${process.cwd()}/resources`

if(!RESOURCES_PATH.startsWith('/')){
    throw new Error('IUNCTIO_HOME must be an absolute path');
}
 
/**
 * @typedef {object} ResourceController
 * @property {function(any,any,any,any):void} get
 * @property {function(any,any,any,any):void} post
 * @property {function(any,any,any,any):void} patch
 * @property {function(any,any,any,any):void} delete
 */

/**
 * @typedef {object} Metadata
 * @property {string} version
 * @property {string} name
 * @property {boolean} get
 * @property {boolean} post
 * @property {boolean} patch
 * @property {boolean} delete
 */

 /**
  * @typedef {object} ResourceConfig
  * @property {ResourceController} resourceController
  * @property {Metadata} metadata
  */

class ConfigHelper{

    /**
     * 
     * @returns {ResourceConfig}
     */
    getConfig(name){
        let resourcePath = `${RESOURCES_PATH}/${name}`;
        let config = {
            resourceController: require(`${resourcePath}/resource-controller`),
            metadata: jsYaml.load(fs.readFileSync(`${resourcePath}/config.yml`))
        };
        config.metadata.name = name;
        return config;
    }

    getConfigs(){
        return fs.readdirSync(RESOURCES_PATH);
    }

}

module.exports = ConfigHelper;