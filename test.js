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
var cloudServices = require("./SpeechToText/CloudServices");

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

var test = async function () {
    try {
        var username = "hoanghoa";
        var sql = "SELECT a.bookedPhone, Count(*) as BookingCount, SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as absent"
            + " FROM tbl_appointment a, tbl_patient b"
            + " WHERE a.patientID = b.patientID AND a.clinicUsername LIKE ?"
            + " GROUP BY a.bookedPhone";
        var result = await baseDAO.rawQuery(sql, [username])
        for(var index in result){
            var item = result[index];
            item.isBlock = true
        }
        console.log(result);
        // db.knex.raw(sql, [username])
        //     .then(result => {
        //         if (result && result.length > 0) {
        //             var tblAppointment = JSON.parse(JSON.stringify(result[0]));                    
        //             console.log(tblAppointment);
        //         }

        //     })
        //     .catch(error => {
        //         console.log(error);
        //     });
        // var text = "  phòng kham biên hoà  ".trim();
        // var newText = text.toUpperCase();
        // var regexs = ["^PHÒNG KHÁM", "^PHONG KHAM", "^PHÒNG KHAM", "^PHONG KHÁM"];
        // var isMatch = false;
        // for (var index in regexs) {
        //     var regexString = regexs[index];
        //     var regexPattern = RegExp(regexString);
        //     if (regexPattern.test(newText)) {
        //         isMatch = true;
        //         break;
        //     }
        // }
        // if(isMatch){
        //     text = text.slice(11);
        // }
        // var clinicName = utils.getClinicName(text);
        // console.log(clinicName);
    } catch (error) {
        console.log(error);
    }
};
test();

function findStartDayOff(today, wks) {
    var root = today;
    var count = 0;
    while (wks[today] == 1) {
        today = getNextDay(today, false);
        if (wks[today] != 1) {
            return count;
        }
        if (today == root) {
            return count;
        }
        count++;
    }
    return count;
}

function findEndDayOff(today, wks) {
    var root = today;
    var count = 0;
    while (wks[today] == 1) {
        today = getNextDay(today, true);
        if (wks[today] != 1) {
            return count;
        }
        if (today == root) {
            return count;
        }
        count++;
    }
    return count;
}

function getNextDay(today, ascending) {
    if (ascending == true) {
        if (today == 6) {
            return 0;
        } else {
            return today + 1;
        }
    } else {
        if (today == 0) {
            return 6;
        } else {
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