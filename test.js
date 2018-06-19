var Const = require("./Utils/Const");
var db = require("./DataAccess/DBUtils");
var utils = require("./Utils/Utils");
var Moment = require('moment');
var logger = require("./Utils/Logger");

var test = async function () {
    var dao = require("./DataAccess/BaseDAO");
    var patientDao = require("./DataAccess/PatientDAO");
    patientDao.checkPatientBooked("thephuong", "+84969345159",  "Nguyễn Thế Phương")
    .then(result => {
        console.log(result);
    })    
};
test();
