var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
const dateFormat = require('dateformat');

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
                                // console.log(tmpAppointment);
                                for (j in patientsResult.models) {
                                    var tmpPatient = patientsResult.models[j].toJSON();
                                    if (tmpAppointment.patientID == tmpPatient.patientID) {
                                        tmpAppointment.appointmentTime = dateFormat(tmpAppointment.appointmentTime, "yyyy-MM-dd'T'HH:mm:ss.'000Z'");
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

    return apiRouter;
}
