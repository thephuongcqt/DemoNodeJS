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

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.get("/getAppointmentsListByDate", async function (req, res) {
        var clinicUsername = req.query.clinicUsername;
        var searchDate = req.query.date;
        try {
            var appointments = await getAppointmentList(clinicUsername, searchDate);
            res.json(utils.responseSuccess(appointments));
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(Const.GetAppointmentListFailure));
        }
    });

    apiRouter.get("/getAppointmentsListByDateWithBlock", async function (req, res) {
        var clinicUsername = req.query.clinicUsername;
        var searchDate = req.query.date;
        var json = { "clinicUsername": clinicUsername };

        try {
            var appointments;
            var block;
            if (searchDate) {
                appointments = await appointmentDao.getAppointmentsForSpecifyDayWithRelated(json, searchDate, "patient");
            } else {
                appointments = await appointmentDao.getAppointmentsInCurrentDayWithRelated(json, "patient");
            }
            for (var i in appointments) {
                var appointment = appointments[i];
                block = await blockDAO.getBlockNumber(appointment.clinicUsername, appointment.patient.phoneNumber);
                delete appointment.clinicUsername;
                // delete appointment.patientID;
                appointment.phoneNumber = appointment.patient.phoneNumber;
                appointment.fullName = appointment.patient.fullName;
                appointment.address = appointment.patient.address;
                appointment.yob = appointment.patient.yob;
                appointment.gender = appointment.patient.gender;

                delete appointment.patient;
                appointment.currentTime = utils.parseDate(new Date());
                appointment.appointmentTime = utils.parseDate(appointment.appointmentTime);
                if (block.length == 0) {
                    appointment.isBlock = null;
                } else {
                    appointment.isBlock = block[0].isBlock;
                }
            }
            res.json(utils.responseSuccess(appointments));
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
                var resultUpdate = await appointmentDao.getAppointmentsInCurrentDayWithRelated(json, "patient");
                for (var i in resultUpdate) {
                    var appointment = resultUpdate[i];
                    delete appointment.clinicUsername;
                    delete appointment.patientID;
                    appointment.currentTime = utils.parseDate(new Date());
                    appointment.appointmentTime = utils.parseDate(appointment.appointmentTime);
                }
                res.json(utils.responseSuccess(resultUpdate));
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
            var appointmentsList = await appointmentDao.getAppointmentsInCurrentDayWithRelated({ "clinicUsername": username }, "patient");
            var promises = [];
            var changed = false;
            for (var index in appointmentsList) {
                var item = appointmentsList[index];
                if (item.appointmentTime > new Date()) {
                    var json = {
                        "appointmentID": item.appointmentID,
                        "status": Const.appointmentStatus.CLINIC_CANCEL
                    }
                    var patientPhone = item.patient.phoneNumber;
                    var promise = baseDAO.update(db.Appointment, json, "appointmentID");
                    promises.push(promise);
                    twilioUtils.sendSMS(clinicPhone, patientPhone, Const.AppointmentCancelMessage);
                    changed = true
                }
            }
            await Promise.all(promises)        
            if (changed){                    
                var result = await getAppointmentList(username);
                res.json(utils.responseSuccess(result));
            } else{
                res.json(utils.responseFailure("Không có cuộc hẹn nào được huỷ thành công"));
            }
            
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure("Đã có lỗi xảy ra khi huỷ lịch khám"));
        }
    });

    apiRouter.post("/adjustAppointment", async function (req, res) {
        var username = req.body.username;
        var duration = utils.parseTime(req.body.duration);
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
                var appointmentsList = await appointmentDao.getAppointmentsInCurrentDayWithRelated({ "clinicUsername": username }, "patient");
                var promises = [];
                for (var index in appointmentsList) {
                    var item = appointmentsList[index];
                    if (item.appointmentTime > new Date()) {
                        var mTime = Moment(item.appointmentTime);
                        var miliseconds = utils.getMiliseconds(mDuration);
                        mTime.add(miliseconds, "milliseconds");

                        var json = {
                            "appointmentID": item.appointmentID,
                            "appointmentTime": mTime.toDate()
                        }

                        var patientPhone = item.patient.phoneNumber;
                        var message = "Vì lý do bất khả kháng nên phòng khám xin phép dời lịch khám của bạn tới lúc " + mTime.format("HH:MM") + ". Xin lỗi bạn vì sự bất tiện này."
                        var promise = baseDAO.update(db.Appointment, json, "appointmentID");
                        promises.push(promise);
                        twilioUtils.sendSMS(clinicPhone, patientPhone, message);
                        changed = true
                    }
                }             
                await Promise.all(promises)   
                if (changed) {                    
                    var result = await getAppointmentList(username);
                    res.json(utils.responseSuccess(result));
                } else{
                    res.json(utils.responseFailure("Không có cuộc hẹn nào được chỉnh sửa thành công"));
                }
            } catch (error) {
                logger.log(error);
                res.json(utils.responseFailure("Đã có lỗi xảy ra khi huỷ lịch khám"));
            }
        }
    });

    return apiRouter;
};

async function getAppointmentList(username, searchDate) {
    var json = { "clinicUsername": username };
    var appointments;
    if (searchDate) {
        appointments = await appointmentDao.getAppointmentsForSpecifyDayWithRelated(json, searchDate, "patient");
    } else {
        appointments = await appointmentDao.getAppointmentsInCurrentDayWithRelated(json, "patient");
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