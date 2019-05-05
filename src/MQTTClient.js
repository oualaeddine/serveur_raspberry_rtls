const Utils = require('./Utils.js');

/**
 * This module manage the mqtt connection to central server
 */
module.exports = class MQTTClient {
    
    /**
     * Init the module
     */
    constructor(configuration){
        this.handlers = [];
        
        this.mqtt = require('mqtt');

        let url = 'mqtt://' + configuration.getConfigurationData('mqtt:broker_url');
        
        let options = {
                port: configuration.getConfigurationData('mqtt:port'),
                host: url,
                username: configuration.getConfigurationData('mqtt:authentification:username'),
                password: configuration.getConfigurationData('mqtt:authentification:password'),
        }

        this.mqttClient  =  this.mqtt.connect(url, options);
        
        if(!this.mqttClient.connected){
            console.log('mqtt client not connected');
        }
        
        this.chanSub     =  configuration.getConfigurationData('mqtt:chanel_subscribe');
        this.chanPub     =  configuration.getConfigurationData('mqtt:chanel_publish');
        
        this.configuration = configuration;

        console.log("init mqtt with broker (", url, "), chanel sub (", this.chanSub, "), chanel pub (", this.chanPub,")");   
    }

    /**
     * Send a message to a chanel
     * @param jsonObject
     */
    sendMessage(jsonObject) {
        let response = typeof jsonObject !== "string"
            ? JSON.stringify(jsonObject) : jsonObject;

        this.mqttClient.publish(this.chanPub, response);
    }
    
    

    processMessage(topic, message) {
        if(!Utils.isJson(message)){
            return;
        }
        
        let jsonObject = JSON.parse(message);

        switch (jsonObject.event) {
            case "beaconData":
                if(!("data" in jsonObject)) return;
                if(!("idRelai" in jsonObject)) return;
                
                this.notifyAllObservers(jsonObject);
                
                break;
            default:
                this.sendMessage(this.makeResponse(404, "command not found"));
                break;
        }
    }

    /**
     * Format the code error of a response
     * @param codeRep response code
     * @param messageTxt response message
     * @returns json object as a string
     */
    makeResponse(codeRep, messageTxt) {
        let jsonObject = { code : codeRep, message : messageTxt};
        return JSON.stringify({response: jsonObject});
    }

    /**
     * Connect the mqtt Client
     */
    connect() {
        
        var chanSubTmp = this.chanSub;
        var mqttClient = this.mqttClient;
        var thisObject = this;
        
        
        this.mqttClient.on('connect', function () {
            mqttClient.subscribe(chanSubTmp);
        });

        this.mqttClient.on('message', function (topic, message) {
            thisObject.processMessage(topic, message + '');
        });
    }

    /**
     * Disconnect the mqtt Client
     */
    disconnect(){
        this.mqttClient.end();
    }


    /**
     * Notify all observers by a message which are a json string
     * @param messageJson
     */
    notifyAllObservers(eventData) {
        this.handlers.forEach(function(item) {
            item.notify(eventData);
        });
    }

    /**
     * Add an observer to the scanner
     * @param observer
     */
    addObserver(observer) {
        this.handlers.push(observer);
    }

    /**
     * Remove observer to the scanner
     * @param observer
     */
    removeObserver(observer) {
        this.handlers = this.handlers.filter(
            function(item) {
                if (item !== observer) {
                    return item;
                }
            }
        );
    }
    
    notify(message) {
        this.mqttClient.publish("ktalyse/test", JSON.stringify(message));
    }
    
}
