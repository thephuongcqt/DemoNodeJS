var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");

var dao = {
    checkDuplicationPatient = async function(phoneNumber, fullName){
        var patient = {"phoneNumber": phoneNumber, "fullName": fullName};
        new db.Patient(patient)
        .fetch()
        .then(model => {
            return model.toJSON();
        })
        .catch(err => {
            return null;
            logger.log(err.message, "checkDuplicationPatient", "PatientDAO");
        });
    }
};

module.exports = dao;