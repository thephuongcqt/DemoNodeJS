const speech = require('@google-cloud/speech');
const fs = require('fs');
const https = require('https');

const client = new speech.SpeechClient();
const recordUrl = "https://api.twilio.com/2010-04-01/Accounts/AC0182c9b950c8fe1229f93aeb40900a5d/Recordings/RE0b370a1548be00d91273116fb2d8cd0d";

var sttFunctions = {
    getTextFromVoice: function(url, callBackMethod){
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
        
                client
                    .recognize(request)
                    .then(data => {
                        const response = data[0];
                        const transcription = response.results
                            .map(result => result.alternatives[0].transcript)
                            .join('\n');
                        console.log(`Transcription: ${transcription}`);
                        callBackMethod(null, transcription);
                    })
                    .catch(err => {
                        console.error('ERROR:', err);
                        callBackMethod(err, null);
                    });
            });
        });
    }
};
module.exports = sttFunctions;