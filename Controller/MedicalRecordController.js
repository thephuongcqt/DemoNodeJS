var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var baseDAO = require("../DataAccess/BaseDAO");
var logger = require("../Utils/Logger");
var medicalRecordDao = require("../DataAccess/MedicalRecordDAO");

module.exports = function (app, express) {
    apiRouter = express.Router();

    // get medicine
    apiRouter.get("/getAllMedicalRecord", async function (req, res) {
        try {
            var listMedicalRecord = [];
            var appointmentIDs = await medicalRecordDao.getAllRecord();
            for (var i in appointmentIDs) {
                var appointmentID = appointmentIDs[i].appointmentID;
                var medicalRecords = await medicalRecordDao.getAllMedicalRecord(appointmentID);
                listMedicalRecord.push(medicalRecords);
            }
            res.json(utils.responseSuccess(listMedicalRecord));
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(Const.GetMedicineListFailure));
        }
    });

    apiRouter.post("/create", async function (req, res) {
        try {
            var appointmentID = req.body.appointmentID;
            var reminding = req.body.reminding;
            var description = req.body.description;
            var listMedicine = req.body.medicines;
            var listDisease = req.body.diseases;
            var getAllRecords = await medicalRecordDao.getAllRecord();
            for (var i in getAllRecords) {
                var checkRecord = getAllRecords[i].appointmentID;
                if (checkRecord == appointmentID) {
                    res.json(utils.responseFailure(Const.MedicalRecordFailure));
                    return;
                }
            }
            // var listMedicine = [{
            //     "medicineID": 1,
            //     "quantity": 30,
            //     "description": "Ngày uống 2 lần, mỗi lần 1 viên"
            // },
            // {
            //     "medicineID": 2,
            //     "quantity": 30,
            //     "description": "Ngày uống 3 lần, mỗi lần 1 viên"
            // },
            // {
            //     "medicineID": 3,
            //     "quantity": 15,
            //     "description": "Ngày uống 1 lần, mỗi lần nửa viên"
            // }];
            // var listDisease = [{
            //     "diseasesID": 1
            // },
            // {
            //     "diseasesID": 2
            // }];
            await medicalRecordDao.createMedicalRecord(appointmentID, reminding, description, listMedicine, listDisease);
            res.json(utils.responseSuccess("Tạo bệnh án thành công thành công"));
        } catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.log(err);
        }
    });
    return apiRouter;
};