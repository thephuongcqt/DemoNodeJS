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

    try {
        var result = await clinicDao.getClinicsWaitingForPhoneNumber();
        console.log(result);    
    } catch (error) {
        console.log(error);
    }
    
};
test();