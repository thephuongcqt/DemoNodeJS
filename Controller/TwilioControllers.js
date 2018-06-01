const twilioConnect = require('./ConnectTwilioController');

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
        twiml.record();
        twiml.hangup();

        res.type('text/xml');
        res.send(twiml.toString());

    }
}
module.exports = twilioController;