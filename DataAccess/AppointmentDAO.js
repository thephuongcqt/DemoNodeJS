var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var dao = require("./BaseDAO");

var appointmentDao = {
    getAppointmentsToRemind: function (time) {
        var startDate = new Date(time);
        startDate.setHours(0, 0, 0, 0);
        var endDate = time;        
        return new Promise((resolve, reject) => {
            var json = {"isReminded": 0 }
            var related = { withRelated: ["patient"] };
            db.Appointment.where(json)
                .query(function (appointment) {
                    appointment.whereBetween('remindTime', [startDate, endDate]);
                })
                .fetchAll(related)
                .then(model => {
                    if(model){
                        resolve(model.toJSON());
                    } else{
                        resolve(null);
                    }
                })
                .catch(err => {
                    resolve(err);
                });
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