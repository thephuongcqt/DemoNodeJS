var Const = require("./Utils/Const");
var db = require("./DataAccess/DBUtils");
var utils = require("./Utils/Utils");
var Moment = require('moment');
var logger = require("./Utils/Logger");


var test = function () {        
    var dao = require("./DataAccess/BaseDAO");
    // var json = {patientID: 341, "fullName": "Giàng a Chứng", "phoneNumber": "+18335465473"};
    // dao.update(db.Patient, json, "patientID")
    // .then(models => {
    //     console.log(models);
    // })
    // .catch(err => {
    //     logger.log(err.message);
    // });

    dao.findByID(db.Patient, "patientID", 340)
    .then(models => {
        console.log(models);
    })
    .catch(err => {
        logger.log(err.message);
    });
};
test();
