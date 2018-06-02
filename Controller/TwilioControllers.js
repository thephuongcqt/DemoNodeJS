const twilioConnect = require('./ConnectTwilioController');
var speechToText = require('./SpeechToTextController');
var appointmentRequest = require('./AppointmentController');

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
        var recordURL = req.body.RecordingUrl;
        var responseObjc = {
        };
<<<<<<< HEAD
        speechToText.getTextFromVoice(recordURL, function (err, transcription) {
=======
        // speed to text
        speechToText.getTextFromVoice(recordURL, function (err, transcription) {
            var patientName;
>>>>>>> 112fe9e36dd89b4544f225382f4d0940304a3c07
            responseObjc.fullName = transcription;
            // require phone number from twilio
            twilioConnect.twilios.calls(req.body.CallSid)
                .fetch().then(call => {
                    responseObjc.sdt = call.from;
                    // make appointment
                    var apppointUrl = req.protocol + '://' + req.get('host') + '/getListAllAppointment';
                    console.log(apppointUrl);
                }).done();

        });
    }
}
module.exports = twilioController;