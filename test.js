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

var test = async function () {
    try {
        // var result = await symptomDao.insertSymptoms("232", []);
        var json = {
            "clinicUsername": "patientInfo.clinicUsername",
            "phoneNumber": "patientInfo.phoneNumber",
            "fullName": "a"
        }
        var json2 = {
            "clinicUsername": "patientInfo.clinicUsername",
            "phoneNumber": "patientInfo.phoneNumber",            
        }

        if (json.fullName && json.fullName.trim() != ''){
            console.log('ok - ' + json);
        } else{
            console.log("bug");
        }
        console.log(json.fullName.trim() == "");
        if (json2.fullName && json2.fullName.trim() != ''){
            console.log('ok - ' + json2);
        } else{
            console.log("bug2");
        }
        // var json = {
        //        phoneNumber: "+18327795475",
        //         fullName: "nguyen the phuonng",
        //         clinicUsername: "hoanghoa"
        // }
        // var result = await patientDao.checkExistedPatient(json);
        // if(result){
        //     console.log(result);
        // } else {
        //     console.log("null");
        // }
        // for (index in result) {
        //     var patient = result[index];
        //     if (patient.fullName.toUpperCase() == "nguyen the phuong".toLocaleUpperCase()) {
        //         console.log("-----------khong dau------------");
        //         console.log(patient);
        //         console.log("-----------khong dau------------");
        //     } else if (patient.fullName.toUpperCase() == "nguyễn thế phương".toLocaleUpperCase()) {
        //         console.log("-----------co dau------------");
        //         console.log(patient);
        //         console.log("-----------co dau------------");
        //     } else {
        //         console.log("default");
        //     }
        // }
        // console.log(result);
        //    var test = ["dm", "cl"];
        //    console.log(test);   
        //    var str = JSON.stringify(test);
        //    console.log(str);
        //    console.log(JSON.parse(str));
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
