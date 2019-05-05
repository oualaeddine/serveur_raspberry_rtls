const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

module.exports = class SIM800Interpreter {

    
    /**
         * Init the module
         * @param path path to the serial port
         * @param baudrate
         */
        
    constructor(path, baudrateValue){
        this.isReady = false;
        this.parser = new Readline();

        console.log("init sim800 (", path, "), baudrate (", baudrateValue, ")");
        
        this.port = new SerialPort(path, { baudRate: baudrateValue });
        this.port.pipe(this.parser);
        
        this.parser.on('data', line => console.log(line));
    
        
        this.port.on('open', function() {
            console.log('port opened');
        });
    }
    
    setup() {
        return new Promise((resolve, reject) => {
            var portVar = this.port;
            this.port.write('AT\r', function () {
                portVar.drain(function(){
                  portVar.write('AT+IPR=9600\r', function(){
                    portVar.drain(function(){                  
                        portVar.write('AT+CMGF=1\r', function(){
                            portVar.drain(function(){
                                portVar.write('AT+CPIN?\r', function(){
                                    portVar.drain(function(){
                                        portVar.write('AT+CPIN=0000\r', function(){
                                            portVar.drain(function(){
                                                resolve(true);
                                            })
                                        })
                                    })
                                })    
                            })                        
                        })  
                    })
                  })  
                })
            });
        })
        
    }
    
    sendMessage(phoneNumber, message) {
        var portVar = this.port;
        
        
        this.port.write('AT+CMGS="' + phoneNumber + '"\r', function(){
            portVar.drain(function(){
                portVar.write(message + String.fromCharCode(26))
            })
        });
        
        return true;       
    }
    
    notify(message) {
        this.sendMessage(message['phoneNumber'], message['message']);
    }
}
