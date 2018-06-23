var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");
var configUtils = require("../Utils/ConfigUtils");

var clinicDao = {
    getTwilioAccountByID: async function(accountSid){
        try {
            var json = {accountSid: accountSid};
            var clinics = await dao.findByProperties(db.Clinic, json);
            if(clinics && clinics.length > 0){
                var clinic = clinics[0];                
                if(clinic){
                    var accountSid = clinic.accountSid;
                    var authToken = clinic.authToken;
                    if(accountSid && authToken){
                        return configUtils.getTwilioAccount(accountSid, authToken);
                    }
                }
            } 
            throw new Error("Cannot find Clinic by accountSid");
        } catch (error) {
            logger.log(error);
        }
        return configUtils.getDefaultTwilio();
    },

    getTwilioAccountByPhoneNumber: async function(phoneNumber){
        try {
            var json = {phoneNumber: phoneNumber};
            var users = await dao.findByPropertiesWithRelated(db.User, json, "clinic");
            if(users && users.length > 0){
                var user = users[0];                
                if(user && user.clinic){
                    var clinic = user.clinic;
                    if(clinic){
                        var accountSid = clinic.accountSid;
                        var authToken = clinic.authToken;
                        if(accountSid && authToken){
                            return configUtils.getTwilioAccount(accountSid, authToken);
                        }
                    }                    
                }
            }
            throw new Error("Cannot find clinic by phone number");
        } catch (error) {
            logger.log(error);
        }
        return configUtils.getDefaultTwilio();
    },

    getClinicsWaitingForPhoneNumber: async function () {
        var json = { role: Const.ROLE_CLINIC, isActive: Const.ACTIVATION };
        var result = await db.User.where(json)
            .query(user => {
                user.where('phoneNumber', null);
            })
            .fetchAll({ withRelated: ["clinic"] });
        return result.toJSON();
    },

    findClinicByPhone: async function (phoneNumber) {
        var result = null;
        try {
            var collection = await dao.findByPropertiesWithRelated(db.User, { "phoneNumber": phoneNumber }, "clinic")
            if (collection != null && collection.length > 0) {
                result = collection[0];
            }
        } catch (error) {
            logger.log(error);
        }
        return result;
    },

    getAllClinic: function () {
        return new Promise((resolve, reject) => {
            var json = { "role": Const.ROLE_CLINIC, "isActive": Const.ACTIVATION };
            dao.findByPropertiesWithRelated(db.User, json, "clinic")
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Không tồn tại tài khoản nào");
                });
        });
    },

    getClinicInfo: async function (username) {
        var results = null;
        try {
            var collection = await dao.findByIDWithRelated(db.User, "username", username, "clinic");
            if (collection != null) {
                results = collection;
                var collection = await dao.findByIDWithRelated(db.Clinic, "username", username, "workingHours");
                if (collection != null) {
                    results.workingHours = collection.workingHours;
                }
            }
        } catch (error) {
            logger.log(error);
        }
        return results;
    },
    getGreetingURL: async function (phoneNumber) {
        try {
            if (!phoneNumber) {
                throw new Error("Undefined phone number");
            }
            phoneNumber = "+" + phoneNumber.trim();
            var json = { "phoneNumber": phoneNumber };
            var clinics = await dao.findByPropertiesWithRelated(db.User, json, "clinic");
            if (!clinics || clinics.length == 0) {
                throw new Error("Cannot find clinic by phone number");
            }
            var clinic = clinics[0].clinic;
            if (clinic && clinic.greetingURL) {
                return clinic.greetingURL;
            } else {
                throw new Error("Fail to get greeting URL");
            }
        } catch (error) {
            logger.log(error);
            return configUtils.getDefaultGreetingURL();
        }
    },

    registerClinic: async function (username, password, email, fullName, address, clinicName, applyDateList) {
        var results = null;
        var userJson = { "username": username, "password": password, "fullName": fullName, "role": Const.ROLE_CLINIC, "isActive": Const.ACTIVATION, "email": email };
        var clinicJson = { "username": username, "address": address, "clinicName": clinicName, "imageURL": null, "greetingURL": null };
        try {
            var addUser = await dao.create(db.User, userJson);
            var addClinic = await dao.create(db.Clinic, clinicJson);
            var workHoursList = [];
            for (var i in applyDateList) {
                var applyDate = applyDateList[i];
                var workHoursJson = { "clinicUsername": username, "startWorking": "6:30:00", "endWorking": "17:00:00", "applyDate": applyDate, "isDayOff": 0 };
                var addWorkHours = await dao.create(db.WorkingHours, workHoursJson);
                workHoursList.push(addWorkHours);
            }
            results = Object.assign(addUser, addClinic);
        } catch (error) {
            logger.log(error);
        }
        return results;
    }
}
module.exports = clinicDao;