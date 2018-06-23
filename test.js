var Const = require("./Utils/Const");
var db = require("./DataAccess/DBUtils");
var utils = require("./Utils/Utils");
var Moment = require('moment');
var logger = require("./Utils/Logger");
var configUtils = require("./Utils/ConfigUtils");

var test = async function () {
    var dao = require("./DataAccess/BaseDAO");
    var clinicDao = require("./DataAccess/ClinicDAO");
    var appointmentDao = require("./DataAccess/AppointmentDAO");
    var scheduler = require("./Scheduler/Scheduler");

    var acc1 = await clinicDao.getTwilioAccountByID("mksdamdk");
    var acc2 = await clinicDao.getTwilioAccountByPhoneNumber("+19792136847");
    console.log(acc1);
    // console.log(acc2);
    // console.log(configUtils.getDefaultTwilio());
};
test();