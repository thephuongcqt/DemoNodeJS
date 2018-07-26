var Const = require("./Utils/Const");
var db = require("./DataAccess/DBUtils");
var utils = require("./Utils/Utils");
var Moment = require('moment');
var logger = require("./Utils/Logger");
var configUtils = require("./Utils/ConfigUtils");
var twilioUtils = require("./ThirdPartyHotline/TwilioUtils");
var baseDAO = require("./DataAccess/BaseDAO");
var clinicDao = require("./DataAccess/ClinicDAO");
var appointmentDao = require("./DataAccess/AppointmentDAO");
var scheduler = require("./Scheduler/Scheduler");
var medicalDao = require("./DataAccess/MedicalRecordDAO");
var patientDao = require("./DataAccess/PatientDAO");
var symptomDao = require("./DataAccess/SymptomDAO");
var firebase = require("./Notification/FirebaseAdmin");

var test = async function () {
    try {
        var searchValue = "thế";
        var result = await patientDao.searchPatient(searchValue);
        console.log(resutl);
        // var sql = "SELECT DISTINCT *"
        // + " FROM tbl_patient"
        // + " WHERE UPPER(fullName) LIKE UPPER('%" + searchValue + "%')"
        // + " LIMIT 20";
        // db.knex.raw(sql)
        // .then(result => {   
            
        //     var json = JSON.parse(JSON.stringify(result[0]));
        //     console.log(json);
        // })
        // .catch(error => {
        //     console.log(error);
        // });
    } catch (error) {
        console.log(error);
    }
};
test();

function getTotalDuration(count, duration) {
    var times = miliseconds(duration.hour(), duration.minute(), duration.second());
    return count * times;
}

function miliseconds(hours, minutes, seconds) {
    return ((hours * 60 * 60 + minutes * 60 + seconds) * 1000);
}
