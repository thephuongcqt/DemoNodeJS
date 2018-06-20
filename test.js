var Const = require("./Utils/Const");
var db = require("./DataAccess/DBUtils");
var utils = require("./Utils/Utils");
var Moment = require('moment');
var logger = require("./Utils/Logger");

var test = async function () {
    var dao = require("./DataAccess/BaseDAO");
        
    // try {
    //     var user = await dao.findByIDWithRelated(db.User, "username", "thephuong", "clinic");            
    // } catch (error) {
    //     console.log(error);
    // }
    // .then(collection => {
    //     console.log(collection);
    // })
    // .catch(err => {
    //     console.log(err);
    // })
    var patientDao = require("./DataAccess/PatientDAO");
    var json = {"fullName": "New New Nguyễn Thế Phương", "phoneNumber": "+84969345159"};
    patientDao.insertNotExistedPatient(json)
    .then(user => {
        console.log(user);
    })
    .catch(err => {
        console.log(err);
    });
    // patientDao.checkPatientBooked("thephuong", "+84969345159",  "Nguyễn Thế Phương")
    // .then(result => {
    //     console.log(result);
    // })    
};
test();
