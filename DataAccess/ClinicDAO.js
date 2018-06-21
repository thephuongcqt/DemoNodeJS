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
    }
}
module.exports = clinicDao;