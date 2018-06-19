var fs = require('fs');
var Moment = require('moment');

function getFilePath(){    
    return "./Logs/" + Moment(new Date()).format('YYYY-MM-DD') + ".log";
}

var logger = {
    log: function(message, method, file){
        var time = Moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        var logMessage = "\r\n" + time;
        if(file){
            logMessage += "\r\n\t File: " + file;
        }
        if(method){
            logMessage += "\r\n\t Method: " + method;
        }
        logMessage += "\r\n\t Error: " + message;

        var filePath = getFilePath();
        fs.appendFileSync(filePath, logMessage);
    }
};
module.exports = logger;