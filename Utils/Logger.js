var fs = require('fs');
var utils = require("../Utils/Utils");
var Moment = require('moment');

function getFilePath() {
    return "./Logs/" + Moment(new Date()).format('YYYY-MM-DD') + ".log";
}
function getSuccessFilePath() {
    return "./ActiveLogs/" + Moment(new Date()).format('YYYY-MM-DD') + ".log";
}
var logger = {
    log: function (error) {
        try {
            if (!error) {
                error = new Error("Undefined Error");
            }
            var time = Moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            var logMessage = "\r\n" + time;
            if (error.stack) {
                logMessage += "\r\n\t" + error.stack;
            } else {
                logMessage += "\r\n\t" + error;
            }
            var filePath = getFilePath();
            fs.appendFileSync(filePath, logMessage);
        } catch (error) {
            console.log(error);
        }
    },
    successLog: function (api) {
        try {
            var time = Moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            var logMessage = "\r\n" + time;
            logMessage += "\r\n\t" + api + ": successfull!";
            var filePath = getSuccessFilePath();
            fs.appendFileSync(filePath, logMessage);
        } catch (info) {
            console.log(info);
        }
    }
};
module.exports = logger;