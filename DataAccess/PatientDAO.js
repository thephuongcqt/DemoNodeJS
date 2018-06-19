var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var patientDao = {
    checkExistedPatient: function(phoneNumber, fullName){
        var json = {"phoneNumber": phoneNumber, "fullName": fullName};
        dao.findByProperties(db.Patient, json)
        .then(collection => {
            if(collection.length > 0){
                return collection[0];
            }
            return null;
        })
        .catch(err => {
            logger.log(err);
            return null;
        });
    }
};

module.exports = patientDao; 