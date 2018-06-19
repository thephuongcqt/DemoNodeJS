var db = require("../DataAccess/DBUtils");
var Moment = require("moment");
var utils = {
    responseFailure: function(error){
        var response = {
            "status": false,
            "value": null,
            "error": error
        };
        return response;
    },
    responseSuccess: function(value){
        var response = {
            "status": true,
            "value": value,
            "error": null
        };
        return response;
    },

    checkNumberInArray: function(phoneNumber, array){
        for(var i in array){
            if(phoneNumber.trim() === array[i].trim()){
                return true;
            }
        }
        return false;
    },

    getFakePhoneNumber: function(bookedNumbers, randomNumbers){
        for(var i in randomNumbers){
            if(!this.checkNumberInArray(randomNumbers[i], bookedNumbers))
                return randomNumbers[i].trim();
        }
        return null;
    },

    getBookedNumbers: function(clinicUsername) {
        var startCurrentDay = new Date();
        startCurrentDay.setHours(0, 0, 0, 0);
        var endCurrentDay = new Date();
        endCurrentDay.setHours(23, 59, 59, 999);
    
        return new Promise((resolve, reject) => {
            db.Appointment.forge()
                .query(function (appointment) {
                    appointment.whereBetween('appointmentTime', [startCurrentDay, endCurrentDay]);
                    appointment.where("clinicUsername", clinicUsername);
                })
                .fetchAll({ withRelated: ["patient"] })
                .then(function (model) {
                    var appointments = model.toJSON();
                    var bookedNumbers = [];
                    for (var i in appointments) {
                        bookedNumbers.push(appointments[i].patient.phoneNumber);
                    }
                    resolve(bookedNumbers);                
                })
                .catch(function(err){
                    reject(bookedNumbers);
                })
        });
    },
    
    parseDate: function(date){
        if(date){
            return Moment(date).format("YYYY-MM-DDTHH:mm:ss.sssZ");
        } 
        return null;        
    }
}
module.exports = utils;