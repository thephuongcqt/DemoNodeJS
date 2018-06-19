var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var nodemailer = require('nodemailer');
var Moment = require('moment');

module.exports = function (app, express) {
    var apiRouter = express.Router();
    // login
    apiRouter.post("/Login", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        db.User.forge({ "username": username, "password": password })
            .fetch()
            .then(function (collection) {
                var responseObj;
                if (collection == null) {
                    responseObj = utils.responseFailure("Incorrect username or password!");
                } else {
                    if (collection.attributes.role == 0 && collection.attributes.isActive != 0) {
                        var user = collection.toJSON();
                        delete user.password;
                        responseObj = utils.responseSuccess(user);
                    }
                    else {
                        responseObj = utils.responseFailure("Incorrect username or password!");
                    }
                }
                res.json(responseObj)
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "Login", "UserController");
            });
    });

    apiRouter.post("/changePassword", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var newPassword = req.body.newPassword;
        db.User.where({ "username": username, "password": password })
            .save({ "password": newPassword }, { patch: true })
            .then(function (model) {
                res.json(utils.responseSuccess(null));
            })
            .catch(function (err) {
                res.json(utils.responseFailure("Incorrect username or password"));
                logger.log(err.message, "changePassword", "UserController");
            });
    });

    // get all admin from database
    apiRouter.get("/getAllAdmin", function (req, res) {
        db.User.where({ "role": Const.ROLE_ADMIN, "isActive": Const.ACTIVATION })
            .fetchAll()
            .then(function (collection) {
                res.json(utils.responseSuccess(collection.toJSON()));
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "getAllAdmin", "UserController");
            });
    });
    // get all user by role from database
    apiRouter.get("/getAllUser", function (req, res) {
        if (req.query.role == 0) {
            db.User.forge({ "isActive": Const.ACTIVATION })
                .where("role", Const.ROLE_ADMIN)
                .fetchAll()
                .then(function (collection) {
                    res.json(utils.responseSuccess(collection.toJSON()));
                })
                .catch(function (err) {
                    res.json(utils.responseFailure(err.message));
                    logger.log(err.message, "getAllUser", "UserController");
                });
        }
        else if (req.query.role == 1) {
            db.User.forge()
                .where("role", Const.ROLE_CLINIC)
                .fetchAll()
                .then(function (collection) {
                    res.json(utils.responseSuccess(collection.toJSON()));
                })
                .catch(function (err) {
                    res.json(utils.responseFailure(err.message));
                    logger.log(err.message, "getAllUser", "UserController");
                });
        }
        else {
            db.User.forge()
                .fetchAll()
                .then(function (collection) {
                    res.json(utils.responseSuccess(collection.toJSON()));
                })
                .catch(function (err) {
                    res.json(utils.responseFailure(err.message));
                    logger.log(err.message, "getAllUser", "UserController");
                });
        }
    });
    // create user for admin
    apiRouter.post("/create", function (req, res) {
        var username = req.body.username;
        var phoneNumber = req.body.phoneNumber;
        var fullName = req.body.fullName;
        var email = req.body.email;
        db.User.forge({ "username": username })
            .fetch()
            .then(function (collection) {
                var responseObj;
                if (collection == null) {
                    db.User.forge({ 'username': username, 'password': '123456', 'fullName': fullName, 'phoneNumber': phoneNumber, 'role': 0, 'isActive': 1, "email": email })
                        .save()
                        .then(function (collection) {
                            res.json(utils.responseSuccess(collection.toJSON()));
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                            logger.log(err.message, "createAdmin", "UserController");
                        });
                } else {
                    res.json(utils.responseFailure("This username have been exist"));
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "createAdmin", "UserController");
            });
    });
    //check duplicate username
    apiRouter.get("/checkDuplicate", function (req, res) {
        var username = req.query.username;
        db.User.where({ "username": username })
            .fetch()
            .then(function (collection) {
                if (collection == null) {
                    res.json(utils.responseFailure("This account is available"));
                } else {
                    res.json(utils.responseSuccess("This account have been exist"));
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "checkDuplicate", "UserController");
            });
    });
    //check password
    apiRouter.post("/checkPassword", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        db.User.where({ "username": username, "password": password })
            .fetch()
            .then(function (collection) {
                if (collection == null) {
                    res.json(utils.responseFailure("This password is not correct"));
                } else {
                    res.json(utils.responseSuccess("This password is correct"));
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "checkPassword", "UserController");
            });
    });

    //---------------------------------------------------------------------------------------------//
    function sendEmailToPatient(email, username, password) {
        //  Send Email to patient when reset password successfull 
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'callcentercapstone@gmail.com',
                pass: 'Callcenterpass1Callcenterpass1'
            }
        });
        var currentDate = Moment(new Date()).format('DD-MM-YYYY');
        var currentTime = Moment(new Date()).format('HH:mm:ss');
        const mailOptions = {
            from: 'callcentercapstone@gmail.com', // sender address
            to: email, // list of receivers
            subject: 'Thông tin khôi phục mật khẩu', // Subject line
            html: '<!DOCTYPE html>' +
                '<html><head><title>Appointment</title>' +
                '</head><body><div style="padding:10px 250px 5px 250px;text-align:center">' +
                '<img src="https://www.brandcrowd.com/gallery/brands/pictures/picture13882532337876.jpg" alt="logo" width="160" height="100">' +
                '<tr><td style="background:#00b9f2;height:5px;line-height:5px;width:233px"></td>' +
                '<td style="background:#f7941d;height:5px;line-height:5px;width:233px"></td>' +
                '<td style="background:#5cb85c;height:5px;line-height:5px;width:233px"></td></tr></div>' +
                '<div style="padding:5px 250px 10px 250px"><h1 style="color:#03a9f4;text-align:center">Quên mật khẩu?</h1>' +
                '<h1 style="color:#03a9f4;text-align:center">Thiết lập mật khẩu mới!</h1>' +
                '<h3>Xin chào,</h3>' +
                '<p>Cảm ơn bạn đã yêu cầu đặt lại mật khẩu.</p>' +
                '<p>Mật khẩu cho tài khoản ' + '<strong style="color:#15c; font-size:120%;">' + username + '</strong>' + ' đã được thay đổi thành công.</p>' +
                '<p>Đây là mật khẩu mới của bạn: <strong style="color:#15c; font-size:120%;">' + password + '</strong></p>' +
                '<p>Bạn yêu cầu đặt lại mật khẩu ngày ' + currentDate + ' lúc ' + currentTime + '.</p>' +
                '</div></body></html>'
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "sendEmailError", "UserController");
            }
        });
    }
    //---------------------------------------------------------------------------------------------//
    //reset password
    apiRouter.post("/resetPassword", function (req, res) {
        var username = req.body.username;
        var email = req.body.email;
        db.User.where({ "username": username, "email": email })
            .fetch()
            .then(function (collection) {
                if (collection == null) {
                    res.json(utils.responseFailure("This email is not exist"));
                } else {
                    var user = collection.toJSON();
                    if (user.isActive == Const.DEACTIVATION) {
                        res.json(utils.responseFailure("This account is not active"));
                    } else {
                        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
                        // Generate random number, eg: 0.123456
                        // Convert  to base-36 : "0.4fzyo82mvyr"
                        // Cut off last 8 characters : "yo82mvyr"
                        var randomstring = Math.random().toString(36).slice(-8);
                        db.User.where({ "username": username, "password": user.password })
                            .save({ "password": randomstring }, { patch: true })
                            .then(function (model) {
                                res.json(utils.responseSuccess("Reset password successful"));
                                sendEmailToPatient(email, username, randomstring);
                            })
                            .catch(function (err) {
                                res.json(utils.responseFailure("Reset password fail"));
                                logger.log(err.message, "resetPassword", "UserController");
                            });
                    }
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "resetPassword", "UserController");
            });
    });
    // update information
    apiRouter.post("/update", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var fullName = req.body.fullName;
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
                            delete model.password;
                            res.json(utils.responseSuccess("Update successfull"));
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                            logger.log(err.message, "update", "UserController");
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "update", "UserController");
            });
    });
    // delete account
    apiRouter.get("/delete", function (req, res) {
        var username = req.query.username;
        var responseObj;
        db.User.forge({ "username": username })
            .fetch()
            .then(function (collection) {
                if (collection.attributes.role == 1) {
                    db.Clinic.where({ "username": username })
                        .destroy()
                        .then(function (collection) {
                            db.User.where({ "username": username })
                                .destroy()
                                .then(function (model) {
                                    res.json(utils.responseSuccess("Account have deleted"));
                                })
                                .catch(function (err) {
                                    res.json(utils.responseFailure(err.message));
                                    logger.log(err.message, "delete", "UserController");
                                });
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                            logger.log(err.message, "delete", "UserController");
                        });
                } else if (collection.attributes.role == 0) {
                    db.User.where({ "username": username })
                        .destroy()
                        .then(function (model) {
                            res.json(utils.responseSuccess("Account have deleted"));
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                            logger.log(err.message, "delete", "UserController");
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "delete", "UserController");
            });
    });
    return apiRouter;
};