const speech = require('@google-cloud/speech');
const https = require('https');
const http = require('http');
var fs = require('fs');
var logger = require("../Utils/Logger");
const googleClient = new speech.SpeechClient({
    keyFilename: './Certificate/googleservices.json'
});
const fptServicesUrl = "http://api.openfpt.vn/text2speech/v4";
const apiKeyFPT = "54ba20f8352e404d858e9619e3a752b0";
const request = require('request');
const audioUri = "Files/";

var services = {
    getTextFromVoice: function (url) {
        return new Promise((resolve, reject) => {
            https.get(url, function (res) {
                var data = []; // List of Buffer objects
                res.on("data", function (chunk) {
                    data.push(chunk); // Append Buffer object
                });
                res.on("end", function () {
                    data = Buffer.concat(data); // Make one large Buffer of it
                    const audioBytes = data.toString("base64");
                    const audio = {
                        content: audioBytes,
                    };
                    const config = {
                        encoding: 'LINEAR16',
                        sampleRateHertz: 8000,
                        languageCode: 'vi-VN',
                    };
                    const request = {
                        audio: audio,
                        config: config,
                    };
                    googleClient
                        .recognize(request)
                        .then(data => {
                            const response = data[0];
                            const transcription = response.results
                                .map(result => result.alternatives[0].transcript)
                                .join('\n');
                            resolve(transcription);
                        })
                        .catch(err => {
                            logger.log(err);
                            reject(err);
                        });
                });
            });
        });
    },

    getVoiceFromText: function (text, username, delayTime) {
        if (!delayTime) {
            delayTime = 2000;
        }
        var options = {
            uri: 'http://api.openfpt.vn/text2speech/v4',
            method: 'POST',
            headers: {
                accept: 'application/json',
                api_key: apiKeyFPT,
                voice: 'hatieumai',
                speed: -1,
                prosody: 1
            },
            body: text
        };
        return new Promise((resolve, reject) => {
            request(options, async function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var responseObj = JSON.parse(body);
                    logger.log(new Error(JSON.stringify(responseObj)));
                    var destinationUri = audioUri + username + new Date().getTime() + ".mp3";

                    var delayFunction = async () => {
                        await services.downloadFile(responseObj.async, destinationUri);
                        if (services.getFilesizeInBytes(destinationUri) > 100) {
                            resolve("/" + destinationUri);
                        } else {
                            logger.log(new Error("File: " + destinationUri + " size: " + services.getFilesizeInBytes(destinationUri)));
                            setTimeout(this, 200);
                        }
                    }
                    setTimeout(delayFunction, 2000);
                } else {
                    reject(error);
                }
            });
        })
    },

    downloadFile: async (url, filePath) => {
        return new Promise((resolve, reject) => {
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath);
                }

                var file = fs.createWriteStream(filePath);
                
                https.get(url, function (response) {
                    response.pipe(file);
                    file.on('finish', function () {
                        file.close(resolve());                        
                    });
                    file.on('error', function (err) {
                        fs.unlink(dest);
                        reject(err);
                    });
                });
            } catch (error) {
                reject(error);
            }
        })
    },

    getFilesizeInBytes: function (filename) {
        var stats = fs.statSync(filename)
        var fileSizeInBytes = stats["size"]
        return fileSizeInBytes
    }
};
module.exports = services;