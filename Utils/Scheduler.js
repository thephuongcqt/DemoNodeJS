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

        var mStart = Moment(startWorking, "HH:mm:ss");
        var mEnd = Moment(endWorking, "HH:mm:ss");
        var mDuration = Moment(duration, "HH:mm:ss");
    
        var miliseconds = getTotalDuration(count + 1, mDuration);
    
        var mExpectation = Moment(startWorking, "HH:mm:ss");
        mExpectation.add(miliseconds, "milliseconds");
        
        if (mExpectation <= mEnd) {
            return mExpectation.toDate();
            console.log(mExpectation);
        } else{
            return null;
        }
    }
}