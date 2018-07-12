var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var baseDAO = require("../DataAccess/BaseDAO");
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
        var gender = req.body.gender;
        try {
            var patientInfo = await patientDao.getPatientInfo(patientID);
            if (!patientInfo) {
                res.json(utils.responseFailure("Patient is not exist"));
            } else {
                if (isNaN(isActive)) {
                    isActive = undefined;
                }
                var resultUpdate = await medicineDao.updateMedicine(req.body.medicineID, medicineName, unitName, isActive);
                res.json(utils.responseSuccess(resultUpdate));
            }
        }
        catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.log(err);
        }
    });
    return apiRouter;
};