var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var dao = require("./BaseDAO");
var appointmentDao = require("./AppointmentDAO");

var patientDao = {
    insertNotExistedPatient: function(patient){        
        return new Promise(async (resolve, reject) => {
            try {
                var receivedPatient = await this.checkExistedPatient(patient.phoneNumber, patient.fullName);
                if(receivedPatient){
                    resolve(receivedPatient);                    
                } else{
                    var model = await dao.create(db.Patient, patient);
                    patient.patientID = model.id;
                    patient.address = null;
                    resolve(patient);
                }
            } catch (error) {
                reject(error);
            }            
        });
    },

    checkExistedPatient: function (phoneNumber, fullName) {
        var json = { "phoneNumber": phoneNumber, "fullName": fullName };
        return new Promise((resolve, reject) => {
            dao.findByProperties(db.Patient, json)
                .then(collection => {
                    if (collection.length > 0) {
                        resolve(collection[0]);
                    }
                    resolve(null);
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
                    if (patient) {                        
                        var json = { "clinicUsername": clinicUsername, "patientID": patient.patientID };
                        appointmentDao.getAppointmentsInCurrentDayWithProperties(json)
                        .then(model => {
                            if(model.length > 0){
                                resolve(true);
                            } else{
                                resolve(false);
                            }
                        })
                        .catch(err => {
                            reject(err);
                            logger.log(err);
                        })
                    } else{
                        resolve(false);
                    }
                })
                .catch(err => {
                    reject(err);
                    logger.log(err);
                });
        });
    },
    getPatientInfo: function (patientID) {
        return new Promise((resolve, reject) => {
            dao.findByID(db.Patient, "patientID", patientID)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Patient is not exist");
                });
        });
    },
    getAllPatient: function () {
        return new Promise((resolve, reject) => {
            dao.findAll(db.Patient)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Patient is not exist");
                });
        });
    },
};

module.exports = patientDao; 