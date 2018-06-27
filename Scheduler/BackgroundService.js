var schedule = require('node-schedule');
var logger = require("../Utils/Logger");
var appointmentDao = require("../DataAccess/AppointmentDAO");
var baseDao = require("../DataAccess/BaseDAO");
var tokenDao = require("../DataAccess/TokenDAO");
var db = require("../DataAccess/DBUtils");
var twilioUtils = require("../ThirdPartyHotline/TwilioUtils");
var Moment = require("moment");

module.exports = function(){
    var appointmentReminder = schedule.scheduleJob('*/1 * * * *', async function(){
        // task run on every minute to notify appointment to patient
        try {
            var appointments = await appointmentDao.getAppointmentsToRemind(new Date());
            if(appointments && appointments.length > 0){
                for(var i in appointments){
                    var appointment = appointments[i];
                    var patientPhone = appointment.bookedPhone;
                    var user = await baseDao.findByID(db.User, "username", appointment.clinicUsername);
                    var mBookedTime = Moment(appointment.appointmentTime);
                    var message = "Cuộc hẹn của bạn sẽ diễn ra vào lúc " + mBookedTime.format("HH:mm") + " phút ngày " + mBookedTime.format("YYYY-MM-DD") + ". Mong bạn có mặt đúng giờ";
                    if(user && user.phoneNumber){
                        twilioUtils.sendSMS(user.phoneNumber, patientPhone, message);
                    }
                    var json = {
                        appointmentID: appointment.appointmentID,
                        isReminded: 1
                    }
                    baseDao.update(db.Appointment, json, "appointmentID")
                    .then(result => {})
                    .catch(err => {
                        logger.log(err);
                    });
                }
            }
        } catch (error) {
            logger.log(error);
        }
    });

    var removeTokensTask = schedule.scheduleJob({hour: 00, minute: 00}, async function(){
        //task running on everyday midnight to remove expired tokens
        logger.log("removeTokensTask");
        try {
            tokenDao.deleteExpiredTokens()
            .then(result => {})
            .catch(err => {
                logger.log(err);
            })
        } catch (error) {
            logger.log(error);
        }
    });
}