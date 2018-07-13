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
    // try {
    //     // var result = await medicalDao.removeStuffMedialRecord(appointmentID);
    //     // console.log(result);
    //     var json = { patientID: patientID };
    //     var medicalRecords = []
    //     var result = await baseDAO.findByPropertiesWithRelated(db.Appointment, json, "medicalRecord");
    //     for (var index in result) {
    //         var appointment = result[index];
    //         var recordJson = { appointmentID: appointment.appointmentID };
    //         var items = await baseDAO.findByPropertiesWithManyRelated(db.MedicalRecord, recordJson, ["medicalDisease", "medicalMedicines"]);
    //         if (items && items.lenngth > 0) {
    //             var item = items[0];

    //             var medicalRecord = appointment.medicalRecord;
    //             medicalRecord.medicalMedicines = item.medicalMedicines;
    //             medicalRecord.medicalDisease = item.medicalDisease;

    //             medicalRecords.push(medicalRecord);
    //         }
    //     }
    //     console.log(medicalRecords);
    // } catch (error) {
    //     console.log(error);
    // }
    // var firstLetter = "[A-EGHIK-VXYÂĐỔÔÚỨ]".normalize("NFC"),
    //     otherLetters = "[a-eghik-vxyàáâãèéêìíòóôõùúýỳỹỷỵựửữừứưụủũợởỡờớơộổỗồốọỏịỉĩệểễềếẹẻẽặẳẵằắăậẩẫầấạảđ₫]".normalize("NFC"),
    //     regexString = "^Mp "
    //         // + firstLetter + otherLetters + "+\\s"
    //         + "(" + firstLetter + otherLetters + "+\\s)*";
    //         // + firstLetter + otherLetters + "+$";
    // var regexPattern = RegExp(regexString);

    var arr = ["dh nguyễn thế phương", "dh Thuan Phan", "than phan", "cao duy nguyễn", "dh tuấn kiệt", "pm tuan kiet", "dh tuan kiet", "dh duy", "dh Phuon...a A@AS", "dh Acls A12", "dh A[]"];
    for (var index in arr){
        var item = arr[index];
        var message = utils.toBeautifulName(item);        
        if(utils.checkValidateMessage(message)){
            // console.log(message.replace(new RegExp("^Dh "), ""))
            console.log(utils.getFullName(message));
        } else{
            // console.log("Error: " + message);
        }
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