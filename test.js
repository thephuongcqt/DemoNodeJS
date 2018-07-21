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
        var json = {
            clinicUsername: "hoanghoa",
            diseaseID: 1
        }
        var regimens = await baseDAO.findByProperties(db.Regimen, json);        
        if(regimens && regimens.length > 0){
            var reminding = regimens[0].reminding;
            console.log(reminding);
            var regimenMedicine = await baseDAO.findByPropertiesWithRelated(db.RegimenMedicine, json, "medicine");
            var medicines = [];
            for(var index in regimenMedicine){
                var item = regimenMedicine[index];
                var medicine = {
                    "medicineID": item.medicineID,
                    "quantity": item.quantity,
                    "description": item.description,
                    "unitName": item.medicine.unitName
                }
                medicines.push(medicine);
            }
            console.log(medicines);
        } else{
            console.log("something wrong");
        }
        
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
