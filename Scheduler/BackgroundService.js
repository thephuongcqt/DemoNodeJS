var schedule = require('node-schedule');
var logger = require("../Utils/Logger");

module.exports = function(){
    var appointmentReminder = schedule.scheduleJob('*/1 * * * *', function(){
        // task run on every minute to notify appointment to patient
        
    });

    var removeTokensTask = schedule.scheduleJob({hour: 00, minute: 00}, function(){
        //task running on everyday midnight to remove expired tokens
        logger.log("removeTokensTask");
    });
}