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

    apiRouter.post("/getMedicalRecord", async function (req, res) {
        try {
            var patientID = req.body.patientID;
            var json = { patientID: patientID };            
            var medicalRecords = []
            var result = await baseDAO.findByPropertiesWithRelated(db.Appointment, json, "medicalRecord");            
            for (var index in result) {
                var appointment = result[index];
                var recordJson = { appointmentID: appointment.appointmentID };
                var items = await baseDAO.findByPropertiesWithManyRelated(db.MedicalRecord, recordJson, ["medicalDisease", "medicalMedicines"]);                                
                if (items && items.length > 0) {
                    var item = items[0];
                    var medicalMedicines = item.medicalMedicines;
                    var medicinesList = []
                    for(var index in medicalMedicines){
                        var tmp = medicalMedicines[index];                        
                        var tmpResult = await baseDAO.findByID(db.Medicine, "medicineID", tmp.medicineID);
                        var tmpJson = {
                            medicineID: tmp.medicineID,
                            quantity: tmp.quantity,
                            description: tmp.description,
                            medicineName: tmpResult.medicineName
                        }
                        medicinesList.push(tmpJson);
                    }
                    var medicalDisease = item.medicalDisease;
                    var diseasesList = [];
                    for(var index in medicalDisease){
                        var tmp = medicalDisease[index];
                        
                        var tmpResult = await baseDAO.findByID(db.DiseasesName, "diseasesID", tmp.diseasesID);
                        var tmpJson = {
                            diseasesID: tmp.diseasesID,
                            diseasesName: tmpResult.diseasesName
                        }
                        diseasesList.push(tmpJson);
                    }                    
                    
                    var response = {
                        appointmentID: appointment.appointmentID,
                        appointmentTime: utils.parseDate(appointment.appointmentTime),
                        no: appointment.no,
                        status: appointment.status,
                        reminding: appointment.reminding,
                        description: appointment.description,
                        medicalMedicines: medicinesList,
                        medicalDisease: diseasesList                      
                    }
                    medicalRecords.push(response);
                }
            }
            res.json(utils.responseSuccess(medicalRecords));
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(Const.GetMedicineListFailure));
        }
    });

    apiRouter.post("/create", async function (req, res) {
        var appointmentID = req.body.appointmentID;
        try {
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
            await medicalRecordDao.createMedicalRecord(appointmentID, reminding, description, listMedicine, listDisease);
            res.json(utils.responseSuccess("Tạo bệnh án thành công thành công"));
        } catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.log(err);
            try {
                await medicalRecordDao.removeStuffMedialRecord(appointmentID);
            } catch (error) {
                logger.log(error);
            }
        }
    });
    return apiRouter;
};