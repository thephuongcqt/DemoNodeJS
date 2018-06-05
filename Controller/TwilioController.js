var speechToText = require("./SpeechToTextController");
const accountSid = 'AC0182c9b950c8fe1229f93aeb40900a5d';
const authToken = '903448ab8b8a1e8a59bf62126841bd10';
const client = require('twilio')(accountSid, authToken);
var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
const dateFormat = require('dateformat');

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
                    "totalAppointment": 0, // chua test ten nay da ton tai hay chua
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
                            .then(function (model) {
                                var appointment = model.toJSON();
                                //need to notify to clinic
                                db.Clinic.forge({ "username": clinicUsername })
                                    .fetch()
                                    .then(function (model) {
                                        var clinic = model.toJSON();
                                        var appointTime = appointment.appointmentTime;
                                        var timeAppointment = dateFormat(new Date(appointTime), "dd-mm-yyyy HH:MM");
                                        // Send SMS to announcement appointment for patient has book successfull //////////////////////////////////////////////
                                        client.messages.create({
                                            body: patientName + ' mã số ' + appointment.id + ' đã đặt lịch khám tại phòng khám ' + clinic.clinicName + ' ngày ' + timeAppointment,
                                            from: clinicPhone,
                                            to: patientPhone
                                        }).then(messages => {})
                                        .catch(function(err){
                                            console.log(err);
                                        })
                                        .done();
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    })
                                    .catch(function (err) {
                                        console.log(err.message);
                                    });
                            })
                            .catch(function (err) {
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
// book appointment by Call
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
// speech to text
    apiRouter.post("/Recorded", function (req, res) {
        res.end();
        speechToText.getTextFromVoice(req.body.RecordingUrl, function (err, patientName) {
            console.log("ERROR: " + err);
            console.log("Transcript: " + patientName);

            client.calls(req.body.CallSid)
                .fetch()
                .then(call => {
                    // console.log(call.from + " | " + call.to);
                    makeAppointment(call.from, patientName, call.to);
                })
                .done();
        });
    });
// book appointment by SMS
    apiRouter.post("/Message", function (req, res) {
        res.set('Content-Type', 'text/xml');
        res.end();
        makeAppointment(req.body.From, req.body.Body, req.body.To);
    });
    return apiRouter;
};
