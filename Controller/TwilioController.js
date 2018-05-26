// module.exports =  GOOGLE_APPLICATION_CREDENTIALS="./123123.json";

// const speech = require('@google-cloud/speech');
// const fs = require('fs');

// // Creates a client
// const client = new speech.SpeechClient();

// // The name of the audio file to transcribe
// const fileName = __dirname + '/Welcome.mp3';

// // Reads a local audio file and converts it to base64
// const file = fs.readFileSync(fileName);
// const audioBytes = file.toString('base64');

// // The audio file's encoding, sample rate in hertz, and BCP-47 language code
// const audio = {
//   content: audioBytes,
// };
// const config = {
//   encoding: 'LINEAR16',
//   sampleRateHertz: 16000,
//   languageCode: 'en-US',
// };
// const request = {
//   audio: audio,
//   config: config,
// };

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
        const accountSid = 'AC0182c9b950c8fe1229f93aeb40900a5d';
        const authToken = '903448ab8b8a1e8a59bf62126841bd10';
        const client = require('twilio')(accountSid, authToken);        
        console.log(req.body); 
        console.log(req.body.RecordingUrl);


        // client
        //     .recognize(request)
        //     .then(data => {
        //         const response = data[0];
        //         const transcription = response.results
        //         .map(result => result.alternatives[0].transcript)
        //         .join('\n');
        //         console.log(`Transcription: ${transcription}`);
        //     })
        //     .catch(err => {
        //         console.error('ERROR:', err);
        //     });
        // res.end();
    });
    return apiRouter;
};