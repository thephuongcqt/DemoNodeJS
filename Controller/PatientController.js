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
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(Const.GetPatientListFailure));
        }
    });
    // get patient info
    apiRouter.get("/getPatientInfo", async function (req, res) {
        var patientID = req.query.patientID;
        try {
            var patientInfo = await patientDao.getPatientInfo(patientID);
            res.json(utils.responseSuccess(patientInfo));
        } catch (error) {
            logger.log(error);
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
        try {
            var patientInfo = await patientDao.getPatientInfo(patientID);
            if (!patientInfo) {
                res.json(utils.responseFailure("Bệnh nhân không có trong hệ thống"));
                return;
            }
            if (fullName) {
                fullName = utils.toBeautifulName(fullName);
            } else {
                fullName = null;
            }
            if (!phoneNumber) {
                phoneNumber = null;
            }
            if (yob != null) {
                if (yob == "1970-01-01T00:00:00.000Z") {
                    yob = undefined;
                } else {
                    parseYOB = utils.parseDateOnly(new Date(yob));
                    var checkYOB = Moment(parseYOB, 'YYYY-MM-DD', true).isValid();
                    if (checkYOB == false) {
                        res.json(utils.responseFailure("Ngày sinh không hợp lệ"));
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
                        return;
                    }
                }
            }
            if (fullName == null) {
                fullName = undefined;
            }
            if (phoneNumber == null) {
                phoneNumber = undefined;
            }
            var resultUpdate = await patientDao.updatePatient(patientID, phoneNumber, fullName, address, parseYOB, gender);
            res.json(utils.responseSuccess(resultUpdate));
        }
        catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.log(err);
        }
    });

    apiRouter.post("/search", async function(req, res){
        try {
            var searchValue = req.body.searchValue;
            var username = req.body.username;
            var patientsList = [];
            if(username && searchValue){
                patientsList = await  patientDao.searchPatient(searchValue, username);
            }
            res.json(utils.responseSuccess(patientsList));
        } catch (error) {            
            logger.log(error);
            res.json(utils.responseFailure("Đã có lỗi xảy ra khi tìm kiếm bệnh nhân"));
        }        
    });

    apiRouter.post("/merge", async function(req, res){
        try {
            var oldPatientID = req.body.oldPatientID;
            var newPatientID = req.body.newPatientID;
            if(oldPatientID && newPatientID){
                var oldJson = {
                    "patientID": oldPatientID
                }
                var newJson = {
                    "patientID": newPatientID
                }
                var result = await Promise.all([baseDAO.findByPK(db.Patient, newJson), baseDAO.findByPK(db.Patient, oldJson)]);
                if(result && result.length == 2 && result[0] && result[1]){
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
                    
                    res.json(utils.responseSuccess("Thay đổi thông tin thành công"));
                } else{
                    res.json(utils.responseFailure("Không tìm thấy bệnh nhân, xin vui lòng kiểm tra lại"));
                }
            }
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure("Đã có lỗi xảy ra khi merge"));
        }
    });
    return apiRouter;
};