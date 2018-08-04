var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
const dateFormat = require('dateformat');
var Moment = require('moment');
var baseDAO = require("../DataAccess/BaseDAO");
var logger = require("../Utils/Logger");
var blockDAO = require("../DataAccess/BlockDAO");
var appointmentDao = require("../DataAccess/AppointmentDAO");
var twilioUtils = require("../ThirdPartyHotline/TwilioUtils");
var firebase = require("../Notification/FirebaseAdmin");
var workingHoursDAO = require("../DataAccess/WokingHoursDAO");

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.get("/getAppointmentsListByDate", async function (req, res) {
        var clinicUsername = req.query.clinicUsername;
        var searchDate = req.query.date;
        try {
            var appointments = await getAppointmentList(clinicUsername, searchDate);
            var json = {
                currentTime: utils.parseDate(new Date()),
                appointments: appointments
            }
            res.json(utils.responseSuccess(json));
            logger.successLog("getAppointmentsListByDate");
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(Const.GetAppointmentListFailure));
        }
    });

    apiRouter.get("/getAppointmentsListByDateForWeb", async function (req, res) {
        var clinicUsername = req.query.clinicUsername;
        var searchDate = req.query.date;
        var json = { "clinicUsername": clinicUsername };
        try {
            var appointments;
            var blocks = await baseDAO.findByProperties(db.Block, { "clinicUsername": clinicUsername, "isBlock": 1 });
            var blockedNumbers = [];
            for (var index in blocks) {
                var item = blocks[index];
                blockedNumbers.push(item.phoneNumber);
            }
            if (searchDate) {
                appointments = await appointmentDao.getAppointmentsForSpecifyDayWithRelated(json, searchDate, ["patient", "medicalRecord"]);
            } else {
                appointments = await appointmentDao.getAppointmentsInCurrentDayWithRelated(json, ["patient", "medicalRecord"]);
            }
            var mapAppointment = {};
            for (var i in appointments) {
                var appointment = appointments[i];
                appointment.phoneNumber = appointment.patient.phoneNumber;
                appointment.fullName = appointment.patient.fullName;
                appointment.address = appointment.patient.address;
                appointment.yob = appointment.patient.yob;
                appointment.gender = appointment.patient.gender;
                appointment.secondPhoneNumber = appointment.patient.secondPhoneNumber;
                appointment.isBlock = utils.checkNumberInArray(appointment.patient.phoneNumber, blockedNumbers);
                appointment.currentTime = utils.parseDate(new Date());
                appointment.appointmentTime = utils.parseDate(appointment.appointmentTime);
                appointment.createdRecord = appointment.medicalRecord.appointmentID != undefined;
                delete appointment.patient;
                delete appointment.medicalRecord;
                delete appointment.clinicUsername;
                if(mapAppointment[appointment.appointmentID]){
                    mapAppointment[appointment.appointmentID] = false;
                } else{
                    appointments.splice(i, 1);
                    // appointment.status = Const.appointmentStatus.DUPLICATE;
                }
            }
            var json = {
                currentTime: utils.parseDate(new Date()),
                appointments: appointments
            }
            res.json(utils.responseSuccess(json));
            logger.successLog("getAppointmentsListByDateForWeb");
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(Const.GetAppointmentListFailure));
        }
    });

    apiRouter.post("/checkVisit", async function (req, res) {
        var clinicUsername = req.body.clinicUsername;
        var appointmentID = req.body.appointmentID;
        var status = req.body.status;
        try {
            var json = { "appointmentID": appointmentID };
            if (!isNaN(appointmentID) || !isNaN(status)) {
                if (status == Const.appointmentStatus.ABSENT || status == Const.appointmentStatus.PRESENT) {
                    json.status = status;
                } else {
                    json.status = Const.appointmentStatus.ABSENT;
                }
                await baseDAO.update(db.Appointment, json, "appointmentID");
                var json = { "clinicUsername": clinicUsername };
                var resultUpdate = await appointmentDao.getAppointmentsInCurrentDayWithRelated(json, ["patient"]);
                for (var i in resultUpdate) {
                    var appointment = resultUpdate[i];
                    delete appointment.clinicUsername;
                    delete appointment.patientID;
                    appointment.currentTime = utils.parseDate(new Date());
                    appointment.appointmentTime = utils.parseDate(appointment.appointmentTime);
                }
                res.json(utils.responseSuccess(resultUpdate));
                logger.successLog("checkVisit");
            } else {
                res.json(utils.responseFailure("An error occurred!"));
            }
        }
        catch (err) {
            logger.log(err);
            res.json(utils.responseFailure(err.message));
        }
    });

    apiRouter.post("/cancelWorking", async function (req, res) {
        var username = req.body.username;
        try {
            var users = await baseDAO.findByProperties(db.User, { "username": username });
            var clinicPhone = users[0].phoneNumber;
            var appointmentsList = await appointmentDao.getAppointmentsInCurrentDayWithRelated({ "clinicUsername": username }, ["patient"]);
            var promises = [];
            var changed = false;
            var count = 0;
            for (var index in appointmentsList) {
                var item = appointmentsList[index];
                if (item.appointmentTime > new Date() && item.status == Const.appointmentStatus.ABSENT) {
                    var json = {
                        "appointmentID": item.appointmentID,
                        "status": Const.appointmentStatus.CLINIC_CANCEL
                    }
                    // var patientPhone = item.patient.phoneNumber;
                    //Get real phone number
                    var patientPhone = item.bookedPhone;
                    var promise = baseDAO.update(db.Appointment, json, "appointmentID");
                    promises.push(promise);
                    if (clinicPhone && patientPhone) {
                        twilioUtils.sendSMS(clinicPhone, patientPhone, Const.AppointmentCancelMessage);
                    }
                    changed = true;
                    count++;
                }
            }
            await Promise.all(promises)
            if (changed) {
                var appointments = await getAppointmentList(username);
                var json = {
                    currentTime: utils.parseDate(new Date()),
                    appointments: appointments
                }
                // Beginset today is off day
                var today = new Date().getDay();
                var result = await workingHoursDAO.updateWorkingHour(username, today, undefined, undefined, Const.DAYOFF);
                logger.log(result);
                // End set today is off day
                firebase.addNotificationToFirestore(username, "Huỷ hẹn thành công", "Có " + count + " cuộc hẹn đã được huỷ thành công");
                res.json(utils.responseSuccess(json));
                logger.successLog("cancelWorking");
            } else {
                res.json(utils.responseFailure("Không có cuộc hẹn nào được huỷ thành công"));
            }

        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure("Đã có lỗi xảy ra khi huỷ lịch khám"));
        }
    });

    apiRouter.post("/adjustAppointment", async function (req, res) {
        try {
            var username = req.body.username;
            var paramDuration = req.body.duration;
            if (username && paramDuration) {
                var duration = utils.parseTime(paramDuration);
                var checkDuration = utils.getMomentTime(duration).isValid();
                if (checkDuration == true) {
                    if (duration == "00:00:00") {
                        res.json(utils.responseFailure("Thời lượng khám không chính xác"));
                        return;
                    }
                    var mDuration = utils.getMomentTime(duration);
                    var changed = false;
                    try {
                        var users = await baseDAO.findByProperties(db.User, { "username": username });
                        var clinicPhone = users[0].phoneNumber;
                        var appointmentsList = await appointmentDao.getAppointmentsInCurrentDayWithRelated({ "clinicUsername": username }, ["patient"]);
                        var promises = [];
                        var count = 0;
                        for (var index in appointmentsList) {
                            var item = appointmentsList[index];
                            if (item.appointmentTime > new Date() && item.status == Const.appointmentStatus.ABSENT) {
                                var mTime = Moment(item.appointmentTime);
                                var miliseconds = utils.getMiliseconds(mDuration);
                                mTime.add(miliseconds, "milliseconds");
                                if(mTime.toDate() > utils.getEndDay()){
                                    mTime = Moment(utils.getEndDay());
                                }                                
                                
                                var json = {
                                    "appointmentID": item.appointmentID,
                                    "appointmentTime": mTime.toDate()
                                }
                                var promise = baseDAO.update(db.Appointment, json, "appointmentID");
                                promises.push(promise);
                                var patientPhone = item.bookedPhone;
                                if (patientPhone && clinicPhone) {
                                    var message = "Vì lý do bất khả kháng nên phòng khám xin phép dời lịch khám của bạn tới lúc " + mTime.format("HH:mm") + " ngày " + mTime.format("DD-MM-YYYY") + ". Xin lỗi bạn vì sự bất tiện này."                                                                        
                                    twilioUtils.sendSMS(clinicPhone, patientPhone, message);
                                }
                                changed = true;
                                count++;
                            }
                        }
                        await Promise.all(promises)
                        if (changed) {
                            var appointments = await getAppointmentList(username);
                            var json = {
                                currentTime: utils.parseDate(new Date()),
                                appointments: appointments
                            }
                            firebase.addNotificationToFirestore(username, "Thay đổi giờ khám thành công", "Có " + count + " cuộc hẹn được thay đổi giờ khám");
                            res.json(utils.responseSuccess(json));
                            logger.successLog("adjustAppointment");
                        } else {
                            res.json(utils.responseFailure("Không có cuộc hẹn nào được chỉnh sửa thành công"));
                        }
                    } catch (error) {
                        logger.log(error);
                        res.json(utils.responseFailure("Đã có lỗi xảy ra khi huỷ lịch khám"));
                    }
                }
            } else{
                res.json(utils.responseFailure("Missing parameters"));
            }
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure("Đã có lỗi xảy ra khi huỷ lịch khám"));
        }
    });

    return apiRouter;
};

async function getAppointmentList(username, searchDate) {
    var json = { "clinicUsername": username };
    var appointments;
    if (searchDate) {
        appointments = await appointmentDao.getAppointmentsForSpecifyDayWithRelated(json, searchDate, ["patient"]);
    } else {
        appointments = await appointmentDao.getAppointmentsInCurrentDayWithRelated(json, ["patient"]);
    }
    for (var i in appointments) {
        var appointment = appointments[i];
        delete appointment.clinicUsername;
        delete appointment.patientID;
        appointment.currentTime = utils.parseDate(new Date());
        appointment.appointmentTime = utils.parseDate(appointment.appointmentTime);
    }
    return appointments;
}