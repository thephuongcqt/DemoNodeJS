var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
const dateFormat = require('dateformat');
var moment = require('moment');

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.get("/getAll", function (req, res) {
        db.Appointment.forge()
            .fetchAll()
            .then(function (collection) {
                res.json(utils.responseSuccess(collection.toJSON()));
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
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
                                var convertTime = moment(tmpAppointment.appointmentTime).format('YYYY-MM-DDTHH:mm:ss.sssZ');
                                for (j in patientsResult.models) {
                                    var tmpPatient = patientsResult.models[j].toJSON();
                                    if (tmpAppointment.patientID == tmpPatient.patientID) {
                                        tmpAppointment.appointmentTime = convertTime;
                                        tmpAppointment.patient = tmpPatient;
                                    }
                                }
                                delete tmpAppointment.clinicUsername;
                                delete tmpAppointment.patientID;
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
    apiRouter.get("/findAppointmentByDate", async function (req, res) {
        var username = req.query.username;
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
                                var date = new Date().toDateString();
                                for (var i in appointment.appointments) {
                                    var appointmentList = appointment.appointments[i];
                                    await new db.Appointment(appointmentList)
                                        .fetch({ withRelated: ["patient"] })
                                        .then(function (collection) {
                                            var patient = collection.toJSON();
                                            var dateAppointment = patient.appointmentTime.toDateString();
                                            var convertTime = moment(patient.appointmentTime).format('YYYY-MM-DDTHH:mm:ss.sssZ');
                                            patient.appointmentTime = convertTime;
                                            if (dateAppointment == date) {
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
}
