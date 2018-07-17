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
        if ((startWorking == null) || (endWorking == null) || (count == null) || (duration == null)) {            
            throw new Error("Null pointer Exception at getExpectationTime");
        }
        var mCurrentTime = utils.getMomentTime(new Date());
        if (endWorking < mCurrentTime) {
            return null;
        }

        var mStart = utils.getMomentTime(startWorking);
        var mEnd = utils.getMomentTime(endWorking);
        var mDuration = utils.getMomentTime(duration);
        var aExaminationDuration = getTotalDuration(1, mDuration);

        var mExpectation = null;
        if (lastAppointment) {
            mExpectation = utils.getMomentTime(lastAppointment.appointmentTime);
            mExpectation.add(aExaminationDuration, "milliseconds");
        } else {
            mExpectation = utils.getMomentTime(startWorking);
            var miliseconds = getTotalDuration(count, mDuration);
            mExpectation.add(miliseconds, "milliseconds");
        }

        // Begin WhileExpectation time is early than current time        
        while (mExpectation <= mCurrentTime) {
            mExpectation.add(aExaminationDuration, "milliseconds");
        }
        // End WhileExpectation time is early than current time
        if (mExpectation < mEnd) {
            return mExpectation;
        } else {
            return null;
        }
    },

    getExpectationAppointment: async function (clinic) {
        var bookingDate = new Date().getDay();
        var clinicUsername = clinic.username;

        var configs = await baseDao.findByProperties(db.WorkingHours, { "clinicUsername": clinicUsername, "applyDate": bookingDate });
        if (configs != null && configs.length > 0) {
            var config = configs[0];
            var appointments = await appointmentDao.getAppointmentsInCurrentDayWithProperties({ "clinicUsername": clinicUsername });
            var lastAppointment = appointments.length > 0 ? appointments[appointments.length - 1] : null;            
            var mTime = this.getExpectationTime(config.startWorking, config.endWorking, appointments.length, clinic.examinationDuration, lastAppointment);
            if (mTime) {
                var bookedTime = mTime.toDate();
                var mDuration =  Moment.duration(clinic.examinationDuration);
                mTime.subtract(mDuration);
                return {
                    bookedTime: bookedTime,
                    no: appointments.length + 1,                    
                };
            }
            return null;
        } else {
            throw new Error("Cannot find config working hours at method getExpectationAppointment");
        }
    }
}