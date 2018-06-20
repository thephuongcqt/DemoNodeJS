var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var dao = require("./BaseDAO");

var appointmentDao = {
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
    
    getAppointmentsForSpecifyDayWithProperties: function(json, dateString){
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

    getAppointmentsForSpecifyDayWithRelated: function(json, dateString, related){
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
    }
};

module.exports = appointmentDao;