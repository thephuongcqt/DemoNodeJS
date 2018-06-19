var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");

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
                        .save({ "address": address, "clinicName": clinicName, "examinationDuration": examinationDuration }, { patch: true })
                        .then(function (model) {
                            res.json(utils.responseSuccess(model.toJSON()));
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                            logger.log(err.message, "changeInformation");
                        });                        
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "changeInformation");
            });
    });

    apiRouter.get("/getAllClinic", function (req, res) {
        db.User.where({ "role": Const.ROLE_CLINIC, "isActive": Const.ACTIVATION })
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
                        logger.log(err.message, "getAllClinic");
                    })

            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "getAllClinic");
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
                    new db.Clinic({ "username": username })
                        .fetch({ withRelated: ["workingHours"] })
                        .then(function (model) {
                            var workingHour = model.toJSON();
                            for(var i in workingHour.workingHours){
                                var work = workingHour.workingHours[i];
                                delete work.id;
                                delete work.clinicUsername;
                            }
                            if (clinic.role === Const.ROLE_CLINIC) {
                                clinic.clinicName = clinic.clinic.clinicName;
                                clinic.address = clinic.clinic.address;
                                clinic.examinationDuration = clinic.clinic.examinationDuration;
                                clinic.expiredLicense = clinic.clinic.expiredLicense;
                                clinic.workingHours = workingHour.workingHours;
                                delete clinic.clinic;
                                delete clinic.password;
                                clinic.workingHours.sort(function (a, b) {
                                    return a.applyDate - b.applyDate;
                                });
                                res.json(utils.responseSuccess(clinic));
                            } else {
                                res.json(utils.responseFailure("Sai tên đăng nhập hoặc mật khẩu"));
                            }
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                            logger.log(err.message, "Login");
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "Login");
            });
    });

    // register
    apiRouter.post("/register", async function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var clinicName = req.body.clinicName;
        var address = req.body.address;
        var email = req.body.email;
        await new db.User({ "username": username })
            .fetch({ withRelated: ["clinic"] })
            .then(async function (model) {
                if (model == null) {
                    await new db.Clinic({ "username": username })
                        .fetch({ withRelated: ["workingHours"] })
                        .then(async function (model) {
                            await new db.User().save({ "username": username, "password": password, "phoneNumber": null, "role": 1, "isActive": 0, "email":email })
                                .then(async function (model) {
                                    await new db.Clinic().save({ "username": model.attributes.username, "address": address, "clinicName": clinicName, "examinationDuration": "00:30:00", "expiredLicense": null })
                                        .then(async function (model) {
                                            var applyDateList = [0, 1, 2, 3, 4, 5, 6];
                                            for (var i in applyDateList) {
                                                var applyDate = applyDateList[i];
                                                await new db.WorkingHours().save({ "clinicUsername": model.attributes.username, "startWorking": "06:30:00", "endWorking": "17:00:00", "applyDate": applyDate, "isDayOff": 0 })
                                            }
                                            res.json(utils.responseSuccess("Register Success"));
                                        })
                                        .catch(function (err) {
                                            res.json(utils.responseFailure(err.message));
                                            logger.log(err.message, "Register");
                                        });
                                })
                                .catch(function (err) {
                                    res.json(utils.responseFailure(err.message));
                                    logger.log(err.message, "Register");
                                });
                        })
                        .catch(function (err) {
                            logger.log(err.message, "Register");
                        });
                } else {
                    res.json(utils.responseFailure("Username have exist"));
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "Register");
            });
    });
    // update information clinic
    apiRouter.post("/update", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var fullName = req.body.fullName;
        var address = req.body.address;
        var clinicName = req.body.clinicName;
        var phoneNumber = req.body.phoneNumber;
        var role = req.body.role;
        var isActive = req.body.isActive;
        var email = req.body.email;
        db.User.where({ "username": username })
            .fetch()
            .then(function (collection) {
                var user = collection.toJSON();
                if (collection == null) {
                    res.json(utils.responseFailure("Username is not exist"));
                } else {
                    db.User.where({ "username": username })
                        .save({ "password": password, "fullName": fullName, "phoneNumber": phoneNumber, "role": role, "isActive": isActive, "email":email }, { patch: true })
                        .then(function (model) {
                            db.Clinic.where({ "username": username })
                                .fetch()
                                .then(function (collection) {
                                    var user = collection.toJSON();
                                    if (collection == null) {
                                        res.json(utils.responseFailure("Username is not exist"));
                                    } else {
                                        db.Clinic.where({ "username": username })
                                            .save({ "address": address, "clinicName": clinicName }, { patch: true })
                                            .then(function (model) {
                                                res.json(utils.responseSuccess("Update Clinic successfull"));
                                            })
                                            .catch(function (err) {
                                                res.json(utils.responseFailure(err.message));
                                                logger.log(err.message, "update");
                                            });
                                    }
                                })
                                .catch(function (err) {
                                    res.json(utils.responseFailure(err.message));
                                    logger.log(err.message, "update");
                                });
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                            logger.log(err.message, "update");
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "update");
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
                                logger.log(err.message, "appointment");
                            });
                    }
                    res.json(utils.responseSuccess(listAppointment));
                } else {
                    res.json(utils.responseFailure("This clinic is not exist"));
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "appointment");
            });
    });

    apiRouter.post("/getInformation", function (req, res) {
        var username = req.body.username;        
        new db.User({ "username": username})
            .fetch({ withRelated: ["clinic"] })
            .then(function (model) {
                if (model == null) {
                    res.json(utils.responseFailure("Sai tên đăng nhập hoặc mật khẩu"));
                } else {
                    var clinic = model.toJSON();
                    new db.Clinic({ "username": username })
                        .fetch({ withRelated: ["workingHours"] })
                        .then(function (model) {
                            var workingHour = model.toJSON();
                            for(var i in workingHour.workingHours){
                                var work = workingHour.workingHours[i];
                                delete work.id;
                                delete work.clinicUsername;
                            }
                            if (clinic.role === Const.ROLE_CLINIC) {
                                clinic.clinicName = clinic.clinic.clinicName;
                                clinic.address = clinic.clinic.address;
                                clinic.examinationDuration = clinic.clinic.examinationDuration;
                                clinic.expiredLicense = clinic.clinic.expiredLicense;
                                clinic.workingHours = workingHour.workingHours;
                                delete clinic.clinic;
                                delete clinic.password;
                                res.json(utils.responseSuccess(clinic));
                            } else {
                                res.json(utils.responseFailure("Sai tên đăng nhập hoặc mật khẩu"));
                            }
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                            logger.log(err.message, "getInformation");
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "getInformation");
            });
    });
    return apiRouter;
}
