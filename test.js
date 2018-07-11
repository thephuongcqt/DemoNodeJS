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

var test = async function () {
    var patientID = 385;
    // var appointmentID = 524;
    try {
        // var result = await medicalDao.removeStuffMedialRecord(appointmentID);
        // console.log(result);
        var json = { patientID: patientID };
        var medicalRecords = []
        var result = await baseDAO.findByPropertiesWithRelated(db.Appointment, json, "medicalRecord");
        for (var index in result) {
            var appointment = result[index];
            var recordJson = { appointmentID: appointment.appointmentID };
            var items = await baseDAO.findByPropertiesWithManyRelated(db.MedicalRecord, recordJson, ["medicalDisease", "medicalMedicines"]);
            if (items && items.lenngth > 0) {
                var item = items[0];

                var medicalRecord = appointment.medicalRecord;
                medicalRecord.medicalMedicines = item.medicalMedicines;
                medicalRecord.medicalDisease = item.medicalDisease;

                medicalRecords.push(medicalRecord);
            }
        }
        console.log(medicalRecords);
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