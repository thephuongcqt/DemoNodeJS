var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var hash = require("../Utils/Bcrypt");
var Moment = require('moment');
var clinicDAO = require("../DataAccess/ClinicDAO");
var baseDAO = require("../DataAccess/BaseDAO");
var firebase = require("../Notification/FirebaseAdmin");
var authenUtils = require("../Utils/AuthenUtils");
var appointmentDAO = require("../DataAccess/AppointmentDAO");

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.post("/getBookingHistory", async function (req, res) {
        try {
            var username = req.body.username;
            var list = await appointmentDAO.getHistory(username);
            res.json(utils.responseSuccess(list));
        } catch (error) {
            logger.log(error);
            logger.failLog("subscribeTopic", error);
            res.json(utils.responseFailure(error.message));
        }
    });

    apiRouter.get("/testNotify", async function (req, res) {
        try {
            var username = req.query.username;
            var message = req.query.message;
            firebase.testNotify(username, message);
            res.json(utils.responseSuccess(username + " | " + message));
            logger.successLog("testNotify");
        } catch (error) {
            logger.log(error);
            logger.failLog("testNotify", error);
            res.json(utils.responseFailure(error.message));
        }
    });

    apiRouter.post("/subscribeTopic", async function (req, res) {
        try {
            var token = req.body.token;
            var topic = req.body.topic;
            firebase.subscribeTopic(token, topic);
            res.json(utils.responseSuccess("success"));
            logger.successLog("subscribeTopic");
        } catch (error) {
            logger.log(error);
            logger.failLog("subscribeTopic", error);
            res.json(utils.responseFailure(error.message));
        }
    });

    apiRouter.post("/unsubscribeTopic", async function (req, res) {
        try {
            var token = req.body.token;
            var topic = req.body.topic;
            firebase.unsubscribeTopic(token, topic);
            res.json(utils.responseSuccess("success"));
            logger.successLog("unsubscribeTopic");
        } catch (error) {
            logger.log(error);
            logger.failLog("unsubscribeTopic", error);
            res.json(utils.responseFailure(error.message));
        }
    });

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
                user.delayDuration = user.clinic.delayDuration;
                delete user.clinic;
            }
            res.json(utils.responseSuccess(clinics));
            logger.successLog("getClinicsForStaff");
        } catch (error) {
            logger.log(error);
            logger.failLog("getClinicsForStaff", error);
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
        var delayDuration = req.body.delayDuration;
        try {
            var user = await baseDAO.findByIDWithRelated(db.User, "username", username, "clinic");
            if (!user || !user.clinic) {
                logger.failLog("changeInformation", new Error(Const.Error.IncorrectUsernameOrPassword));
                throw new Error(Const.Error.IncorrectUsernameOrPassword);
            }
            var correctPassword = await hash.comparePassword(password, user.password);
            if (!correctPassword) {
                logger.failLog("changeInformation", new Error(Const.Error.IncorrectUsernameOrPassword));
                throw new Error(Const.Error.IncorrectUsernameOrPassword);
            }
            var json = { "username": username };
            if (address || clinicName || examinationDuration || delayDuration) {
                // update clinic table
                if (address) {
                    json.address = address;
                }
                if (clinicName) {
                    json.clinicName = clinicName;
                }
                if (examinationDuration) {
                    examinationDuration = utils.parseTime(examinationDuration);
                    if (examinationDuration == "00:00:00") {
                        res.json(utils.responseFailure("Thời lượng khám không chính xác"));
                        logger.failLog("changeInformation", new Error("Duration is not correct"));
                        return;
                    }
                    var checkDuration = utils.getMomentTime(examinationDuration).isValid();
                    if (checkDuration == true) {
                        json.examinationDuration = examinationDuration;
                    } else {
                        json.examinationDuration = undefined;
                    }
                }
                if (delayDuration) {
                    delayDuration = utils.parseTime(delayDuration);
                    if (delayDuration == "00:00:00") {
                        res.json(utils.responseFailure("Thời gian trễ không chính xác"));
                        logger.failLog("changeInformation", new Error("Delay duration is not correct"));
                        return;
                    }
                    var checkDelay = utils.getMomentTime(delayDuration).isValid();
                    if (checkDelay == true) {
                        json.delayDuration = delayDuration;
                    } else {
                        json.delayDuration = undefined;
                    }
                }
                await baseDAO.update(db.Clinic, json, "username");
            }

            if (email) {
                // update user table
                var userJson = { "username": username, "email": email };
                await baseDAO.update(db.User, userJson, "username");

                json.email = email;
            }

            json = await clinicDAO.getClinicResponse(username);
            res.json(utils.responseSuccess(json));
            logger.successLog("changeInformation");
        } catch (error) {
            logger.log(error);
            if (error.message == Const.Error.IncorrectUsernameOrPassword) {
                logger.failLog("changeInformation", new Error(Const.Error.IncorrectUsernameOrPassword));
                res.json(utils.responseFailure(error.message));
            } else {
                logger.failLog("changeInformation", new Error(Const.Error.ClinicChangeInformationError));
                res.json(utils.responseFailure(Const.Error.ClinicChangeInformationError));
            }
        }
    });

    apiRouter.post("/changeClinicProfile", async function (req, res) {
        var greetingURL = req.body.greetingURL;
        var username = req.body.username;
        var imageURL = req.body.imageURL;
        var dur = req.body.examinationDuration;
        var examinationDuration = req.body.examinationDuration;
        var delayDuration = req.body.delayDuration;
        var json = { "username": username };
        if (greetingURL) {
            json.greetingURL = greetingURL;
        }
        if (imageURL) {
            json.imageURL = imageURL;
        }
        if (examinationDuration) {
            examinationDuration = utils.parseTime(examinationDuration);
            if (examinationDuration == "00:00:00") {
                res.json(utils.responseFailure("Thời lượng khám không chính xác"));
                logger.failLog("changeClinicProfile", new Error("Duration is not correct"));
                return;
            }
            var checkDuration = utils.getMomentTime(examinationDuration).isValid();
            if (checkDuration == true) {
                json.examinationDuration = examinationDuration;
            } else {
                json.examinationDuration = undefined;
            }
        }
        if (delayDuration) {
            delayDuration = utils.parseTime(delayDuration);
            if (delayDuration == "00:00:00") {
                res.json(utils.responseFailure("Thời gian trễ không chính xác"));
                logger.failLog("changeClinicProfile", new Error("Delay duration is not correct"));
                return;
            }
            var checkDelay = utils.getMomentTime(delayDuration).isValid();
            if (checkDelay == true) {
                json.delayDuration = delayDuration;
            } else {
                json.delayDuration = undefined;
            }
        }
        try {
            await baseDAO.update(db.Clinic, json, "username");
            res.json(utils.responseSuccess(json));
            logger.successLog("changeClinicProfile");
        } catch (error) {
            logger.log(error);
            logger.failLog("changeClinicProfile", error);
            res.json(utils.responseFailure(Const.Error.UpdateClinicError));
        }
    });

    apiRouter.get("/getAllClinic", function (req, res) {
        getAllClinic()
            .then(function (results) {
                res.json(utils.responseSuccess(results));
                logger.successLog("getAllClinic");
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.failLog("getAllClinic", err);
                logger.log(err);
            });
    });

    apiRouter.post("/Login", async function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        try {
            var json = {
                "username": username,
                "role": Const.ROLE_CLINIC
            }
            var users = await baseDAO.findByPropertiesWithRelated(db.User, json, "clinic");
            if (users && users.length > 0) {
                var user = users[0];
                if (user) {
                    var isCorrectPassword = await hash.comparePassword(password, user.password);
                    if (isCorrectPassword) {
                        var result = await clinicDAO.getClinicResponse(username);
                        res.json(utils.responseSuccess(result));
                        logger.successLog("Login: " + username);
                        return;
                    }
                }
            }
            logger.failLog("Login", new Error("Wrong account"));
            res.json(utils.responseFailure("Sai tên đăng nhập hoặc mật khẩu"));
        } catch (error) {
            logger.log(error);
            logger.failLog("Login", new Error("An error occur"));
            res.json(utils.responseFailure("Đã xảy ra lỗi khi đăng nhập, vui lòng thử lại sau"));
        }
    });

    // register
    apiRouter.post("/register", async function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var clinicName = req.body.clinicName;
        var address = req.body.address;
        var email = req.body.email;
        var phoneNumber = req.body.phoneNumber;
        try {
            if (username == null || password == null || clinicName == null || address == null || email == null || phoneNumber == null) {
                logger.failLog("register", new Error(Const.Error.ClinicRegisterMissingFields));
                throw new Error(Const.Error.ClinicRegisterMissingFields);
            }
            clinicName = utils.getClinicName(clinicName);
            if (await clinicDAO.checkExistedClinic(username, email, phoneNumber)) {
                logger.failLog("register", new Error(Const.Error.ClinicRegisterExistedClinic));
                throw new Error(Const.Error.ClinicRegisterExistedClinic);
            }
            await clinicDAO.insertClinic(username, password, clinicName, address, email, phoneNumber);

            var host = req.protocol + '://' + req.get('host');
            await authenUtils.sendConfirmRegister(host, username, email);
            res.json(utils.responseSuccess("Đăng ký tài khoản thành công"));
            logger.successLog("register");
        } catch (error) {
            logger.log(error);
            logger.failLog("register", error);
            res.json(utils.responseFailure(error.message));
        }
    });

    apiRouter.post("/getClinicInformation", async function (req, res) {
        var username = req.body.username;
        try {
            var result = await clinicDAO.getClinicResponse(username);
            res.json(utils.responseSuccess(result));
            logger.successLog("getClinicInformation");
        } catch (error) {
            logger.log(error);
            logger.failLog("getClinicInformation", error);
            res.json(utils.responseFailure(error.message));
        }
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
                    user.delayDuration = user.clinic.delayDuration;
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