var speechToText = require("../SpeechToText/SpeechToTextController");
var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
const dateFormat = require('dateformat');
var scheduler = require("../Scheduler/Scheduler");
var configUtils = require("../Utils/ConfigUtils");
var firebase = require("../Notification/FirebaseAdmin");
var logger = require("../Utils/Logger");
var patientDao = require("../DataAccess/PatientDAO");
var baseDao = require("../DataAccess/BaseDAO");

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

    // Receive record and make appointment with google speech to text
    apiRouter.post("/Recorded", function (req, res) {
        res.set('Content-Type', 'text/xml');
        res.end();

        var client = configUtils.getTwilioByID(req.body.AccountSid);
        speechToText.getTextFromVoice(req.body.RecordingUrl, function (err, patientName) {
            client.calls(req.body.CallSid)
                .fetch()
                .then(call => {
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

//--------------------------------------------- Twilio Utilities method ---------------------------------------------//

function sendSMSToPatient(clinicPhone, patientPhone, messageBody) {
    //  Send SMS to announcement appointment for patient has book successfull 
    var client = configUtils.getTwilioByPhone(clinicPhone);
    client.messages.create({
        body: messageBody,
        from: clinicPhone,
        to: patientPhone
    }).then(messages => { })
        .catch(function (err) {
            logger.log(err, "sendSMSToPatient");
        })
        .done();
}

function saveDataWhenBookingSuccess(user, patient, bookedTime, bookingCount, patientPhone) {
    patientDao.insertNotExistedPatient(patient)
    .then(newPatient => {
        var newAppointment = {
            clinicUsername: user.clinic.username,
            patientID: newPatient.patientID,
            appointmentTime: bookedTime,
            no: bookingCount
        };
        // insert Appointment                        
        db.Appointment.forge(newAppointment)
            .save()
            .then(function (model) {
                var appointment = model.toJSON();
                //Begin send SMS to patient
                var bookedDate = dateFormat(appointment.appointmentTime, "dd-mm-yyyy");
                var bookedTime = dateFormat(appointment.appointmentTime, "HH:MM:ss");
                var messageBody = patient.fullName + ' mã số ' + bookingCount + ' đã đặt lịch khám tại phòng khám ' + user.clinic.clinicName + ' ngày ' + bookedDate + ' lúc ' + bookedTime;
                sendSMSToPatient(user.phoneNumber, patientPhone, messageBody);
                //End send SMS to patient

                //Begin send notification to Clinic
                var notifyMessage = patient.fullName + " mã số " + bookingCount + " đã đặt lịch khám thành công ngày " + bookedDate + ' lúc ' + bookedTime;
                var notifyTitle = "Lịch hẹn đặt thành công";
                var topic = user.username;
                firebase.notifyToClinic(topic, notifyTitle, notifyMessage);
                //End send notification to Clinic
            })
            .catch(function (err) {
                logger.log(err, "saveDataWhenBookingSuccess");
                //save appointment fail;
            });
    })
    .catch(err => {
        logger.log(err);
        // error 
    });
}

function verifyData(user, patient, patientPhone) {
    var bookingDate = new Date().getDay();
    var clinicUsername = user.clinic.username;

    new db.WorkingHours({ "clinicUsername": clinicUsername, "applyDate": bookingDate })
        .fetch({ withRelated: ["clinic"] })
        .then(function (model) {
            var config = model.toJSON();
            var sql = "clinicUsername = ? AND DATE(appointmentTime) = CURRENT_DATE()";
            db.knex("tbl_appointment")
                .whereRaw(sql, [clinicUsername])
                .count("* as count")
                .then(function (collection) {
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
                .catch(function (err) {
                    sendSMSToPatient(user.phoneNumber, patientPhone, Const.FullSlot);
                    logger.log(err.message, "verifyData");
                });

        })
        .catch(function (err) {
            logger.log(err.message, "verifyData");
        });
}

function makeAppointment(patientPhone, patientName, clinicPhone) {
    if (!patientName.trim()) {
        //Patient name is empty
        var message = "Vui lòng nhập tên để đăng ký khám bệnh";
        sendSMSToPatient(clinicPhone, patientPhone, message);
        return;
    }
    //get clinicUsername from phoneNumber
    db.User.forge({ "phoneNumber": clinicPhone })
        .fetch({ withRelated: ["clinic"] })
        .then(function (model) {
            if (model != null) {
                var user = model.toJSON();
                var patient = {
                    "phoneNumber": patientPhone,
                    "fullName": patientName,
                };
                patientDao.checkPatientBooked(user.username, patientPhone, patientName)
                .then(booked => {
                    if(booked){
                        var message = "Hôm nay quý khách đã đặt lịch khám cho bệnh nhân " + patientName + " rồi, Xin quý khách vui lòng quay lại vào hôm sau.";
                        sendSMSToPatient(clinicPhone, patientPhone, message);
                    } else{
                        verifyData(user, patient, patientPhone);
                    }
                })                
                //begin fake patient phone number
                // utils.getBookedNumbers(user.clinic.username)
                //     .then(function (result) {
                //         var isBooked = utils.checkNumberInArray(patientPhone, result);
                //         var isTestNumber = utils.checkNumberInArray(patientPhone, configUtils.getTestNumbers());
                //         if (isBooked && !isTestNumber) {
                //             //Hard code
                //             var message = "Hôm nay bạn đã đặt hẹn rồi! xin vui lòng kiểm tra lại thông tin";
                //             sendSMSToPatient(clinicPhone, patientPhone, message);
                //             return;
                //         }
                //         if (isBooked) {
                //             var fakePhoneNumber = utils.getFakePhoneNumber(result, configUtils.getRandomNumbers());
                //             patient.phoneNumber = fakePhoneNumber;
                //         }
                //         verifyData(user, patient, patientPhone);
                //     })
                //     .catch(function (err) {
                //         logger.log(err.message, "makeAppointment");
                //     })
                //begin fake patient phone number
            } else {
                logger.log("Make appoiontment fail: clinicphone:" + clinicPhone + " patientphone: " + patientPhone, "makeAppointment");
            }
        })
        .catch(function (err) {
            logger.log(err, "makeAppointment");
        });
}