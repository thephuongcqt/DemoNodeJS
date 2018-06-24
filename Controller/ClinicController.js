var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var hash = require("../Utils/Bcrypt");
var Moment = require('moment');
var clinicDAO = require("../DataAccess/ClinicDAO");
var baseDAO = require("../DataAccess/BaseDAO");
var firebase = require("../Notification/FirebaseAdmin");

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.get("/getClinicsForStaff", async function (req, res) {
        try {
            var clinics = await baseDAO.findByPropertiesWithRelated(db.User, { role: Const.ROLE_CLINIC, isActive: Const.ACTIVATION }, "clinic");
            for (var i in clinics) {
                var user = clinics[i];
                delete user.password;
                delete user.role;
                delete user.isActive;
                user.address = user.clinic.address;
                user.clinicName = user.clinic.clinicName;
                user.examinationDuration = user.clinic.examinationDuration;
                user.expiredLicense = user.clinic.expiredLicense;
                user.imageURL = user.clinic.imageURL;
                user.greetingURL = user.clinic.greetingURL;
                user.accountSid = user.clinic.accountSid;
                user.authToken = user.clinic.authToken;
                delete user.clinic;
            }
            res.json(utils.responseSuccess(clinics));
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(error.message));
        }
    });

    apiRouter.post("/registerPhoneNumber", async function (req, res) {
        var username = req.body.username;
        var phoneNumber = req.body.phoneNumber;
        var accountSid = req.body.accountSid;
        var authToken = req.body.authToken;

        var userJson = {
            username: username,
            phoneNumber: phoneNumber
        };
        var clinicJson = {
            username: username,
            accountSid: accountSid,
            authToken: authToken,
        };
        try {
            var promises = [baseDAO.update(db.User, userJson, "username"), baseDAO.update(db.Clinic, clinicJson, "username")];
            var result = await Promise.all(promises);
            res.json(utils.responseSuccess("Update Success"));

            //Begin notify to clinic
            var notifyTitle = "Phòng khám đã được cấp số điện thành công";
            var notifyMessage = "Số điện thoại của phòng khám là: " + phoneNumber;
            var topic = username;
            firebase.notifyToClinic(topic, notifyTitle, notifyMessage);
            //End notify to clinic
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(error.message));
        }
    });

    apiRouter.get("/getClinicsWaitingForPhone", async function (req, res) {
        try {
            result = await clinicDAO.getClinicsWaitingForPhoneNumber();
            for (var i in result) {
                var user = result[i];
                user.address = user.clinic.address;
                user.clinicName = user.clinic.clinicName;
                user.expiredLicense = utils.parseDate(user.clinic.expiredLicense);
                user.examinationDuration = user.clinic.examinationDuration;
                user.imageURL = user.clinic.imageURL;
                user.greetingURL = user.clinic.greetingURL;
                delete user.clinic;
                delete user.password;
            }
            res.json(utils.responseSuccess(result));
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(error.message));
        }
    });

    apiRouter.post("/changeInformation", async function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var address = req.body.address;
        var clinicName = req.body.clinicName;
        var examinationDuration = req.body.examinationDuration;
        var email = req.body.email;

        try {
            var user = await baseDAO.findByIDWithRelated(db.User, "username", username, "clinic");
            if (!user || !user.clinic) {
                throw new Error(Const.Error.IncorrectUsernameOrPassword);
            }
            var correctPassword = await hash.comparePassword(password, user.password);
            if (!correctPassword) {
                throw new Error(Const.Error.IncorrectUsernameOrPassword);
            }
            var json = { "username": username };
            if (address || clinicName || examinationDuration) {
                // update clinic table
                if (address) {
                    json.address = address;
                }
                if (clinicName) {
                    json.clinicName = clinicName;
                }
                if (examinationDuration) {
                    json.examinationDuration = examinationDuration;
                }

                await baseDAO.update(db.Clinic, json, "username");
            }

            if (email) {
                // update user table
                var userJson = { "username": username, "email": email };
                await baseDAO.update(db.User, userJson, "username");

                json.email = email;
            }

            json = await getClinicInfo(username);
            res.json(utils.responseSuccess(json));
        } catch (error) {
            logger.log(error);
            if (error.message == Const.Error.IncorrectUsernameOrPassword) {
                res.json(utils.responseFailure(error.message));
            } else {
                res.json(utils.responseFailure(Const.Error.ClinicChangeInformationError));
            }
        }
    });

    apiRouter.post("/changeClinicProfile", async function (req, res) {
        var greetingURL = req.body.greetingURL;
        var username = req.body.username;
        var imageURL = req.body.imageURL;
        var examinationDuration = Moment(req.body.examinationDuration, "h:mm:ss").format("HH:mm:ss");
        var json = { "username": username };
        if (greetingURL) {
            json.greetingURL = greetingURL;
        }
        if (imageURL) {
            json.imageURL = imageURL;
        }
        if (examinationDuration) {
            var checkDuration = Moment(examinationDuration, "HH:mm:ss").isValid();
            if (checkDuration == true) {
                json.examinationDuration = examinationDuration;
            } else {
                json.examinationDuration = undefined;
            }
        }
        try {
            await baseDAO.update(db.Clinic, json, "username");
            res.json(utils.responseSuccess(json));
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(Const.Error.UpdateClinicError));
        }
    });

    apiRouter.get("/getAllClinic", function (req, res) {
        getAllClinic()
            .then(function (results) {
                res.json(utils.responseSuccess(results));
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err);
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
                        logger.log(err);
                    });
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err);
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
        var applyDateList = [0, 1, 2, 3, 4, 5, 6];
        await hash.hashPassword(password)
            .then(async function (newPassword) {
                var allClinics;
                try {
                    allClinics = await clinicDAO.getAllUser();
                    var checkClinic = true;
                    for (var i in allClinics) {
                        var clinic = allClinics[i];
                        if (clinic.username == username || clinic.email == email) {
                            checkClinic = false;
                            break;
                        }
                        else {
                            checkClinic = true;
                        }
                    }
                    if (checkClinic == true) {
                        var register = await clinicDAO.registerClinic(username, newPassword, email, fullName, address, clinicName, applyDateList);
                        delete register.password;
                        delete register.id;
                        res.json(utils.responseSuccess(register));
                    } else {
                        res.json(utils.responseFailure("Tài khoản hoặc email đã tồn tại"));
                    }
                }
                catch (err) {
                    res.json(utils.responseFailure(err));
                    logger.log(err);
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err);
            });
    });

    // // get appointment of clinic
    // apiRouter.get("/appointment", async function (req, res) {
    //     var username = req.query.username;
    //     await new db.Clinic({ "username": username })
    //         .fetch({ withRelated: ["appointments"] })
    //         .then(async function (model) {
    //             if (model != null) {
    //                 var clinic = model.toJSON();
    //                 var listAppointment = [];
    //                 var date = new Date().toDateString();
    //                 for (var i in clinic.appointments) {
    //                     var appointmentList = clinic.appointments[i];
    //                     await new db.Appointment(appointmentList)
    //                         .fetch({ withRelated: ["patient"] })
    //                         .then(function (appointmentList) {
    //                             appointmentList = appointmentList.toJSON();
    //                             var dateAppointment = appointmentList.appointmentTime.toDateString();
    //                             appointmentList.appointmentTime = dateAppointment;
    //                             if (dateAppointment == date) {
    //                                 delete appointmentList.patientID;
    //                                 delete appointmentList.clinicUsername;
    //                                 listAppointment.push(appointmentList);
    //                             }
    //                         })
    //                         .catch(function (err) {
    //                             res.json(utils.responseFailure(err.message));
    //                             logger.log(err.message, "appointment");
    //                         });
    //                 }
    //                 res.json(utils.responseSuccess(listAppointment));
    //             } else {
    //                 res.json(utils.responseFailure("This clinic is not exist"));
    //             }
    //         })
    //         .catch(function (err) {
    //             res.json(utils.responseFailure(err.message));
    //             logger.log(err.message, "appointment");
    //         });
    // });

    // apiRouter.post("/getInformation", function (req, res) {
    //     var username = req.body.username;
    //     new db.User({ "username": username })
    //         .fetch({ withRelated: ["clinic"] })
    //         .then(function (model) {
    //             if (model == null) {
    //                 res.json(utils.responseFailure("Sai tên đăng nhập hoặc mật khẩu"));
    //             } else {
    //                 var clinic = model.toJSON();
    //                 new db.Clinic({ "username": username })
    //                     .fetch({ withRelated: ["workingHours"] })
    //                     .then(function (model) {
    //                         var workingHour = model.toJSON();
    //                         for (var i in workingHour.workingHours) {
    //                             var work = workingHour.workingHours[i];
    //                             delete work.id;
    //                             delete work.clinicUsername;
    //                         }
    //                         if (clinic.role === Const.ROLE_CLINIC) {
    //                             clinic.clinicName = clinic.clinic.clinicName;
    //                             clinic.address = clinic.clinic.address;
    //                             clinic.examinationDuration = clinic.clinic.examinationDuration;
    //                             clinic.expiredLicense = utils.parseDate(clinic.clinic.expiredLicense);
    //                             clinic.workingHours = workingHour.workingHours;
    //                             clinic.currentTime = utils.parseDate(new Date());
    //                             delete clinic.clinic;
    //                             delete clinic.password;
    //                             res.json(utils.responseSuccess(clinic));
    //                         } else {
    //                             res.json(utils.responseFailure("Sai tên đăng nhập hoặc mật khẩu"));
    //                         }
    //                     })
    //                     .catch(function (err) {
    //                         res.json(utils.responseFailure(err.message));
    //                         logger.log(err.message, "getInformation");
    //                     });
    //             }
    //         })
    //         .catch(function (err) {
    //             res.json(utils.responseFailure(err.message));
    //             logger.log(err.message, "getInformation");
    //         });
    // });
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