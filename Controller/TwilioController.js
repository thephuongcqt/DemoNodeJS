module.exports = function(app, express){
    var apiRouter = express.Router();

    apiRouter.get("/Voice", function(req, res){
        res.set('Content-Type', 'text/xml');        
        const VoiceResponse = require('twilio').twiml.VoiceResponse;
        const twiml = new VoiceResponse();
        twiml.play('https://firebasestorage.googleapis.com/v0/b/chatfirebase-1e377.appspot.com/o/Welcome.mp3?alt=media&token=6914df70-85d3-4ea4-9ce0-edf4516ea353');
        twiml.record({
            recordingStatusCallback: 'https://callcenterapi.herokuapp.com/twilio/Recorded',
            method: 'POST',
        });
        res.end(twiml.toString());        
    });

    apiRouter.post("/Recorded", function (req, res){
        var speechToText = require("./SpeechToTextController");

        speechToText.getTextFromVoice(req.body.RecordingUrl, function(err, transcription){
            console.log("ERROR: " + err);
            console.log("Transcript: " + transcription);
        });
    });
    return apiRouter;
};