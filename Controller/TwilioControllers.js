const twilioConnect = require('./ConnectTwilioController');
var speechToText = require("./SpeechToTextController");

function makeResponse(success, value, error) {
    var response = {
        "status": success,
        "value": value,
        "error": error
    };
    return response;
}

var twilioController = {
    // receice SMS from twilio
    postReceiveSMS: function (req, res) {
        console.log(req.body.From);
        console.log(req.body.Body);
    },
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // receice Voice from twilio
    postReceiveVoice: function (req, res) {
        res.set('Content-Type', 'text/xml');
        const VoiceResponse = require('twilio').twiml.VoiceResponse;
        const twiml = new VoiceResponse();
        twiml.say('Hello. please leave a message after the beep.');
        var recordURL = req.protocol + '://' + req.get('host') + '/record';
        twiml.record({
            recordingStatusCallback: recordURL,
            method: 'POST'
        });
        twiml.hangup();
        res.type('text/xml');
        res.send(twiml.toString());
    },
    postReceiveRecord: function (req, res) {
        var recordURL = req.body.RecordingURL;
        var responseObjc = {
        };
        speechToText.getTextFromVoice(recordURL, function (err, transcription) {
            responseObjc.fullName = transcription;
            console.log(responseObjc);

            twilioConnect.twilios.calls(req.body.CallSid)
            .fetch().then(call =>{
                console.log(call.from);
                responseObjc.sdt = call.from;
                res.json(responseObjc);
            }).done();
        });
    }
}
module.exports = twilioController;