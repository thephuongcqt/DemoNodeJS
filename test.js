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
    // var patientID = 385;
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

    // var arr = ["dh nguyễn thế phương", "dh Thuan Phan", "than phan", "cao duy nguyễn", "dh tuấn kiệt", "pm tuan kiet", "dh tuan kiet", "dh duy", "dh Phuon...a A@AS", "dh Acls A12", "dh A[]"];
    // for (var index in arr){
    //     var item = arr[index];
    //     var message = utils.toBeautifulName(item);        
    //     if(utils.checkValidateMessage(message)){
    //         // console.log(message.replace(new RegExp("^Dh "), ""))
    //         console.log(utils.getFullName(message));
    //     } else{
    //         // console.log("Error: " + message);
    //     }
    // }   
    var patientID = 614;
    var checkPatient = await baseDAO.findByProperties(db.Patient, { "phoneNumber": "+84969345159", "fullName": "Nguyễn Thế Phương" });
    if (checkPatient && checkPatient.length > 0) {
        try {
            var existedPatient = checkPatient[0];
            var appointmentOfPatients = await baseDAO.findByProperties(db.Appointment, { "patientID": patientID });
            if (appointmentOfPatients && appointmentOfPatients.length > 0) {
                var promises = [];
                for (var index in appointmentOfPatients) {
                    var appointment = appointmentOfPatients[index];
                    var json = {
                        appointmentID: appointment.appointmentID,
                        patientID: existedPatient.patientID
                    }
                    promises.push(await baseDAO.update(db.Appointment, json, "appointmentID"));
                }
                Promise.all(promises);
                await baseDAO.deleteByProperties(db.Patient, { "patientID": patientID });
            } else {
                console.log("alo");
            }
            // var appointmentOfPatients = await baseDAO.findByProperties(db.Appointment, { "patientID": patientID });
            // if (appointmentOfPatients.length > 0) {
            //     for (var i in appointmentOfPatients) {
            //         var appointmentOfPatient = appointmentOfPatients[i];
            //         if (appointmentOfPatient.patientID != checkPatient[0].patientID) {
            //             var updateAppointment = await baseDAO.update(db.Appointment, { "appointmentID": appointmentOfPatient.appointmentID, "patientID": checkPatient[0].patientID }, "appointmentID");
            //             await baseDAO.delete(db.Patient, "patientID", patientID);
            //             patientID = checkPatient[0].patientID;
            //         }
            //     }
            // } else {
            //     res.json(utils.responseFailure(Const.GetAppointmentListFailure));
            //     return;
            // }
        } catch (error) {
            logger.log(error);
            console.log(error);
            // res.json(utils.responseFailure(Const.GetAppointmentListFailure));
        }
    } else {
        console.log("no thing");
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
