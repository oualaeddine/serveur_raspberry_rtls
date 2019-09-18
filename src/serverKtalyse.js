const Utils = require('./Utils.js');
const Configuration = require('./Configuration.js');
const MQTTClient = require('./MQTTClient.js');
const SIM800Interpreter = require('./SIM800Interpreter.js');
const Locator = require('./Locator.js');
const WebsocketClient = require('./WebsocketClient.js');



console.log("init configuration");

var configuration = new Configuration("../configuration.json");

//var sim800Interpreter = new SIM800Interpreter(configuration.getConfigurationData('sim800:path'), configuration.getConfigurationData('sim800:baudrate'));

var mqttClient = new MQTTClient(configuration);

//var locator = new Locator(configuration);

var websocketClient = new WebsocketClient(configuration.getConfigurationData('websocket:url'));

mqttClient.addObserver(websocketClient);

//mqttClient.addObserver(locator);

//locator.addObserver(sim800Interpreter);

locator.addObserver(mqttClient);



console.log("connect mqtt");
mqttClient.connect();

/*sim800Interpreter.setup().then( data => {
    let result = sim800Interpreter.sendMessage('+33643157569', 'SMS READY');
})*/
