var Const = require("./Utils/Const");
var db = require("./DataAccess/DBUtils");
var utils = require("./Utils/Utils");
var Moment = require('moment');
var logger = require("./Utils/Logger");

var test = async function () {
    var dao = require("./DataAccess/BaseDAO");
    var clinicDao = require("./DataAccess/ClinicDAO");
    var appointmentDao = require("./DataAccess/AppointmentDAO");
    var scheduler = require("./Scheduler/Scheduler");    
    var result = await dao.findAll(db.User);
    console.log(result);
    // try {        
    //     var clinic = await dao.findByIDWithRelated(db.User, "username", "hoanghoa", "clinic");
    //     var result = await scheduler.getExpectationAppointment(clinic.clinic);
    // } catch (error) {
    //     logger.log(error);
    //     return null;
    // }    
};
test();
