var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
const dateFormat = require('dateformat');
var Moment = require('moment');
var logger = require("../Utils/Logger");
var appointmentDao = require("../DataAccess/AppointmentDAO");

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.get("/getAppointmentsListByDate", async function (req, res) {
        var clinicUsername = req.query.clinicUsername;
        var searchDate = req.query.date;
        var json = { "clinicUsername": clinicUsername };

        try {
            var appointments;
            if (searchDate) {
                appointments = await appointmentDao.getAppointmentsForSpecifyDayWithRelated(json, searchDate, "patient");
            } else{
                appointments = await appointmentDao.getAppointmentsInCurrentDayWithRelated(json, "patient");
            }
            for (var i in appointments) {
                var appointment = appointments[i];
                delete appointment.clinicUsername;
                delete appointment.patientID;
                appointment.currentTime = utils.parseDate(new Date());
                appointment.appointmentTime = utils.parseDate(appointment.appointmentTime);
            }
            res.json(utils.responseSuccess(appointments));
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(Const.GetAppointmentListFailure));
        }
    });
    return apiRouter;
};