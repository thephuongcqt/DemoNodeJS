var db = require("../DataAccess/DBUtils");
var Moment = require("moment");
var utils = {
    responseFailure: function (error) {
        var response = {
            "status": false,
            "value": null,
            "error": error
        };
        return response;
    },
    
    responseSuccess: function (value) {
        var response = {
            "status": true,
            "value": value,
            "error": null
        };
        return response;
    },

    checkNumberInArray: function (phoneNumber, array) {
        for (var i in array) {
            if (phoneNumber.trim() === array[i].trim()) {
                return true;
            }
        }
        return false;
    },

    getFakePhoneNumber: function (bookedNumbers, randomNumbers) {
        for (var i in randomNumbers) {
            if (!this.checkNumberInArray(randomNumbers[i], bookedNumbers))
                return randomNumbers[i].trim();
        }
        return null;
    },

    parseDate: function (date) {
        if (date) {
            return Moment(date).format("YYYY-MM-DDTHH:mm:ss.000Z");
        }
        return null;
    },

    parseTime: function (time) {
        if (time) {
            return Moment(time, "h:mm:ss A").format("HH:mm:ss");
        }
        return null;
    },

    getMomentTime: function (time){
        if(time){
            return Moment(time, "HH:mm:ss");
        }
        return null;
    },

    toUpperCaseForName: function (name) {
        var splitStr = name.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }        
        return splitStr.join(' ');
    },

    generatePasswordToken: function() {
        var min = 1000, max = 9999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
module.exports = utils;