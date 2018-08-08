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
            logger.successLog("getAllMedicalRecord");
        } catch (error) {
            logger.log(error);
            logger.failLog("getAllMedicalRecord", error);
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
                    for (var index in medicalMedicines) {
                        var tmp = medicalMedicines[index];
                        var tmpResult = await baseDAO.findByID(db.Medicine, "medicineID", tmp.medicineID);
                        var tmpJson = {
                            medicineID: tmp.medicineID,
                            quantity: tmp.quantity,
                            description: tmp.description,
                            medicineName: tmpResult.medicineName,
                            unitName: tmpResult.unitName
                        }
                        medicinesList.push(tmpJson);
                    }
                    var medicalDisease = item.medicalDisease;
                    var diseasesList = [];
                    for (var index in medicalDisease) {
                        var tmp = medicalDisease[index];
                        var tmpResult = await baseDAO.findByID(db.Disease, "diseaseID", tmp.diseaseID);
                        var tmpJson = {
                            diseaseID: tmp.diseaseID,
                            diseaseName: tmpResult.diseaseName
                        }
                        diseasesList.push(tmpJson);
                    }
                    var symptomJson = {
                        "appointmentID": appointment.appointmentID
                    }
                    var symptomList = await baseDAO.findByPropertiesWithRelated(db.MedicalSymptom, symptomJson, "clinicalSymptom");
                    // console.log(symptomList);
                    var symptoms = []
                    for (var index in symptomList) {
                        var tmp = symptomList[index];
                        symptoms.push(tmp.clinicalSymptom.symptom);
                    }
                    var response = {
                        appointmentID: appointment.appointmentID,
                        appointmentTime: utils.parseDate(appointment.appointmentTime),
                        no: appointment.no,
                        status: appointment.status,
                        reminding: appointment.medicalRecord.reminding,
                        description: appointment.description,
                        medicalMedicines: medicinesList,
                        medicalDisease: diseasesList,
                        symptoms: symptoms
                    }
                    medicalRecords.push(response);
                }
            }
            res.json(utils.responseSuccess(medicalRecords));
            logger.successLog("getMedicalRecord");
        } catch (error) {
            logger.log(error);
            logger.failLog("getMedicalRecord", error);
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
            var clinicalSymptom = req.body.clinicalSymptom;
            var checkCancel = await baseDAO.findByID(db.Appointment, "appointmentID", appointmentID);
            if (checkCancel.status != Const.appointmentStatus.PRESENT) {
                res.json(utils.responseFailure("Bệnh nhân không đến khám, không thể tạo bệnh án"));
                logger.failLog("createMedicalRecord", new Error("Can not create medical record"));
                return;
            }
            var getAllRecords = await medicalRecordDao.getAllRecord();
            for (var i in getAllRecords) {
                var checkRecord = getAllRecords[i].appointmentID;
                if (checkRecord == appointmentID) {
                    res.json(utils.responseFailure(Const.MedicalRecordFailure));
                    logger.failLog("createMedicalRecord", new Error(Const.MedicalRecordFailure));
                    return;
                }
            }
            await medicalRecordDao.createMedicalRecord(appointmentID, reminding, description, listMedicine, listDisease, clinicalSymptom);
            res.json(utils.responseSuccess("Tạo bệnh án thành công"));
            logger.successLog("createMedicalRecord");
        } catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.log(err);
            logger.failLog("createMedicalRecord", err);
            medicalRecordDao.removeStuffMedialRecord(appointmentID);
        }
    });
    return apiRouter;
};