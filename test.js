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
var twilioDao = require("./DataAccess/twilioDAO");
var fs = require('fs');

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

var test = async function () {
    try {
        var client = await twilioDao.getTwilioByID("AC5b4d2c6c96b684d25b283d49f138cbd1");
        var checkRecording = async (client, RecordingSid) => {
            return new Promise((resolve, reject) => {
                var maxCount = 5;
                var count = 0;
                var funcChecking = async () => {
                    try {
                        var recording = await client.recordings(RecordingSid).fetch();
                        if (recording.status == 'completed') {
                            resolve();
                        } else {
                            count++;
                            if (count >= maxCount) {
                                reject(new Error("Time out when check recorded file"));
                            }
                            setTimeout(this, 200);
                        }
                    } catch (error) {
                        reject(error);
                    }
                }
                funcChecking();
            })
        }

        await checkRecording(client, "REa9dbedbaf6c0abc4120f862a9bcda14b");
        console.log("done");
        // var text = "lại là mình đây";
        // var text = "Xin chào các bạn mình đang làm một chức năng vô cùng ảo diệu, chức năng này cần nhờ tới sự góp sức của các bạn, mong các bạn có thể giúp đỡ mình bằng cách trả về file lâu một chút, để mình có thể biết được khi nào file chết";
        // var url = await cloudServices.getVoiceFromText(text, "test");
        // console.log(url);
        // for(var i = 0; i < 20; i++){
        //     var text = "Công tằng tôn nữ tạ thị tòng teng đã đặt lịch khám thành công tại phòng khám PGS.TS Phạm Minh Tùng, Số thứ tự của bạn là 4, thời gian khám vào lúc 19 giờ 5 phút ngày 12 tháng 9 năm 2018";
        //     var url = await cloudServices.getVoiceFromText(text, "test" + i + "-");
        //     console.log(url);
        // }        
        // var phoneNumber = "+18327795475";
        // var list = await appointmentDao.getPatientNameForPhoneNumber(phoneNumber, "hoanghoa");
        // console.log(list);
        // var VoiceResponse = require('twilio').twiml.VoiceResponse;
        // var twiml = new VoiceResponse();
        // var audioUrl = "/Files/chotdemo2.mp3";
        // twiml.play({
        //     loop: 2
        // }, audioUrl);
        // twiml.hangup();
        // var fileName = "Files/hoanghoa" + new Date().getTime() + ".xml";
        // var result = await utils.writeFile(fileName, twiml.toString()); 
        // console.log(result);
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