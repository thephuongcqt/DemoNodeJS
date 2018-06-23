var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var clinicDao = {
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
            var json = { "phoneNumber": phoneNumber };
            var clinics = await dao.findByPropertiesWithRelated(db.User, json, "clinic");
            if (!clinics || clinics.length == 0) {
                throw new Error("Cannot find clinic by phone number");
            }
            var clinic = clinics[0];
            if (clinic && clinic.greetingURL) {
                return clinic.greetingURL;
            } else {
                throw new Error("Fail to get greeting URL");
            }
        } catch (error) {
            logger.log(error);
            return Const.DefaultGreetingURL;
        }
    },

    registerClinic: async function (username, password, email, fullName, address, clinicName) {
        var results = null;
        var userJson = { "username": username, "password": password, "fullName": fullName, "role": Const.ROLE_CLINIC, "isActive": Const.ACTIVATION, "email": email };
        var clinicJson = { "username": username, "address": address, "clinicName": clinicName, "imageURL": "qweeq", "greetingURL": "eqweqw" };
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