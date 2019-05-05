

/**
 * Configuration module. Wich used to manage the configuration of the system
 * @type {{getConfigurationData, initModule, updateConfiguration}}
 */
module.exports = class Configuration {

    /**
     * Init the configuration
     * @param pathFile
     */
    constructor(pathFile){
        this.fs    = require('fs');
        this.nconf = require('nconf');


        this.nconf.argv()
            .env()
            .file({ file: pathFile });
    }

    /**
     * Get a data from the configuration file following a path of the data.
     * Example of path: root:node:leef
     * @param pathData
     * @returns {*}
     */
    getConfigurationData(pathData) {
        return this.nconf.get(pathData);
    }

    /**
     * Update or create a field on the configuration file.
     * Example of path: root:node:leef
     * @param pathData
     * @param data
     */
    updateConfiguration(pathData, data){
        this.nconf.set(pathData, data);
        this.nconf.save();
    }
}
