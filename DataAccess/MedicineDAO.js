var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var medicineDao = {
    getMedicineInfo: function (medicineID) {
        return new Promise((resolve, reject) => {
            dao.findByID(db.Medicine, "medicineID", medicineID)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Medicine is not exist");
                });
        });
    },
    getAllMedicine: function () {
        return new Promise((resolve, reject) => {
            dao.findAll(db.Medicine)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Medicine is not exist");
                });
        });
    },
    updateMedicine: function (medicineID, medicineName, unitName, isActive) {
        var json = { "medicineID": medicineID, "medicineName": medicineName, "unitName": unitName, "isActive": isActive };
        return new Promise((resolve, reject) => {
            dao.update(db.Medicine, json, "medicineID")
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Update medicine fail");
                });
        });
    },
    createMedicine: function (medicineName, unitName) {
        var json = { "medicineName": medicineName, "unitName": unitName, "isActive": Const.ACTIVATION };
        return new Promise((resolve, reject) => {
            dao.create(db.Medicine, json)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Create medicine successfully");
                });
        });
    },
    deleteMedicine: function (medicineID) {
        return new Promise((resolve, reject) => {
            dao.delete(db.Medicine, "medicineID", licenseID)
                .then(collection => {
                    resolve("Delete medicine successfully");
                })
                .catch(err => {
                    logger.log(err);
                    reject("Delete medicine is fail");
                });
        });
    }

}
module.exports = medicineDao;