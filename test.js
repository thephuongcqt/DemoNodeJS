var Const = require("./Utils/Const");
var db = require("./Utils/DBUtils");
var utils = require("./Utils/Utils");
var Moment = require('moment');

var Excel = require("exceljs");

var test = function () {
    // new db.License({"licenseID": 1})
    //     .fetch()
    //     .then(function(model){
    //         console.log(model);
    //         return model.bills().create({
    //             "clinicUsername": "phuong ne"
    //         });
    //     })
    //     .then(function(bill){
    //         console.log(bill);
    //     })
    //     .catch(function(err){
    //         console.log(err);
    //     }); 

    // new db.User({"username": "phuongnt"})
    // .fetch({withRelated: ["clinic"]})
    // .then(function(model){
    //     console.log(model.toJSON());
    // })
    // .catch(function(err){
    //     console.log(err);
    // });

    // new db.User({"username": "hoanghoa"})
    //     .related("clinic")
    //     .fetch()
    //     .then(function(model){
    //         console.log(model.toJSON());
    //     })
    //     .catch(function(err){
    //         console.log(err);
    //     })    

    // new db.License({"licenseID": 1})
    //     .fetchAll({withRelated: ["bills"]})
    //     .then(function(model){
    //         console.log(model.toJSON());
    //     })       


    // new db.License({"licenseID": 1})        
    //     .fetch({withRelated: ["bills"]})
    //     .then(function(license){
    //         console.log(license.toJSON());            
    //     })
    //     .catch(function(err){
    //         console.log(err);
    //     })

    // new db.Clinic({"username": "hoanghoa"})
    //     .related("workingHours")
    //     .fetch()
    //     .then(function(model){
    //         console.log(model.toJSON());
    //     })
    //     .catch(function(err){
    //         console.log(err);
    //     })


    // new db.Clinic({"username": "hoanghoa"})        
    //     .fetch({withRelated: ["workingHours"]})
    //     .then(function(model){
    //         console.log(model.toJSON());
    //     })
    //     .catch(function(err){
    //         console.log(err);
    //     })

    // new db.Clinic({"username": "hoanghoa"})        
    //     .fetch({withRelated: ["appointments"]})
    //     .then(function(model){
    //         var clinic = model.toJSON();  
    //         console.log(clinic);                      
    //         // for(var i in clinic.appointments){
    //         //     var appointment = clinic.appointments[i];                
    //         //     new db.Appointment(appointment)
    //         //     .fetch({withRelated: ["patient"]})
    //         //     .then(function(appointment){
    //         //         console.log(appointment.toJSON());
    //         //     })
    //         //     .catch(function(err){
    //         //         console.log(err);
    //         //     })
    //         // }
    //     })
    //     .catch(function(err){
    //         console.log(err);
    //     })

    // new db.User({"username": "thuanpt", "password": "123456"})
    // .fetch({withRelated: ["clinic"]})
    // .then(function(model){
    //     console.log(model.toJSON());
    // })
    // .catch(function(err){
    //     console.log(err);
    // });
    var clinicUsername = "hoanghoa";
    // var sql = "SELECT * FROM tbl_appointment WHERE clinicUsername = ? AND DATE(appointmentTime) = CURRENT_DATE()";
    //     db.knex.raw(sql, 'hoanghoa')
    //         .then(function (collection) {
    //             console.log(collection[0]);
    //         })
    //         .catch(function (err) {
    //             console.log(err);
    //         });

    // db.Appointment.query((q) =>{
    //     q.where("clinicUsername", "=", clinicUsername),
    //     q.where("appointmentTime", "<=", "CURRENT_DATE()") 
    // }).fetch({withRelated: ["patient"]})
    // .then(function(model){
    //     console.log(model);        
    // })


    // new db.WorkingHours({"clinicUsername": clinicUsername, "applyDate": Const.Day.Mon})
    // .fetch({withRelated: ["clinic"]})
    // .then(function(model){
    //     var configWorking = model.toJSON();
    //     console.log(configWorking);
    //     // var startWorking = configWorking.startWorking;
    //     // var endWorking = configWorking.endWorking;

    //     // console.log(startWorking + " | " + endWorking);
    // })
    // .catch(function(err){
    //     console.log(err.message);
    // })


    // new db.WorkingHours({ "clinicUsername": clinicUsername, "applyDate": Const.Day.Mon })
    //     .fetch({ withRelated: ["clinic"] })
    //     .then(function (model) {
    //         var configClinic = model.toJSON();
    //         var sql = "clinicUsername = ? AND DATE(appointmentTime) = CURRENT_DATE()";
    //         db.knex("tbl_appointment")
    //             .whereRaw(sql, [clinicUsername])
    //             .count("* as count")
    //             .then(function (collection) {
    //                 var bookedAppointment = collection[0].count;

    //                 var mStart = Moment(configClinic.startWorking, "HH:mm:ss");
    //                 // var mEnd = Moment(configClinic.endWorking, "HH:mm:ss");
    //                 // var mDuration = Moment(configClinic.clinic.examinationDuration, "HH:mm:ss");

    //                 // var miliseconds = getTotalDuration(bookedAppointment + 1, mDuration);

    //                 // var mExpectation = Moment(configClinic.startWorking, "HH:mm:ss");
    //                 // mExpectation.add(miliseconds, "milliseconds");

    //                 // if (mExpectation <= mEnd) {
    //                 //     console.log(mExpectation);
    //                 // }
    //                 var result = getExpectationTime(configClinic.startWorking, configClinic.endWorking, bookedAppointment, configClinic.clinic.examinationDuration);
    //                 console.log(mStart.toDate());
    //                 console.log(result);
    //             })
    //             .catch(function (err) {
    //                 console.log(err.message);
    //             })
    //     })
    //     .catch(function (err) {
    //         console.log(err.message);
    //     });

    // var workbook = new Excel.Workbook();

    // workbook.creator = 'PhuongNT';
    // workbook.lastModifiedBy = 'SomeOne';
    // workbook.created = new Date(1985, 8, 30);
    // workbook.modified = new Date();
    // workbook.lastPrinted = new Date(2016, 9, 27);
    // // Set workbook dates to 1904 date system
    // workbook.properties.date1904 = true;

    // var worksheet = workbook.addWorksheet('Lịch khám Bệnh');
    // //Begin Column
    // worksheet.columns = [
    //     { header: 'STT', key: 'id', width: 10 },
    //     { header: 'Tên Bệnh Nhân', key: 'name', width: 50 },
    //     { header: 'Số điện thoại', key: 'phoneNumber', width: 15 },
    //     { header: 'Giờ đặt khám', key: 'time', width: 15 }
    // ];

    // // Access an individual columns by key, letter and 1-based column number
    // var idCol = worksheet.getColumn('id');
    // var nameCol = worksheet.getColumn('name');
    // var phoneCol = worksheet.getColumn('phoneNumber');
    // var timeCol = worksheet.getColumn('time');

    // var rowObj = { id: "001", name: "Nguyễn Thế Phương", phoneNumber: "0961924132", time: new Date() };

    // insertData(worksheet, workbook);

    //create file

    // console.log(utils.checkNumberInArray("   +18326735555   ", Const.randomPhones));
    // console.log(utils.getFakePhoneNumber(Const.randomNumbers, Const.randomNumbers));


    // db.Patient.forge({phoneNumber: "969345159"})
    // .fetch()
    // .then(function(model){
    //     console.log(model.toJSON());
    // })    

    var fs = require('fs');
    var obj = JSON.parse(fs.readFileSync('./AppConfig/config.txt', 'utf8'));
    console.log(obj);
};
test();
