const http = require('http');
const https = require('https');


const options = {
    host: 'localhost',
    port: 443,
    path: 'api/getConfig',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

/**
 * getJSON:  RESTful GET request returning JSON object(s)
 * @param onResult: callback to pass the results JSON object(s) back
 */

module.exports.getJSON = ( onResult) => {


    console.log('rest::getJSON');
    // noinspection EqualityComparisonWithCoercionJS
    const port = options.port == 443 ? https : http;

    let output = '';

    const req = port.request(options, (res) => {
        console.log(`${options.host} : ${res.statusCode}`);
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
            output += chunk;
        });

        res.on('end', () => {
            let obj = JSON.parse(output);

            onResult(res.statusCode, obj);
        });
    });

    req.on('error', (err) => {
        // res.send('error: ' + err.message);
    });

    req.end();
};