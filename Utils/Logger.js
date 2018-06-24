var fs = require('fs');
var Moment = require('moment');

function getFilePath(){    
    return "./Logs/" + Moment(new Date()).format('YYYY-MM-DD') + ".log";
}

var logger = {
    log: function(error){
        var time = Moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        var logMessage = "\r\n" + time;
        try {
            logMessage += "\r\n\t" + error.stack;
        } catch (error) {            
            logMessage += "\r\n\t" + error;
        }
        var filePath = getFilePath();
        fs.appendFileSync(filePath, logMessage);
    }
};
module.exports = logger;