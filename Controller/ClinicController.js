var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.post("/changeInformation", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var address = req.body.address;
        var clinicName = req.body.clinicName;
        var examinationDuration = req.body.examinationDuration;
        db.User.where({ "username": username, "password": password })
            .fetch()
            .then(function (collection) {
                var user = collection.toJSON();
                if (collection == null) {                    
                    res.json(utils.responseFailure("Sai tên đăng nhập hoặc mật khẩu"));
                } else {
                    db.Clinic.where({ "username": username })
                        .save({ "address": address, "clinicName": clinicName, "examinationDuration":examinationDuration }, { patch: true })
                        .then(function (model) {                            
                            res.json(utils.responseSuccess(model.toJSON()));
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
            });
    });

    apiRouter.get("/getAllClinic", function (req, res) {
        db.User.forge()
            .where("role", Const.ROLE_CLINIC)
            .fetchAll()
            .then(function (collection) {
                var userList = collection.toJSON();
                var usernames = [];
                for (var i in userList) {
                    usernames.push(userList[i].username);
                }
                db.Clinic.forge()
                    .where("username", "in", usernames)
                    .fetchAll()
                    .then(function (result) {
                        var clinics = result.toJSON();
                        var clinicList = []
                        for (var i in clinics) {
                            var clinic = clinics[i];
                            for (var j in userList) {
                                var user = userList[j];
                                if (clinic.username == user.username) {
                                    user.address = clinic.address;
                                    user.clinicName = clinic.clinicName;
                                    user.password = "";
                                    clinicList.push(user);
                                }
                            }
                        }                        
                        res.json(utils.responseSuccess(clinicList));
                    })
                    .catch(function (err) {
                        res.json(utils.responseFailure(err.message));
                    })

            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
            });
    });

    apiRouter.post("/Login", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;

        new db.User({ "username": username, "password": password })
            .fetch({ withRelated: ["clinic"] })
            .then(function (model) {
                if (model == null) {
                    res.json(utils.responseFailure("Sai tên đăng nhập hoặc mật khẩu"));
                } else {
                    var clinic = model.toJSON();
                    if (clinic.role === Const.ROLE_CLINIC) {
                        clinic.clinicName = clinic.clinic.clinicName;
                        clinic.address = clinic.clinic.address;
                        clinic.examinationDuration = clinic.clinic.examinationDuration;
                        clinic.expiredLicense = clinic.clinic.expiredLicense;
                        delete clinic.clinic;
                        delete clinic.password;                                                
                        res.json(utils.responseSuccess(clinic));
                    } else {
                        res.json(utils.responseFailure("Sai tên đăng nhập hoặc mật khẩu"));
                    }
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
            });
    });
    
    // register
    apiRouter.post("/register", async function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var clinicName = req.body.clinicName;
        var address = req.body.address;
        var expiredLicense = req.body.expiredLicense;
        await new db.User({ "username": username })
            .fetch({ withRelated: ["clinic"] })
            .then(async function (model) {
                if (model == null) {
                    await new db.User().save({ "username": username, "password": password, "phoneNumber": null, "role": 1, "isActive": 0 })
                        .then(async function (model) {
                            await new db.Clinic().save({ "username": model.attributes.username, "address": address, "clinicName": clinicName, "examinationDuration": 3000, "expiredLicense": null })
                                .then(function (model) {                                    
                                    res.json(utils.responseSuccess("Register Success"));
                                })
                                .catch(function (err) {
                                    res.json(utils.responseFailure(err.message));
                                });
                        })
                } else {                    
                    res.json(utils.responseFailure("Username have exist"));
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
            });
    });
    

    // get appointment of clinic
    apiRouter.get("/appointment", async function (req, res) {
        var username = req.query.username;
        await new db.Clinic({ "username": username })
            .fetch({ withRelated: ["appointments"] })
            .then(async function (model) {
                if (model != null) {
                    var clinic = model.toJSON();
                    var listAppointment = [];
                    var date = new Date().toDateString();
                    for (var i in clinic.appointments) {
                        var appointmentList = clinic.appointments[i];
                        await new db.Appointment(appointmentList)
                            .fetch({ withRelated: ["patient"] })
                            .then(function (appointmentList) {
                                appointmentList = appointmentList.toJSON();
                                var dateAppointment = appointmentList.appointmentTime.toDateString();
                                appointmentList.appointmentTime = dateAppointment;
                                if (dateAppointment == date) {
                                    delete appointmentList.patientID;
                                    delete appointmentList.clinicUsername;
                                    listAppointment.push(appointmentList);
                                }
                            })
                            .catch(function (err) {                                
                                res.json(utils.responseFailure(err.message));
                            });
                    }                    
                    res.json(utils.responseSuccess(listAppointment));
                } else {
                    res.json(utils.responseFailure("This clinic is not exist"));
                }
            })
            .catch(function (err) {                
                res.json(utils.responseFailure(err.message));                
            });
    });
    return apiRouter;
}
