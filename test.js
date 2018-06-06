var Const = require("./Utils/Const");
var db = require("./Utils/DBUtils");
var utils = require("./Utils/Utils");

var test = function(){
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

    db.Appointment.query((q) =>{
        q.where("clinicUsername", "=", clinicUsername),
        q.where("appointmentTime", "<=", "CURRENT_DATE()") 
    }).fetch({withRelated: ["patient"]})
    .then(function(model){
        console.log(model);        
    })
};
test();