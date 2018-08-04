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
var ggServices = require("./SpeechToText/GoogleServices");

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

var test = async function () {
    try {
        var text = "Khi bên anh em thấy điều chi"; 
        var url = await ggServices.getVoiceFromText(text, "hoanghoa");
        console.log(url);
    } catch (error) {
        console.log(error);
    }
};
test();

function findStartDayOff(today, wks){
    var root = today;    
    var count = 0;
    while(wks[today] == 1){
        today = getNextDay(today, false);
        if(wks[today] != 1){
            return count;
        }
        if(today == root){
            return count;
        }
        count++;
    }
    return count;
}

function findEndDayOff(today, wks){   
    var root = today; 
    var count = 0;
    while(wks[today] == 1){
        today = getNextDay(today, true);
        if(wks[today] != 1){
            return count;
        }
        if(today == root){
            return count;
        }
        count++;
    }
    return count;
}

function getNextDay(today, ascending){
    if(ascending == true){
        if(today == 6){
            return 0;
        } else{
            return today + 1;
        }
    } else{
        if(today == 0){
            return 6;
        } else{
            return today - 1;
        }
    }
}

function getTotalDuration(count, duration) {
    var times = miliseconds(duration.hour(), duration.minute(), duration.second());
    return count * times;
}

function miliseconds(hours, minutes, seconds) {
    return ((hours * 60 * 60 + minutes * 60 + seconds) * 1000);
}