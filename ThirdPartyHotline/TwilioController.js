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
var clinicDao = require("../DataAccess/ClinicDAO");
var appointmentDao = require("../DataAccess/AppointmentDAO");

module.exports = function (app, express) {
    var apiRouter = express.Router();

    // book appointment by Call
    apiRouter.get("/Voice", async function (req, res) {
        res.set('Content-Type', 'text/xml');
        const VoiceResponse = require('twilio').twiml.VoiceResponse;
        const twiml = new VoiceResponse();

        var recordURL = req.protocol + '://' + req.get('host') + '/twilio/Recorded';

        var phoneNumber = req.query.phoneNumber;
        var greetingURL = await clinicDao.getGreetingURL(phoneNumber);

        twiml.play(greetingURL);
        twiml.record({
            recordingStatusCallback: recordURL,
            method: 'POST',
        });
        res.end(twiml.toString());
    });

    // Receive record and make appointment with google speech to text
    apiRouter.post("/Recorded", async function (req, res) {
        res.set('Content-Type', 'text/xml');
        res.end();
        // var client = configUtils.getTwilioByID(req.body.AccountSid);
        var client = await clinicDao.getTwilioAccountByID(req.body.AccountSid);
        if (client) {
            speechToText.getTextFromVoice(req.body.RecordingUrl)
                .then(patientName => {
                    client.calls(req.body.CallSid)
                        .fetch()
                        .then(call => {
                            logger.log(call);
                            makeAppointment(call.from, patientName, call.to);
                        })
                        .done();
                })
                .catch(err => {
                    logger.log(err);
                    client.calls(req.body.CallSid)
                        .fetch()
                        .then(call => {
                            sendSMSToPatient(call.to, call.from, Const.BookAppointmentFailure);
                        })
                        .done();
                });
        } else{
            logger.log(new Error("An error occurred when get twilio account"));
        }
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

async function sendSMSToPatient(clinicPhone, patientPhone, messageBody) {
    //  Send SMS to announcement appointment for patient has book successfull 
    // var client = configUtils.getTwilioByPhone(clinicPhone);    
    var client = await clinicDao.getTwilioAccountByPhoneNumber(clinicPhone);
    if (client) {        
        client.messages.create({
            body: messageBody,
            from: clinicPhone,
            to: patientPhone
        }).then(messages => {            
        })
            .catch(function (err) {
                logger.log(err);
            })
            .done();
    } else{
        logger.log(new Error("An error occurred when get twilio account"));
    }
}

async function saveDataWhenBookingSuccess(user, patient, bookedTime, bookingCount, patientPhone) {
    try {
        var newPatient = await patientDao.insertNotExistedPatient(patient);
        var newAppointment = {
            clinicUsername: user.clinic.username,
            patientID: newPatient.patientID,
            appointmentTime: bookedTime,
            no: bookingCount
        };
        var appointment = await baseDao.create(db.Appointment, newAppointment);
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
    } catch (error) {
        sendSMSToPatient(user.phoneNumber, patientPhone, Const.BookAppointmentFailure);
        logger.log(error);
    }
}

async function scheduleAppointment(user, patient, patientPhone) {    
    try {
        var clinic = user.clinic;
        var detailAppointment = await scheduler.getExpectationAppointment(clinic);            
        if (detailAppointment) {
            saveDataWhenBookingSuccess(user, patient, detailAppointment.bookedTime, detailAppointment.no, patientPhone);
        } else {
            sendSMSToPatient(user.phoneNumber, patientPhone, Const.FullSlot);
            logger.log(new Error(user.phoneNumber + " " + patientPhone + " " + Const.FullSlot));
        }
    } catch (error) {
        logger.log(error);
        sendSMSToPatient(user.phoneNumber, patientPhone, Const.Error.ScheduleAppointmentError);        
    }
}

async function makeAppointment(patientPhone, patientName, clinicPhone) {
    if (!patientName.trim()) {
        //Patient name is empty
        var message = "Vui lòng nhập tên để đăng ký khám bệnh";
        sendSMSToPatient(clinicPhone, patientPhone, message);
        return;
    }
    patientName = utils.toUpperCaseForName(patientName);
    //get clinicUsername from phoneNumber    
    var userClinic = await clinicDao.findClinicByPhone(clinicPhone);
    if (userClinic) {
        var patient = {
            "phoneNumber": patientPhone,
            "fullName": patientName,
        };
        //Begin fake patient phone number
        var fakePhone = await fakePhoneNumber(userClinic.username, patientPhone);
        if (fakePhone) {
            patient.phoneNumber = fakePhone;
        }
        //Begin fake patient phone number
        var booked = await patientDao.checkPatientBooked(userClinic.username, patientPhone, patientName);
        if (booked) {
            var message = "Hôm nay quý khách đã đặt lịch khám cho bệnh nhân " + patientName + " rồi. Xin quý khách vui lòng quay lại vào hôm sau.";
            sendSMSToPatient(clinicPhone, patientPhone, message);
        } else {
            scheduleAppointment(userClinic, patient, patientPhone);
        }
    } else {
        sendSMSToPatient(clinicPhone, patientPhone, Const.BookAppointmentFailure);
        logger.log("Make appoiontment fail: clinicphone:" + clinicPhone + " patientphone: " + patientPhone, "makeAppointment");
    }
}

async function fakePhoneNumber(clinicUsername, patientPhone) {
    try {
        var result = await appointmentDao.getBookedNumbersInCurrentDay(clinicUsername);
        var isBooked = utils.checkNumberInArray(patientPhone, result);
        var isTestNumber = utils.checkNumberInArray(patientPhone, configUtils.getTestNumbers());
        if (isBooked && isTestNumber) {
            return utils.getFakePhoneNumber(result, configUtils.getRandomNumbers());
        }
    } catch (error) {
        logger.log(error);
    }
    return null;
}