const WebSocket = require('ws');
var mws;
var msgs = [];
var isOpen;
var mWebSocketUrl;
module.exports = class WebsocketClient {


    constructor(url) {
        mWebSocketUrl = url;
        this.initWebsocket();
    }

    initWebsocket() {
        console.log("init");
        mws = new WebSocket(mWebSocketUrl);
        mws.on('error', function (e) {
            console.error(e)
        });

        mws.on('open', function open() {
            console.log("open");
            isOpen = true;
            if (msgs.length > 0) {
                for (let i = 0; i < msgs.length; i++) {
                    mws.send(JSON.stringify(msgs[i]))
                }
            }
        });

        mws.on('close', () => {
            isOpen = false;
            this.initWebsocket()
        });
    }

    static notify(event) {
        WebsocketClient.sendMessage(event);
    }


    static sendMessage(msg) {
        if (isOpen) {
            console.log("sending");
            mws.send(JSON.stringify(msg));
        }
        else
            WebsocketClient.addToQueue(msg)
    }

    static addToQueue(msg) {
        msgs.push(msg);
    }
};