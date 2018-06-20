var Const = require("../Utils/Const");
var utils = require("../Utils/Utils");
var Moment = require('moment');
var baseDao = require("../DataAccess/BaseDAO");
var appointmentDao = require("../DataAccess/AppointmentDAO");
var logger = require("../Utils/Logger");
var db = require("../DataAccess/DBUtils");

function miliseconds(hours, minutes, seconds) {
    return ((hours * 60 * 60 + minutes * 60 + seconds) * 1000);
}

function getTotalDuration(count, duration) {
    var times = miliseconds(duration.hour(), duration.minute(), duration.second());
    return count * times;
}

module.exports = {
    getExpectationTime: function (startWorking, endWorking, count, duration, lastAppointment) {        
        var mCurrentTime = Moment(new Date(), "HH:mm:ss");          
        if (endWorking < mCurrentTime) {
            return null;
        }
        
        var mStart = Moment(startWorking, "HH:mm:ss");
        var mEnd = Moment(endWorking, "HH:mm:ss");
        var mDuration = Moment(duration, "HH:mm:ss");        
        var aExaminationDuration = getTotalDuration(1, mDuration);

        var mExpectation = null;
        if(lastAppointment){
            mExpectation = Moment(lastAppointment.appointmentTime, "HH:mm:ss");            
            mExpectation.add(aExaminationDuration, "milliseconds");            
        } else{
            mExpectation = Moment(startWorking, "HH:mm:ss");
            var miliseconds = getTotalDuration(count, mDuration);
            mExpectation.add(miliseconds, "milliseconds");            
        }        

        // Begin WhileExpectation time is early than current time        
        while (mExpectation <= mCurrentTime) {
            mExpectation.add(aExaminationDuration, "milliseconds");
        }
        // End WhileExpectation time is early than current time

        if (mExpectation < mEnd) {
            return mExpectation.toDate();
        } else {
            return null;
        }
    },

    getExpectationAppointment: async function (clinic) {        
        var bookingDate = new Date().getDay();
        var clinicUsername = clinic.username;        
        try {
            var configs = await baseDao.findByProperties(db.WorkingHours, { "clinicUsername": clinicUsername, "applyDate": bookingDate });
            if (configs != null && configs.length > 0) {
                var config = configs[0];
                var appointments = await appointmentDao.getAppointmentsInCurrentDayWithProperties({ "clinicUsername": clinicUsername });
                var lastAppointment = appointments.length > 0 ? appointments[appointments.length - 1] : null;
                var time = this.getExpectationTime(config.startWorking, config.endWorking, appointments.length, clinic.examinationDuration, lastAppointment);
                if (time) {
                    return { 
                        bookedTime: time, 
                        no: appointments.length + 1
                    };
                } else return null;
            }
        } catch (error) {
            logger.log(error);
            return null;
        }
    }
}