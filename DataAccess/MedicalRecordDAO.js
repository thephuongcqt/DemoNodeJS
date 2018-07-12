var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var medicalRecordDao = {
    getAllRecord: function () {
        return new Promise((resolve, reject) => {
            dao.findAll(db.MedicalRecord)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Medical record is not exist");
                });
        });
    },
    getAllMedicalRecord: function (appointmentID) {
        return new Promise((resolve, reject) => {
            dao.findByPropertiesWithManyRelated(db.MedicalRecord, { "appointmentID": appointmentID }, ["meidicalDisease", "medicalMedicines"])
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Medical Record is not exist");
                });
        });
    },
    createMedicalRecord: async function (appointmentID, reminding, description, listMedicine, listDisease) {
        try {
            var recordJson = {
                "appointmentID": appointmentID,
                "reminding": reminding,
                "description": description
            };
            var promises = [dao.create(db.MedicalRecord, recordJson)];
            for (var i = 0; i < listMedicine.length; i++) {
                var medicineJson = {
                    "appointmentID": appointmentID,
                    "medicineID": listMedicine[i].medicineID,
                    "quantity": listMedicine[i].quantity,
                    "description": listMedicine[i].description
                };
                promises.push(dao.create(db.MedicalMedicine, medicineJson));
            }
            for (var i = 0; i < listDisease.length; i++) {
                var diseaseJson = {
                    "diseasesID": listDisease[i],
                    "appointmentID": appointmentID
                };
                promises.push(dao.create(db.MedicalDiseases, diseaseJson));
            }
            await Promise.all(promises);
        } catch (err) {
            logger.log(err);
            throw new Error(Const.Error.MecicalRecordCreatedAnErrorOccured);
        }
    },

    removeStuffMedialRecord: function(appointmentID){
        var json = {"appointmentID": appointmentID};

        dao.deleteByProperties(db.MedicalRecord, json)
        .catch(err => {
            logger.log(err);
        })
        dao.deleteByProperties(db.MedicalMedicine, json)
        .catch(err => {
            logger.log(err);
        })
        dao.deleteByProperties(db.MedicalDiseases, json)
        .catch(err => {
            logger.log(err);
        })
        
    }
}
module.exports = medicalRecordDao;