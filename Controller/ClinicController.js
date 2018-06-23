var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var Moment = require("moment");
var hash = require("../Utils/Bcrypt");
var clinicDAO = require("../DataAccess/ClinicDAO");

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
        getAllClinic()
            .then(function (results) {
                res.json(utils.responseSuccess(results));
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err, "getAllClinic", "ClinicController");
            });
    });

    apiRouter.post("/Login", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        getClinicInfo(username)
            .then(function (results) {
                hash.comparePassword(password, results.password)
                    .then(function (result) {
                        if (result == true) {
                            if (results.isActive == Const.ACTIVATION && results.role == Const.ROLE_CLINIC) {
                                delete results.password;
                                delete results.role;
                                delete results.isActive;
                                res.json(utils.responseSuccess(results));
                            } else {
                                res.json(utils.responseFailure("Tài khoản không tồn tại"));
                            }
                        } else {
                            res.json(utils.responseFailure("Mật khẩu không đúng"));
                        }
                    })
                    .catch(function (err) {
                        res.json(utils.responseFailure(err));
                        logger.log(err, "login", "ClinicController");
                    });
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err, "Login", "ClinicController");
            });
    });

    // register
    apiRouter.post("/register", async function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var clinicName = req.body.clinicName;
        var address = req.body.address;
        var email = req.body.email;
        var fullName = req.body.fullName;
        await hash.hashPassword(password)
            .then(async function (newPassword) {
                var allClinics;
                try {
                    allClinics = await getAllClinic();
                    var checkClinic = true;
                    for (var i in allClinics) {
                        var clinic = allClinics[i];
                        if (clinic.username == username && clinic.email == email) {
                            checkClinic = false;
                            break;
                        }
                        else {
                            checkClinic = true;
                        }
                    }
                    if (checkClinic == true) {
                        var register = await clinicDAO.registerClinic(username, newPassword, email, fullName, address, clinicName);
                        delete register.password;
                        delete register.id;
                        res.json(utils.responseSuccess(register));
                    } else {
                        res.json(utils.responseFailure("Không thể tạo tài khoản này"));
                    }
                }
                catch (err) {
                    res.json(utils.responseFailure(err));
                    logger.log(err, "register", "ClinicController");
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err, "register", "ClinicController");
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
                        .save({ "password": password, "fullName": fullName, "phoneNumber": phoneNumber, "role": role, "isActive": isActive, "email": email }, { patch: true })
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
        new db.User({ "username": username })
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
                            for (var i in workingHour.workingHours) {
                                var work = workingHour.workingHours[i];
                                delete work.id;
                                delete work.clinicUsername;
                            }
                            if (clinic.role === Const.ROLE_CLINIC) {
                                clinic.clinicName = clinic.clinic.clinicName;
                                clinic.address = clinic.clinic.address;
                                clinic.examinationDuration = clinic.clinic.examinationDuration;
                                clinic.expiredLicense = utils.parseDate(clinic.clinic.expiredLicense);
                                clinic.workingHours = workingHour.workingHours;
                                clinic.currentTime = utils.parseDate(new Date());
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
function getAllClinic() {
    return new Promise((resolve, reject) => {
        clinicDAO.getAllClinic()
            .then(function (results) {
                var userList = [];
                for (var i in results) {
                    var user = results[i];
                    delete user.password;
                    delete user.role;
                    delete user.isActive;
                    user.address = user.clinic.address;
                    user.clinicName = user.clinic.clinicName;
                    user.examinationDuration = user.clinic.examinationDuration;
                    user.expiredLicense = user.clinic.expiredLicense;
                    user.imageURL = user.clinic.imageURL;
                    user.greetingURL = user.clinic.greetingURL;
                    delete user.clinic;
                    userList.push(user);
                }
                resolve(userList);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
function getClinicInfo(username) {
    return new Promise((resolve, reject) => {
        clinicDAO.getClinicInfo(username)
            .then(function (results) {
                results.address = results.clinic.address;
                results.clinicName = results.clinic.clinicName;
                results.examinationDuration = results.clinic.examinationDuration;
                results.expiredLicense = utils.parseDate(results.clinic.expiredLicense);
                results.currentTime = utils.parseDate(new Date());
                results.imageURL = results.clinic.imageURL;
                results.greetingURL = results.clinic.greetingURL;
                delete results.clinic;
                var workingHourList = [];
                for (var i in results.workingHours) {
                    var workingHour = results.workingHours[i];
                    delete workingHour.id;
                    delete workingHour.clinicUsername;
                    workingHourList.push(workingHour);
                }
                workingHourList.sort(function (a, b) {
                    return a.applyDate - b.applyDate;
                });
                results.workingHours = workingHourList;
                resolve(results);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}