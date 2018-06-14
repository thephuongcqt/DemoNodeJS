var speechToText = require("./SpeechToTextController");
const accountSid = 'AC0182c9b950c8fe1229f93aeb40900a5d';
const authToken = '903448ab8b8a1e8a59bf62126841bd10';
const client = require('twilio')(accountSid, authToken);
var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
const dateFormat = require('dateformat');
var scheduler = require("../Utils/Scheduler");

module.exports = function(app, express) {
    var apiRouter = express.Router();
    // book appointment by Call
    apiRouter.get("/Voice", function(req, res) {
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
    apiRouter.post("/Recorded", function(req, res) {
        res.set('Content-Type', 'text/xml');
        res.end();
        speechToText.getTextFromVoice(req.body.RecordingUrl, function(err, patientName) {
            client.calls(req.body.CallSid)
                .fetch()
                .then(call => {
                    makeAppointment(call.from, patientName, call.to);
                })
                .done();
        });
    });
    // book appointment by SMS
    apiRouter.post("/Message", function(req, res) {
        res.set('Content-Type', 'text/xml');
        res.end();
        makeAppointment(req.body.From, req.body.Body, req.body.To);
    });
    return apiRouter;
};

function sendSMSToPatient(clinicPhone, patientPhone, messageBody) {
    //  Send SMS to announcement appointment for patient has book successfull 
    client.messages.create({
        body: messageBody,
        from: clinicPhone,
        to: patientPhone
    }).then(messages => { })
        .catch(function (err) {
            console.log(err);            
        })
        .done();
}

function saveDataWhenBookingSuccess(user, patient, bookedTime, bookingCount, patientPhone) {
    db.Patient.forge(patient)
        .save()
        .then(function(model) {
            var newPatient = model.toJSON();
            var newAppointment = {
                clinicUsername: user.clinic.username,
                patientID: newPatient.id,
                appointmentTime: bookedTime,
                no: bookingCount
            };
            // insert Appointment                        
            db.Appointment.forge(newAppointment)
                .save()
                .then(function(model) {
                    var appointment = model.toJSON();
                    //need to notify to clinic
                    var bookedDate = dateFormat(appointment.appointmentTime, "dd-mm-yyyy");
                    var bookedTime = dateFormat(appointment.appointmentTime, "HH:MM:ss");
                    var messageBody = patient.fullName + ' mã số ' + bookingCount + ' đã đặt lịch khám tại phòng khám ' + user.clinic.clinicName + ' ngày ' + bookedDate + ' lúc ' + bookedTime;
                    sendSMSToPatient(user.phoneNumber, patientPhone, messageBody);
                })
                .catch(function(err) {
                    //save appointment fail;
                });
        })
        .catch(function(err) {
            console.log(err);
            // save patient fail
        });
}

function verifyData(user, patient, patientPhone) {
    var bookingDate = new Date().getDay();
    var clinicUsername = user.clinic.username;

    new db.WorkingHours({ "clinicUsername": clinicUsername, "applyDate": bookingDate })
        .fetch({ withRelated: ["clinic"] })
        .then(function(model) {
            var config = model.toJSON();
            var sql = "clinicUsername = ? AND DATE(appointmentTime) = CURRENT_DATE()";
            db.knex("tbl_appointment")
                .whereRaw(sql, [clinicUsername])
                .count("* as count")
                .then(function(collection) {
                    var bookedAppointment = collection[0].count;
                    var bookedTime = scheduler.getExpectationTime(config.startWorking, config.endWorking, bookedAppointment, config.clinic.examinationDuration);
                    if (bookedTime == null) {
                        //send err message                                         
                        sendSMSToPatient(user.phoneNumber, patientPhone, Const.FullSlot);
                    } else {
                        saveDataWhenBookingSuccess(user, patient, bookedTime, bookedAppointment + 1, patientPhone);
                        //need to send notify to clinic
                    }
                })
                .catch(function(err) {
                    console.log(err.message);
                    sendSMSToPatient(user.phoneNumber, patientPhone, Const.FullSlot);
                });

        })
        .catch(function(err) {
            console.log(err.message);
        });
}

function makeAppointment(patientPhone, patientName, clinicPhone) {
    if(!patientName.trim()){
        //Patient name is empty
        var message = "Vui lòng nhập tên để đăng ký khám bệnh";
        sendSMSToPatient(clinicPhone, patientPhone, message);
        return;
    }
    //get clinicUsername from phoneNumber
    db.User.forge({ "phoneNumber": clinicPhone })
        .fetch({ withRelated: ["clinic"] })
        .then(function(model) {
            if (model != null) {
                var user = model.toJSON();
                var patient = {
                    "phoneNumber": patientPhone,
                    "fullName": patientName,                    
                };
                //begin fake patient phone number
                utils.getBookedNumbers(user.clinic.username)
                    .then(function(result) {
                        var isBooked = utils.checkNumberInArray(patientPhone, result);
                        var isTestNumber = utils.checkNumberInArray(patientPhone, Const.testNumbers);
                        if(isBooked && !isTestNumber){
                            //Hard code
                            var message = "Hôm nay bạn đã đặt hẹn rồi! xin vui lòng kiểm tra lại thông tin";
                            sendSMSToPatient(clinicPhone, patientPhone, message);
                            return;
                        }
                        if (isBooked) {
                            var fakePhoneNumber = utils.getFakePhoneNumber(result, Const.randomNumbers);                            
                            patient.phoneNumber = fakePhoneNumber;
                        }                        
                        verifyData(user, patient, patientPhone);
                    })
                    .catch(function(err) {
                        console.log(err);
                    })
                //end fake patient phone number                
            } else {
                console.log("Make appoiontment fail: clinicphone:" + clinicPhone + " patientphone: " + patientPhone);
            }
        })
        .catch(function(err) {
            console.log(err.message);
        });
}