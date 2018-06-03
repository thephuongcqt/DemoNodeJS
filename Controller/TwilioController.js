var speechToText = require("./SpeechToTextController");
const accountSid = 'AC0182c9b950c8fe1229f93aeb40900a5d';
const authToken = '903448ab8b8a1e8a59bf62126841bd10';
const client = require('twilio')(accountSid, authToken);
var utils = require("./Utils");
var db = require("./DBUtils");

function makeAppointment(patientPhone, patientName, clinicPhone) {
    //get clinicUsername from phoneNumber
    db.User.forge({ "phoneNumber": clinicPhone })
        .fetch()
        .then(function (model) {
            if (model != null) {
                var clinicUsername = model.attributes.username;
                var patient = {
                    "phoneNumber": patientPhone,
                    "fullName": patientName,
                    "totalAppointment": 0,
                    "abortedAppointment": 0
                };
                //insert Patient
                db.Patient.forge(patient)
                    .save()
                    .then(function (model) {
                        var newPatient = model.toJSON();                        
                        var newAppointment = {
                            "clinicUsername": clinicUsername,
                            "patientID": newPatient.id,
                            "appointmentTime": new Date(),
                            "status": 1                    
                        };
                        // insert Appointment                        
                        db.Appointment.forge(newAppointment)
                        .save()
                        .then(function(model){
                            //need to notify to clinic and patient
                            console.log(model.toJSON());
                        })
                        .catch(function(err){
                            console.log(err.message);
                        })
                    })
                    .catch(function (err) {
                        console.log(err.message);
                    });
            } else {
                console.log("Make appoiontment faile: clinicphone:" + clinicPhone + " patientphone: " + patientPhone);
            }
        })
        .catch(function (err) {
            console.log(err.message);
        });
}

module.exports = function (app, express) {
    var apiRouter = express.Router();

    apiRouter.get("/Voice", function (req, res) {
        res.set('Content-Type', 'text/xml');
        const VoiceResponse = require('twilio').twiml.VoiceResponse;
        var recordURL = req.protocol + '://' + req.get('host') + '/twilio/Recorded';
        const twiml = new VoiceResponse();
        twiml.play('https://firebasestorage.googleapis.com/v0/b/chatfirebase-1e377.appspot.com/o/Welcome.mp3?alt=media&token=6914df70-85d3-4ea4-9ce0-edf4516ea353');
        twiml.record({
            recordingStatusCallback: recordURL,
            method: 'POST',
        });
        res.end(twiml.toString());
    });

    apiRouter.post("/Recorded", function (req, res) {
        res.end();
        speechToText.getTextFromVoice(req.body.RecordingUrl, function (err, patientName) {
            console.log("ERROR: " + err);
            console.log("Transcript: " + patientName);

            client.calls(req.body.CallSid)
                .fetch()
                .then(call => {
                    console.log(call.from + " | " + call.to);
                    makeAppointment(call.from, patientName, call.to);
                })
                .done();
        });
    });
    return apiRouter;
};
