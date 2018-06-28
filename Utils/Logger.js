var fs = require('fs');
var Moment = require('moment');

function getFilePath(){    
    return "./Logs/" + Moment(new Date()).format('YYYY-MM-DD') + ".log";
}

var logger = {
    log: function(error){
        if(!error){
            error = new Error("Undefined Error");            
        }
        var time = Moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        var logMessage = "\r\n" + time;
        if(error.stack){
            logMessage += "\r\n\t" + error.stack;
        } else{
            logMessage += "\r\n\t" + error;
        }        
        var filePath = getFilePath();
        fs.appendFileSync(filePath, logMessage);
    }
};
module.exports = logger;