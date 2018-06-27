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

    // var startDate = new Date("2018-06-25");
    // var endDate = new Date();
    // var sql = "SELECT * FROM tbl_appointment WHERE remindTime BETWEEN ? AND ? "
    //     + " AND clinicUsername = ?"
    //     + " AND isReminded = ?";
    // db.knex.raw(sql, [startDate, endDate, "hoanghoa", 0])
    // .then(collection => {
    //     var result = collection[0];
    //     if(result && result.length > 0){
    //         var model = JSON.parse(JSON.stringify(result));
    //         console.log(model);
    //     }        
    // })
    // .catch(error => {
    //     console.log(error);
    // })



    try {
        var appointments = await appointmentDao.getAppointmentsToRemind(new Date("2018-06-26 20:00:00"), "hoanghoa");
        console.log(appointments);
        var clinic = await dao.findByIDWithRelated(db.Clinic, "username", "hoanghoa", "user");
        console.log(clinic);
        // var startDate = new Date("2018-06-26");
        // var endDate = new Date("2018-06-26 20:00:00")
        // var json = { "clinicUsername": "hoanghoa", "isReminded": 0 }
        // var related = { withRelated: ["clinic", "patient"] };
        // db.Appointment.where(json)
        //     .query(function (appointment) {
        //         appointment.whereBetween('remindTime', [startDate, endDate]);
        //     })
        //     .fetchAll(related)
        //     .then(model => {
        //         console.log(model.toJSON());
        //     })
        //     .catch(err => {
        //         console.log(err);
        //     });
    } catch (error) {
        console.log(error);
    }
};
test();