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

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.post("/removeTwilioAccount", async function (req, res) {
        var username = req.body.username;

        try {
            await clinicDAO.removeTwilio(username);
            res.json(utils.responseSuccess("Remove success"));
        } catch (error) {
            logger.log(error);
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
            await clinicDAO.removeTwilioByPhoneNumber(phoneNumber);
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

            json = await clinicDAO.getClinicResponse(username);
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
                        return;
                    }
                }
            }
            res.json(utils.responseFailure("Sai tên đăng nhập hoặc mật khẩu"));
        } catch (error) {
            logger.log(error);
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
                throw new Error(Const.Error.ClinicRegisterMissingFields);
            }
            if (await clinicDAO.checkExistedClinic(username, email, phoneNumber)) {
                throw new Error(Const.Error.ClinicRegisterExistedClinic);
            }
            await clinicDAO.insertClinic(username, password, clinicName, address, email, phoneNumber);

            var host = req.protocol + '://' + req.get('host');

            res.json(utils.responseSuccess("Đăng ký tài khoản thành công"));

            authenUtils.sendConfirmRegister(host, username, email);
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(error.message));
        }
    });

    apiRouter.post("/getClinicInformation", async function (req, res) {
        var username = req.body.username;
        try {
            var result = await clinicDAO.getClinicResponse(username);
            res.json(utils.responseSuccess(result));
        } catch (error) {
            logger.log(error);
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