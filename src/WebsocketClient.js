const WebSocket = require('ws');
var mws;
var msgs = [];
var isOpen;
var mWebSocketUrl;
module.exports = class WebsocketClient {


    constructor(url) {
        mWebSocketUrl = url;
        console.log(url)
        this.initWebsocket();
    }

    initWebsocket() {
        console.log("init");
        mws = new WebSocket(mWebSocketUrl);
        mws.on('error', function (e) {
          //  console.error(e)
        });

        mws.on('open', function open() {
            console.log("open");
            isOpen = true;
        });

        mws.on('close', () => {
            isOpen = false;
            this.initWebsocket()
        });
    }

    notify(event) {
        this.sendMessage(event);
    }


     sendMessage(msg) {
        if (isOpen) {
            console.log("sending");
            console.log(msg);
            mws.send(JSON.stringify(msg));
        }
    }
};