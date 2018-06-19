var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var patientDao = {
    checkExistedPatient: function (phoneNumber, fullName) {
        var json = { "phoneNumber": phoneNumber, "fullName": fullName };
        return new Promise((resolve, reject) => {
            dao.findByProperties(db.Patient, json)
                .then(collection => {
                    if (collection.length > 0) {
                        resolve(collection[0]);
                    }
                    reject(null);
                })
                .catch(err => {
                    logger.log(err);
                    reject(null);
                });
        });
    },

    checkPatientBooked: function (clinicUsername, phoneNumber, fullName) {
        return new Promise((resolve, reject) => {
            this.checkExistedPatient(phoneNumber, fullName)
                .then(patient => {
                    var startDate = new Date(), endDate = new Date();
                    startDate.setHours(0, 0, 0, 0);
                    endDate.setHours(23, 59, 59, 999);                                        
                    var json = { "clinicUsername": clinicUsername, "patientID": patient.patientID };
                    db.Appointment.where(json)
                        .query(function (appointment) {
                            appointment.whereBetween('appointmentTime', [startDate, endDate]);                            
                        })
                        .fetchAll()
                        .then(model => {                            
                            if (model.toJSON().length > 0) {
                                resolve(true);
                                return;
                            }
                            resolve(false);
                        })
                        .catch(err => {
                            logger.log(err);
                            resolve(true)
                        });
                })
                .catch(err => {
                    resolve(false);
                });
        });
    }
};

module.exports = patientDao; 