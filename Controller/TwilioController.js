var speechToText = require("./SpeechToTextController");
const accountSid = 'AC0182c9b950c8fe1229f93aeb40900a5d';
const authToken = '903448ab8b8a1e8a59bf62126841bd10';
const client = require('twilio')(accountSid, authToken);

module.exports = function(app, express){
    var apiRouter = express.Router();

    apiRouter.get("/Voice", function(req, res){
        res.set('Content-Type', 'text/xml');        
        const VoiceResponse = require('twilio').twiml.VoiceResponse;
        var recordURL = req.protocol + '://' + req.get('host') + '/record';
        const twiml = new VoiceResponse();
        twiml.play('https://firebasestorage.googleapis.com/v0/b/chatfirebase-1e377.appspot.com/o/Welcome.mp3?alt=media&token=6914df70-85d3-4ea4-9ce0-edf4516ea353');
        twiml.record({
            recordingStatusCallback: recordURL,
            method: 'POST',
        });
        res.end(twiml.toString());        
    });

    apiRouter.post("/Recorded", function (req, res){            
        var responseObjc = {                        
        };    
        speechToText.getTextFromVoice(req.body.RecordingUrl, function(err, transcription){
            console.log("ERROR: " + err);
            console.log("Transcript: " + transcription);       
            responseObjc.fullName = transcription;
            
            client.calls(req.body.CallSid)
            .fetch()
            .then(call => {
                console.log(call.from);
                responseObjc.sdt = call.from;
                res.json(responseObjc);
            })
            .done();
        });
    });
    apiRouter.post("/PostLogin", function(req, res){
        res.json({
            "username": "phuongnt",
            "password": "",
            
        })
    })
    return apiRouter;
};
