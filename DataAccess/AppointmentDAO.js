var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var dao = require("./BaseDAO");
var Moment = require('moment');
var utils = require("../Utils/Utils");

var appointmentDao = {
    getHistory: async (username) => {
        return new Promise(async (resolve, reject) => {
            try {                
                var sql = "SELECT a.bookedPhone as phoneNumber, Count(*) as bookingCount, SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as absent"
                    + " FROM tbl_appointment a, tbl_patient b"
                    + " WHERE a.patientID = b.patientID AND a.clinicUsername LIKE ?"
                    + " GROUP BY a.bookedPhone";
                var phonesList = await dao.rawQuery(sql, [username]);
                if(!phonesList){
                    phonesList = [];
                }
                var json = {
                    "clinicUsername": username,
                    "isBlock": 1
                }
                var blockList = await dao.findByProperties(db.Block, json);
                if(blockList && blockList.length > 0){
                    for(var i in phonesList){
                        var phone = phonesList[i];
                        phone.isBlock = false;
                        for(var j in blockList){
                            var block = blockList[j];
                            if(block.phoneNumber.trim() == phone.phoneNumber.trim()){
                                phone.isBlock = true;
                                break;
                            }
                        }
                    }
                }
                resolve(phonesList);
            } catch (error) {
                reject(error);
            }
        });
    },

    getMessageForOffDay: async function (username, clinicName) {
        return new Promise(async (resolve, reject) => {
            var results = await dao.findByProperties(db.WorkingHours, { clinicUsername: username });
            var wks = [];
            for (var index in results) {
                var item = results[index];
                wks[item.applyDate] = item.isDayOff;
            }
            var today = new Date().getDay();
            if (wks[today] == 0) {
                reject(new Error("Hom nay phong kham van lam viec binh thuong"));
            }
            var countToStart = findStartDayOff(today, wks);
            var countToEnd = findEndDayOff(today, wks);
            if (countToStart == 6) {
                // off all days of week
                var mStart = new Date().addDays(1 - today);
                var mEnd = new Date().addDays(6 + 1 - today);
                var message = "Phòng khám " + clinicName + " tạm nghỉ từ ngày " + utils.getDateForVoice(mStart) + " đến ngày " + utils.getDateForVoice(mEnd) + ", xin lỗi vì sự bất tiện này";
                resolve(message);
            } else if (countToEnd == 0 && countToStart == 0) {
                resolve("Hôm nay phòng khám " + clinicName + " không làm việc, vui lòng quay lại vào hôm sau");
            } else {
                var mStart = new Date().addDays(-countToStart);
                var mEnd = new Date().addDays(countToEnd);
                var message = "Phòng khám " + clinicName + "  tạm nghỉ từ ngày " + utils.getDateForVoice(mStart) + " đến ngày " + utils.getDateForVoice(mEnd) + ", xin lỗi vì sự bất tiện này";
                resolve(message);
            }
        });
    },

    reportByDate: async function (username, startDate, endDate) {
        var sql = "SELECT count(*) as total, SUM(CASE WHEN status=1 THEN 1 ELSE 0 END) as present, DATE(appointmentTime) as date "
            + "FROM tbl_appointment "
            + "WHERE clinicUsername = ? AND appointmentTime BETWEEN  ? AND ? "
            + "GROUP BY DATE(appointmentTime)";
        return new Promise((resolve, reject) => {
            db.knex.raw(sql, [username, startDate, endDate])
                .then(collection => {
                    var result = collection[0];
                    if (result && result.length > 0) {
                        var model = JSON.parse(JSON.stringify(result));
                        resolve(model);
                    } else {
                        resolve(null);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        });
    },

    reportByMonth: async function (username, startDate, endDate) {
        var sql = "SELECT count(*) as total, SUM(CASE WHEN status=1 THEN 1 ELSE 0 END) as present, MONTH(appointmentTime) as month, YEAR(appointmentTime) as year"
            + " FROM tbl_appointment"
            + " WHERE clinicUsername = ? AND appointmentTime BETWEEN  ? AND ?"
            + " GROUP BY MONTH(appointmentTime)";
        return new Promise((resolve, reject) => {
            db.knex.raw(sql, [username, startDate, endDate])
                .then(collection => {
                    var result = collection[0];
                    if (result && result.length > 0) {
                        var model = JSON.parse(JSON.stringify(result));
                        resolve(model);
                    } else {
                        resolve(null);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        });
    },

    reportByYear: async function (username, startDate, endDate) {
        var sql = "SELECT count(*) as total, SUM(CASE WHEN status=1 THEN 1 ELSE 0 END) as present, YEAR(appointmentTime) as year"
            + " FROM tbl_appointment"
            + " WHERE clinicUsername = ? AND appointmentTime BETWEEN  ? AND ?"
            + " GROUP BY YEAR(appointmentTime)";
        return new Promise((resolve, reject) => {
            db.knex.raw(sql, [username, startDate, endDate])
                .then(collection => {
                    var result = collection[0];
                    if (result && result.length > 0) {
                        var model = JSON.parse(JSON.stringify(result));
                        resolve(model);
                    } else {
                        resolve(null);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        });
    },

    getAppointmentsInCurrentDayWithProperties: function (json) {
        var startDay = utils.getStartDay(), endDay = utils.getEndDay();

        return new Promise((resolve, reject) => {
            db.Appointment.where(json)
                .query(function (appointment) {
                    appointment.whereBetween('appointmentTime', [startDay, endDay]);
                })
                .fetchAll()
                .then(model => {
                    resolve(model.toJSON());
                })
                .catch(err => {
                    reject(err);
                });
        });
    },

    getAppointmentsInCurrentDayWithRelated: function (json, related) {
        var relatedJson = { withRelated: related };
        var startDay = utils.getStartDay(), endDay = utils.getEndDay();
        return new Promise((resolve, reject) => {
            db.Appointment.where(json)
                .query(function (appointment) {
                    appointment.whereBetween('appointmentTime', [startDay, endDay]);
                })
                .fetchAll(relatedJson)
                .then(model => {
                    resolve(model.toJSON());
                })
                .catch(err => {
                    reject(err);
                });
        });
    },

    getAppointmentsForSpecifyDayWithProperties: function (json, dateString) {
        var startDay = utils.getStartDay(new Date(dateString)), endDay = utils.getEndDay(new Date(dateString));
        return new Promise((resolve, reject) => {
            db.Appointment.where(json)
                .query(function (appointment) {
                    appointment.whereBetween('appointmentTime', [startDay, endDay]);
                })
                .fetchAll()
                .then(model => {
                    resolve(model.toJSON());
                })
                .catch(err => {
                    reject(err);
                });
        });
    },

    getAppointmentsForSpecifyDayWithRelated: function (json, dateString, related) {
        var relatedJson = { withRelated: related };
        var startDay = utils.getStartDay(new Date(dateString)), endDay = utils.getEndDay(new Date(dateString));
        return new Promise((resolve, reject) => {
            db.Appointment.where(json)
                .query(function (appointment) {
                    appointment.whereBetween('appointmentTime', [startDay, endDay]);
                })
                .fetchAll(relatedJson)
                .then(model => {
                    resolve(model.toJSON());
                })
                .catch(err => {
                    reject(err);
                });
        });
    },

    getBookedNumbersInCurrentDay: function (clinicUsername) {
        var startDay = utils.getStartDay(), endDay = utils.getEndDay();

        return new Promise((resolve, reject) => {
            db.Appointment.forge()
                .query(function (appointment) {
                    appointment.whereBetween('appointmentTime', [startDay, endDay]);
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
                .catch(function (err) {
                    reject(err);
                })
        });
    },
};

module.exports = appointmentDao;

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function findStartDayOff(today, wks) {
    var root = today;
    var count = 0;
    while (wks[today] == 1) {
        today = getNextDay(today, false);
        if (wks[today] != 1) {
            return count;
        }
        if (today == root) {
            return count;
        }
        count++;
    }
    return count;
}

function findEndDayOff(today, wks) {
    var root = today;
    var count = 0;
    while (wks[today] == 1) {
        today = getNextDay(today, true);
        if (wks[today] != 1) {
            return count;
        }
        if (today == root) {
            return count;
        }
        count++;
    }
    return count;
}

function getNextDay(today, ascending) {
    if (ascending == true) {
        if (today == 6) {
            return 0;
        } else {
            return today + 1;
        }
    } else {
        if (today == 0) {
            return 6;
        } else {
            return today - 1;
        }
    }
}