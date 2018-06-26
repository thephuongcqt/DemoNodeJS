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
        
    // try {
    //     var result = await dao.findByPropertiesWithManyRelated(db.Clinic, {"username": "hoanghoa"}, ["user", "workingHours"]);
    //     console.log(result[0]);
        
    // } catch (error) {
    //     console.log(error);
    // }
    // console.log(Moment(new Date()).format("YYYY-MM-DDTHH:mm:ss.000Z"));
    //  await clinicDao.getTwilioAccountByID("AC0182c9b950c8fe1229f93aeb40900a5d");
    // var acc2 = await clinicDao.getTwilioAccountByPhoneNumber("+19792136847");
    // console.log(acc1);
    // console.log(acc2);
    // console.log(configUtils.getDefaultTwilio());
    // console.log(configUtils.getDefaultGreetingURL());
};
test();