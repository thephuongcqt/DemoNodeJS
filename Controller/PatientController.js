var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var baseDAO = require("../DataAccess/BaseDAO");
var Moment = require("moment");
var logger = require("../Utils/Logger");
var patientDao = require("../DataAccess/PatientDAO");

module.exports = function (app, express) {
    apiRouter = express.Router();
    // get patient
    apiRouter.get("/getAllPatients", async function (req, res) {
        try {
            var patients = await patientDao.getAllPatient();
            res.json(utils.responseSuccess(patients));
            logger.successLog("getAllPatients");
        } catch (error) {
            logger.log(error);
            logger.failLog("getAllPatients", error);
            res.json(utils.responseFailure(Const.GetPatientListFailure));
        }
    });
    // get patient info
    apiRouter.get("/getPatientInfo", async function (req, res) {
        var patientID = req.query.patientID;
        try {
            var patientInfo = await patientDao.getPatientInfo(patientID);
            res.json(utils.responseSuccess(patientInfo));
            logger.successLog("getPatientInfo");
        } catch (error) {
            logger.log(error);
            logger.failLog("getPatientInfo", error);
            res.json(utils.responseFailure(Const.GetPatientListFailure));
        }
    });
    // update patient
    apiRouter.post("/update", async function (req, res) {
        var patientID = req.body.patientID;
        var phoneNumber = req.body.phoneNumber;
        var fullName = req.body.fullName;
        var address = req.body.address;
        var yob = req.body.yob;
        var parseYOB = undefined;
        var gender = req.body.gender;
        var secondPhoneNumber = req.body.secondPhoneNumber;
        try {
            if (fullName) {
                fullName = utils.toBeautifulName(fullName);
            } else {
                fullName = null;
            }
            var patientInfo = await patientDao.getPatientInfo(patientID);
            if (!patientInfo) {
                res.json(utils.responseFailure("Bệnh nhân không có trong hệ thống"));
                logger.failLog("updatePatient", new Error("Patient is not exist"));
                return;
            }
            if (!phoneNumber && !secondPhoneNumber) {
                res.json(utils.responseFailure("Bệnh nhân phải có ít nhất một số điện thoại"));
                logger.failLog("updatePatient", new Error("Patient must phone number"));
                return;
            } else {
                if (!phoneNumber) {
                    res.json(utils.responseFailure("Số điện thoại chính không được để rỗng"));
                    logger.failLog("updatePatient", new Error("Phone number is not blank"));
                    return;
                }
                if (secondPhoneNumber) {
                    secondPhoneNumber = secondPhoneNumber.trim();
                    phoneNumber = phoneNumber.trim();
                    if (secondPhoneNumber == phoneNumber) {
                        res.json(utils.responseFailure("Số ĐT chính và phụ không được trùng nhau"));
                        logger.failLog("updatePatient", new Error("Phone number is not duplicate"));
                        return;
                    }
                } else {
                    if (secondPhoneNumber == "") {
                        secondPhoneNumber = null;
                    } else {
                        secondPhoneNumber = undefined;
                    }
                }
            }
            var json = {
                "phoneNumber": phoneNumber,
                "fullName": fullName,
                "clinicUsername": patientInfo.clinicUsername
            }
            var existedPatient = await patientDao.checkExistedPatient(json);
            if (existedPatient && existedPatient.patientID != patientID) {
                res.json(utils.responseFailure("Bệnh nhân đã bị trùng lặp, vui lòng kiểm tra lại tên hoặc số điện thoại"));
                logger.failLog("updatePatient", new Error("Patient is duplicate"));
                return;
            }
            if (yob != null) {
                if (yob == "1970-01-01T00:00:00.000Z") {
                    yob = undefined;
                } else {
                    parseYOB = utils.parseDateOnly(new Date(yob));
                    var checkYOB = Moment(parseYOB, 'YYYY-MM-DD', true).isValid();
                    if (checkYOB == false) {
                        res.json(utils.responseFailure("Ngày sinh không hợp lệ"));
                        logger.failLog("updatePatient", new Error("Birthday is not correct"));
                        return;
                    }
                }
            }
            if (gender != null) {
                if (gender == "") {
                    gender = undefined;
                } else {
                    if (isNaN(gender)) {
                        res.json(utils.responseFailure("Giới tính không hợp lệ"));
                        logger.failLog("updatePatient", new Error("Gender is not correct"));
                        return;
                    }
                }
            }
            if (fullName == null) {
                fullName = undefined;
            }
            var json = {
                "patientID": patientID,
                "phoneNumber": phoneNumber,
                "fullName": fullName,
                "address": address,
                "yob": yob,
                "gender": gender,
                "secondPhoneNumber": secondPhoneNumber
            };
            var resultUpdate = await patientDao.updatePatient(json);
            res.json(utils.responseSuccess(resultUpdate));
            logger.successLog("updatePatient");
        }
        catch (err) {
            res.json(utils.responseFailure("Đã có lỗi xảy ra khi thay đổi thông tin bệnh nhân"));
            logger.failLog("updatePatient", err);
            logger.log(err);
        }
    });

    apiRouter.post("/search", async function (req, res) {
        try {
            var searchValue = req.body.searchValue;
            var username = req.body.username;
            var patientsList = [];
            if (username && searchValue) {
                patientsList = await patientDao.searchPatient(searchValue, username);
            }
            res.json(utils.responseSuccess(patientsList));
            logger.successLog("searchPatient");
        } catch (error) {
            logger.log(error);
            logger.failLog("searchPatient", error);
            res.json(utils.responseFailure("Đã có lỗi xảy ra khi tìm kiếm bệnh nhân"));
        }
    });

    apiRouter.post("/merge", async function (req, res) {
        try {
            var oldPatientID = req.body.oldPatientID;
            var newPatientID = req.body.newPatientID;
            if (oldPatientID && newPatientID) {
                var oldJson = {
                    "patientID": oldPatientID
                }
                var newJson = {
                    "patientID": newPatientID
                }
                var oldPatient = await baseDAO.findByPK(db.Patient, oldJson);
                var newPatient = await baseDAO.findByPK(db.Patient, newJson);
                if (newPatient && oldPatient) {
                    var appointmentOfPatients = await baseDAO.findByProperties(db.Appointment, { "patientID": oldPatientID });
                    if (appointmentOfPatients && appointmentOfPatients.length > 0) {
                        var promises = [];
                        for (var index in appointmentOfPatients) {
                            var appointment = appointmentOfPatients[index];
                            var json = {
                                appointmentID: appointment.appointmentID,
                                patientID: newPatientID
                            }
                            promises.push(baseDAO.update(db.Appointment, json, "appointmentID"));
                        }
                        await Promise.all(promises);
                    }
                    try {
                        await baseDAO.deleteByProperties(db.Patient, { "patientID": oldPatientID });
                    } catch (error) {
                        logger.log(error);
                    }
                    if (oldPatient.phoneNumber != newPatient.phoneNumber) {
                        var json = {
                            "patientID": newPatientID,
                            "secondPhoneNumber": oldPatient.phoneNumber
                        };
                        await patientDao.updatePatient(json);
                    }
                    res.json(utils.responseSuccess("Thay đổi thông tin thành công"));
                    logger.successLog("mergePatient");
                } else {
                    res.json(utils.responseFailure("Không tìm thấy bệnh nhân, xin vui lòng kiểm tra lại"));
                    logger.failLog("mergePatient", new Error("Patient is not exist"));
                }
            }
        } catch (error) {
            logger.log(error);
            logger.failLog("mergePatient", error);
            res.json(utils.responseFailure("Đã có lỗi xảy ra khi merge"));
        }
    });
    return apiRouter;
};