var fs = require('fs');
var Moment = require('moment');

function getFilePath(){    
    return "./Log/" + Moment(new Date()).format('YYYY-MM-DD') + ".txt";
}

var logger = {
    log: function(message, method, file){
        var time = Moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        var logMessage = "\n" + time;
        if(file){
            logMessage += "\n\t File: " + file;
        }
        if(method){
            logMessage += "\n\t Method: " + method;
        }
        logMessage += "\n\t Error: " + message;

        var filePath = getFilePath();
        fs.appendFileSync(filePath, logMessage);
    }
};
module.exports = logger;