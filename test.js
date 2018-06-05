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

    
    new db.License({"licenseID": 1})        
        .fetch({withRelated: ["bills"]})
        .then(function(license){
            console.log(license.toJSON());            
        })
        .catch(function(err){
            console.log(err);
        })
};
test();