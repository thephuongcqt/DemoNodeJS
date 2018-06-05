var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.get("/getAll", function (req, res) {
        db.Appointment.forge()
            .fetchAll()
            .then(function (collection) {
                var responseObj = utils.makeResponse(true, collection.toJSON(), false);
                res.json(responseObj);
            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, err.message, true);
                res.json(responseObj);
            });
    });

    apiRouter.get("/findAppointmentForClinic", function (req, res) {
        var clinicUsername = req.query.clinicUsername;
        db.Appointment.forge()
            .where("clinicUsername", clinicUsername)
            .fetchAll()
            .then(function (collection) {
                if (collection.length > 0) {
                    var appointmentList = collection.toJSON();
                    var patientIDs = [];
                    for (var i in appointmentList) {
                        patientIDs.push(appointmentList[i].patientID);
                    }
                    db.Patient.forge()
                        .where("patientID", "in", patientIDs)
                        .fetchAll()
                        .then(function (collection) {
                            if (collection.length > 0) {
                                var patients = collection.toJSON();
                                var patientList = [];
                                var date = new Date();
                                var parseDate = date.toDateString();
                                for (var i in patients) {
                                    var patient = patients[i];
                                    for (var j in appointmentList) {
                                        var appointment = appointmentList[j];
                                        if (appointment.patientID == patient.patientID) {
                                            appointment.appointmentTime = appointment.appointmentTime.toDateString();
                                            delete appointment.clinicUsername;
                                            delete appointment.patientID;
                                            appointment.patient = patient;
                                        }
                                    }
                                    patientList.push(appointment);
                                }
                                var responseObj = utils.makeResponse(true, patientList, null);
                                res.json(responseObj);
                            } else {
                                var responseObj = utils.makeResponse(false, null, "This clinic does not have schedule appointments");
                                res.json(responseObj);
                            }
                        })
                        .catch(function (err) {
                            var responseObj = utils.makeResponse(false, null, err.message);
                            res.json(responseObj);
                        });
                } else {
                    var responseObj = utils.makeResponse(false, null, "This clinic is not exist");
                    res.json(responseObj);
                }
            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, null, err.message);
                res.json(responseObj);
            });
    });

    return apiRouter;
}
