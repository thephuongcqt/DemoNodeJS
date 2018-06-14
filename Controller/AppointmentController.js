var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
const dateFormat = require('dateformat');
var Moment = require('moment');

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.get("/getAppointmentsList", function (req, res) {
        var clinicUsername = req.query.clinicUsername;

        var startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        var endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        getAppointmentsList(clinicUsername, startDate, endDate)
        .then(function(result){
            res.json(utils.responseSuccess(result));
        })
        .catch(function(err){
            res.json(utils.responseFailure(err));
        });
    });

    apiRouter.get("/getAppointmentsListByDate", function (req, res) {
        var clinicUsername = req.query.clinicUsername;
        var searchDate = req.query.date;

        var startDate, endDate;    
        if(searchDate == null){
            console.log("hahaha");
            startDate = new Date();
            endDate = new Date();
        } else{
            startDate = new Date(searchDate);
            endDate = new Date(searchDate);
        }        
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        getAppointmentsList(clinicUsername, startDate, endDate)
        .then(function(result){
            res.json(utils.responseSuccess(result));
        })
        .catch(function(err){
            res.json(utils.responseFailure(err));
        });
    });

    apiRouter.get("/findAppointmentForClinic", function (req, res) {
        var clinicUsername = req.query.clinicUsername;
        var sql = "SELECT * FROM tbl_appointment WHERE clinicUsername = '" + clinicUsername + "' AND DATE(appointmentTime) = CURRENT_DATE()";
        db.knex.raw(sql)
            .then(function (collection) {
                result = collection[0];
                if (result.length > 0) {
                    var tmp = [];
                    for (var i in result) {
                        tmp.push(result[i].patientID);
                    }
                    db.Patient.forge()
                        .where("patientID", "in", tmp)
                        .fetchAll()
                        .then(function (patientsResult) {
                            var results = [];
                            for (var i in result) {
                                var tmpAppointment = JSON.parse(JSON.stringify(result[i]));
                                var convertTime = Moment(tmpAppointment.appointmentTime).format('YYYY-MM-DDTHH:mm:ss.sssZ');
                                for (j in patientsResult.models) {
                                    var tmpPatient = patientsResult.models[j].toJSON();
                                    if (tmpAppointment.patientID == tmpPatient.patientID) {
                                        tmpAppointment.appointmentTime = convertTime;
                                        tmpAppointment.patient = tmpPatient;
                                    }
                                }
                                delete tmpAppointment.clinicUsername;
                                delete tmpAppointment.patientID;
                                tmpAppointment.currentTime = Moment(new Date()).format('YYYY-MM-DDTHH:mm:ss.sssZ');
                                results.push(tmpAppointment);
                            }
                            res.json(utils.responseSuccess(results));
                        });
                } else {
                    res.json(utils.responseFailure("Không có cuộc hẹn nào"));
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
            });
    });
    // get appointment of clinic
    apiRouter.post("/findAppointmentByDate", async function (req, res) {
        var username = req.body.username;
        var dateSearch = req.body.dateSearch;
        await new db.User({ "username": username })
            .fetch({ withRelated: ["clinic"] })
            .then(async function (model) {
                if (model == null) {
                    res.json(utils.responseFailure("Clinic is not exist"));
                } else {
                    var clinic = model.toJSON();
                    var listAppointment = [];
                    await new db.Clinic({ "username": username })
                        .fetch({ withRelated: ["appointments"] })
                        .then(async function (model) {
                            var appointment = model.toJSON();
                            if (appointment.appointments.length > 0) {
                                if (dateSearch == null) {
                                    dateSearch = new Date().toDateString();
                                } else {
                                    dateSearch = new Date(dateSearch).toDateString();
                                }
                                for (var i in appointment.appointments) {
                                    var appointmentList = appointment.appointments[i];
                                    await new db.Appointment(appointmentList)
                                        .fetch({ withRelated: ["patient"] })
                                        .then(function (collection) {
                                            var patient = collection.toJSON();
                                            var dateAppointment = patient.appointmentTime.toDateString();
                                            var convertTime = moment(patient.appointmentTime).format('YYYY-MM-DDTHH:mm:ss.sssZ');
                                            patient.appointmentTime = convertTime;
                                            if (dateAppointment == dateSearch) {
                                                delete patient.clinicUsername;
                                                delete patient.patientID;
                                                listAppointment.push(patient);
                                            }
                                        })
                                        .catch(function (err) {
                                            res.json(utils.responseFailure(err.message));
                                        });
                                }
                                res.json(utils.responseSuccess(listAppointment));
                            } else {
                                res.json(utils.responseFailure("Clinic have not appointment"));
                            }
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
            });
    });
    return apiRouter;
};

function getAppointmentsList(username, startDate, endDate){
    return new Promise((resolve, reject) => {
        db.Appointment.forge()
            .query(function (appointment) {
                appointment.whereBetween('appointmentTime', [startDate, endDate]);
                appointment.where("clinicUsername", username);
            })
            .fetchAll({ withRelated: ["patient"] })
            .then(function (model) {
                var appointments = model.toJSON();
                if(appointments.length == 0){
                    reject("Không có cuộc hẹn nào");
                    return;
                }
                for(var i in appointments){
                    var appointment = appointments[i];
                    delete appointment.clinicUsername;
                    delete appointment.patientID;
                    appointment.currentTime = Moment(new Date()).format('YYYY-MM-DDTHH:mm:ss.sssZ');
                    appointment.appointmentTime = Moment(appointment.appointmentTime).format('YYYY-MM-DDTHH:mm:ss.sssZ');
                }
                resolve(appointments);
            })
            .catch(function (err) {
                reject(err.message);
            });
    });
}
