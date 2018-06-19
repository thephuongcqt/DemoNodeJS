var Const = require("./Const");
var utils = require("./Utils");
var Moment = require('moment');

function miliseconds(hours, minutes, seconds) {
    return ((hours * 60 * 60 + minutes * 60 + seconds) * 1000);
}

function getTotalDuration(count, duration) {
    var times = miliseconds(duration.hour(), duration.minute(), duration.second());
    return count * times;
}

module.exports = {
    getExpectationTime: function (startWorking, endWorking, count, duration) {
        var mCurrentTime = Moment(new Date(), "HH:mm:ss");
        if(endWorking < currentTime){            
            return null;
        }
        var mStart = Moment(startWorking, "HH:mm:ss");
        var mEnd = Moment(endWorking, "HH:mm:ss");
        var mDuration = Moment(duration, "HH:mm:ss");
    
        var miliseconds = getTotalDuration(count, mDuration);
    
        var mExpectation = Moment(startWorking, "HH:mm:ss");
        mExpectation.add(miliseconds, "milliseconds");
        
        // Begin WhileExpectation time is early than current time
        var aExaminationDuration = getTotalDuration(1, mDuration);
        while(mExpectation <= mCurrentTime){                            
            mExpectation.add(aExaminationDuration, "milliseconds");
        }
        // End WhileExpectation time is early than current time

        if (mExpectation < mEnd) {
            return mExpectation.toDate();
        } else{
            return null;
        }
    }
}