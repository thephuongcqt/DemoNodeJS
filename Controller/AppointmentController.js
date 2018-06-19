var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
const dateFormat = require('dateformat');
var Moment = require('moment');
var logger = require("../Utils/Logger");

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.get("/getAppointmentsListByDate", function (req, res) {
        var clinicUsername = req.query.clinicUsername;
        var searchDate = req.query.date;

        var startDate, endDate;    
        if(searchDate == null){            
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
            logger.log(err.message, "getAppointmentsListByDate");
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
