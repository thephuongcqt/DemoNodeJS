var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var dao = require("./BaseDAO");

var appointmentDao = {
    reportByDate: async function(username, startDate, endDate){
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
                } else{
                    resolve(null);
                }
            })
            .catch(err => {
                reject(err);
            })
        });
    },

    reportByMonth: async function(username, startDate, endDate){
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
                } else{
                    resolve(null);
                }
            })
            .catch(err => {
                reject(err);
            })
        });
    },

    reportByYear: async function(username, startDate, endDate){
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
                } else{
                    resolve(null);
                }
            })
            .catch(err => {
                reject(err);
            })
        });
    },

    getAppointmentsInCurrentDayWithProperties: function (json) {
        var startDate = new Date(), endDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return new Promise((resolve, reject) => {
            db.Appointment.where(json)
                .query(function (appointment) {
                    appointment.whereBetween('appointmentTime', [startDate, endDate]);
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
        var relatedJson = { withRelated: [related] };
        var startDate = new Date(), endDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return new Promise((resolve, reject) => {
            db.Appointment.where(json)
                .query(function (appointment) {
                    appointment.whereBetween('appointmentTime', [startDate, endDate]);
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
        var startDate = new Date(dateString), endDate = new Date(dateString);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return new Promise((resolve, reject) => {
            db.Appointment.where(json)
                .query(function (appointment) {
                    appointment.whereBetween('appointmentTime', [startDate, endDate]);
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
        var relatedJson = { withRelated: [related] };
        var startDate = new Date(dateString), endDate = new Date(dateString);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return new Promise((resolve, reject) => {
            db.Appointment.where(json)
                .query(function (appointment) {
                    appointment.whereBetween('appointmentTime', [startDate, endDate]);
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
                .catch(function (err) {
                    reject(bookedNumbers);
                })
        });
    },
};

module.exports = appointmentDao;