var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var workingHoursDao = {
    getWorkingHours: function (username) {
        return new Promise((resolve, reject) => {
            dao.findByIDWithRelated(db.Clinic, "username", username, "workingHours")
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Giờ làm việc không tồn tại");
                });
        });
    },
    updateWorkingHour: function (username, applyDate, parseStartWorking, parseEndWorking, isDayOff) {
        var json = { "clinicUsername": username, "applyDate": applyDate, "startWorking": parseStartWorking, "endWorking": parseEndWorking, "isDayOff": isDayOff };
        return new Promise((resolve, reject) => {
            dao.updateArray(db.WorkingHours, json, "clinicUsername", "applyDate")
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Giờ làm việc không tồn tại");
                });
        });
    },
    updateWorkingHours: function (username, applyDate, parseStartWorking, parseEndWorking, isDayOff) {
        var json = { "clinicUsername": username, "applyDate": applyDate, "startWorking": parseStartWorking, "endWorking": parseEndWorking, "isDayOff": isDayOff };
        return new Promise((resolve, reject) => {
            dao.updateArray(db.WorkingHours, json, "clinicUsername", "applyDate")
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Giờ làm việc không tồn tại");
                });
        });
    }
}
module.exports = workingHoursDao;