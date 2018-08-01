var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var nodeMailer = require("../Utils/Email");
var hash = require("../Utils/Bcrypt");
var userDAO = require("../DataAccess/UserDAO");
var baseDao = require("../DataAccess/BaseDAO");
var clinicDAO = require("../DataAccess/ClinicDAO");

module.exports = function (app, express) {
    var apiRouter = express.Router();
    // login
    apiRouter.post("/Login", async function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        try {
            var user = await userDAO.getUserInfo(username);
            if (password == null) {
                res.json(utils.responseFailure("Vui lòng nhập mật khẩu"));
            } else {
                var isCorrectPassword = await hash.comparePassword(password, user.password);
                if (isCorrectPassword) {
                    if (user.isActive == Const.ACTIVATION && user.role == Const.ROLE_ADMIN) {
                        delete user.password;
                        delete user.isActive;
                        res.json(utils.responseSuccess(user));
                    } else if (user.isActive == Const.ACTIVATION && user.role == Const.ROLE_STAFF) {
                        delete user.password;
                        delete user.isActive;
                        res.json(utils.responseSuccess(user));
                    } else if (user.role == Const.ROLE_CLINIC) {
                        var clinic = await clinicDAO.getClinicResponse(username);
                        res.json(utils.responseSuccess(clinic));
                        logger.successLog("Login: " + username);
                    } else {
                        res.json(utils.responseFailure("Tài khoản không tồn tại"));
                    }
                } else {
                    res.json(utils.responseFailure("Mật khẩu không đúng"));
                }
            }
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(error.message));
        }
    });
    // get all user by role from database
    apiRouter.get("/getAllUser", function (req, res) {
        var users;
        var role = req.query.role;
        if (role == Const.ROLE_ADMIN || role == Const.ROLE_STAFF) {
            userDAO.getAllUser(role)
                .then(function (result) {
                    res.json(utils.responseSuccess(result));
                    logger.successLog("getAllUser");
                })
                .catch(function (err) {
                    res.json(utils.responseFailure(err));
                });
        } else if (role == Const.ROLE_CLINIC) {
            userDAO.getAllClinic()
                .then(function (result) {
                    res.json(utils.responseSuccess(result));
                    logger.successLog("getAllUser");
                })
                .catch(function (err) {
                    res.json(utils.responseFailure(err));
                });
        } else {
            userDAO.getAll()
                .then(function (result) {
                    res.json(utils.responseSuccess(result));
                    logger.successLog("getAllUser");
                })
                .catch(function (err) {
                    res.json(utils.responseFailure(err));
                });
        }
    });
    //change password
    apiRouter.post("/changePassword", async function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var newPassword = req.body.newPassword;
        try {
            if (!username) {
                res.json(utils.responseFailure("Xin vui lòng nhập tên đăng nhập"));
                return;
            }
            if (!password) {
                res.json(utils.responseFailure("Xin vui lòng nhập mật khẩu"));
                return;
            }
            if (!newPassword) {
                res.json(utils.responseFailure("Xin vui lòng nhập mật khẩu mới"));
                return;
            }
            var user = await userDAO.getUserInfo(username);
            if (user) {
                var compare = await hash.comparePassword(password, user.password);
                if (compare == false) {
                    res.json(utils.responseFailure("Mật khẩu không đúng"));
                    return;
                }
                var hashPassword = await hash.hashPassword(newPassword);
                var userUpdate = await userDAO.updateUser(username, hashPassword);
                var checkPass = await hash.comparePassword(newPassword, userUpdate.password);
                if (checkPass == false) {
                    res.json(utils.responseFailure("Đặt lại mật khẩu thất bại"));
                    return;
                }
                res.json(utils.responseSuccess("Đặt lại mật khẩu thành công"));
                logger.successLog("changePassword");
                return;
            }
            res.json(utils.responseFailure("Tài khoản không tồn tại"));
        }
        catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.log(err);
        }
    });
    // update information
    apiRouter.post("/update", async function (req, res) {
        var username = req.body.username;
        var password;
        var fullName = req.body.fullName;
        var phoneNumber = req.body.phoneNumber;
        var role = req.body.role;
        var isActive = req.body.isActive;
        var email = req.body.email;
        var address = req.body.address;
        var clinicName = req.body.clinicName;
        var accountSid = req.body.accountSid;
        var authToken = req.body.authToken;
        try {
            var resultClinic;
            var users = await userDAO.getUserInfo(username);
            if (password || phoneNumber || fullName || role || isActive || email) {
                var resultUser = await userDAO.updateUser(username, password, phoneNumber, fullName, role, isActive, email);
                if (users.role == Const.ROLE_CLINIC) {
                    resultClinic = await userDAO.updateClinic(username, address, clinicName, accountSid, authToken);
                    var results = Object.assign(resultUser, resultClinic);
                    res.json(utils.responseSuccess(results));
                    logger.successLog("updateUser");
                } else {
                    res.json(utils.responseSuccess(resultUser));
                    logger.successLog("updateUser");
                }
            } else {
                if (users.role == Const.ROLE_CLINIC) {
                    resultClinic = await userDAO.updateClinic(username, address, clinicName, accountSid, authToken);
                    res.json(utils.responseSuccess(resultClinic));
                    logger.successLog("updateUser");
                } else {
                    res.json(utils.responseFailure("Không có thông tin cập nhật"));
                }
            }
        }
        catch (err) {
            res.json(utils.responseFailure("Không thể cập nhật"));
        }
    });
    // create user for admin
    apiRouter.post("/create", function (req, res) {
        var username = req.body.username;
        var phoneNumber = req.body.phoneNumber;
        var fullName = req.body.fullName;
        var email = req.body.email;
        var role = req.body.role;
        userDAO.checkUserInfo()
            .then(function (results) {
                var checkDuplicate;
                for (var i in results) {
                    var user = results[i];
                    if (user.username == username || user.phoneNumber == phoneNumber || user.email == email) {
                        checkDuplicate = false;
                        break;
                    } else {
                        checkDuplicate = true;
                    }
                }
                if (checkDuplicate == true) {
                    hash.hashPassword("123456")
                        .then(function (password) {
                            if (role == Const.ROLE_ADMIN || role == Const.ROLE_STAFF) {
                                userDAO.createUser(username, password, phoneNumber, fullName, email, role)
                                    .then(function (result) {
                                        res.json(utils.responseSuccess(result));
                                        logger.successLog("createUser");
                                    })
                                    .catch(function (err) {
                                        res.json(utils.responseFailure(err));
                                        logger.log(err);
                                    });
                            }
                            else {
                                res.json(utils.responseFailure("Tạo tài khoản không thành công"));
                            }
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err));
                            logger.log(err);
                        });
                } else {
                    res.json(utils.responseFailure("Tài khoản này đã tồn tại"));
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err);
            });
    });
    //check duplicate
    apiRouter.post("/checkDuplicate", function (req, res) {
        var username = req.body.username;
        var phoneNumber = req.body.phoneNumber;
        var email = req.body.email;
        userDAO.checkUserInfo()
            .then(function (results) {
                var checkDuplicate;
                for (var i in results) {
                    var user = results[i];
                    if (username != null) {
                        if (user.username == username) {
                            res.json(utils.responseFailure("Tài khoản đã tồn tại"));
                            checkDuplicate = false;
                            break;
                        }
                        checkDuplicate = true;
                    }
                    if (phoneNumber != null) {
                        if (user.phoneNumber == phoneNumber) {
                            res.json(utils.responseFailure("Số điện thoại đã tồn tại"));
                            checkDuplicate = false;
                            break;
                        }
                        checkDuplicate = true;
                    }
                    if (email != null) {
                        if (user.email == email) {
                            res.json(utils.responseFailure("Email đã tồn tại"));
                            checkDuplicate = false;
                            break;
                        }
                        checkDuplicate = true;
                    }
                }
                if (checkDuplicate == true) {
                    res.json(utils.responseSuccess("Tài khoản khả dụng"));
                    logger.successLog("checkDuplicate");
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
            });
    });
    //check password
    apiRouter.post("/checkPassword", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        userDAO.getUserInfo(username)
            .then(function (results) {
                if (password == null) {
                    res.json(utils.responseFailure("Vui lòng nhập mật khẩu"));
                } else {
                    hash.comparePassword(password, results.password)
                        .then(function (result) {
                            if (result == true) {
                                res.json(utils.responseSuccess("Mật khẩu chính xác"));
                                logger.successLog("checkPassword");
                            } else {
                                res.json(utils.responseFailure("Mật khẩu không đúng"));
                            }
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err));
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
            });
    });
    // //reset password
    // apiRouter.post("/resetPassword", async function (req, res) {
    //     var username = req.body.username;
    //     var password = req.body.password;
    //     var user = await userDAO.getUserInfo(username);
    //     try {
    //         if (!password) {
    //             res.json(utils.responseFailure("Vui lòng nhập mật khẩu mới"));
    //             return;
    //         }
    //         if (user) {
    //             var newPassword = await hash.hashPassword(password);
    //             var json = { "username": username, "password": password };
    //             await baseDao.update(db.User, json, "username");
    //             res.json(utils.responseFailure("Đặt lại mật khẩu thành công"));
    //             return;
    //         }
    //     }
    //     catch (err) {
    //         res.json(utils.responseFailure(err.message));
    //         logger.log(err);
    //     }
    //     res.json(utils.responseFailure("Không tìm thấy tài khoản"));
    // });
    // delete account
    apiRouter.get("/delete", async function (req, res) {
        try {
            var resultUser = await userDAO.getUserInfo(req.query.username);
            if (!resultUser) {
                res.json(utils.responseFailure("Account is not exist"));
            } else {
                if (resultUser.role == Const.ROLE_ADMIN || resultUser.role == Const.ROLE_STAFF) {
                    var resultDelete = await userDAO.deleteUser(req.query.username);
                    res.json(utils.responseSuccess(resultDelete));
                } else {
                    var resultAppointments = await userDAO.getAppointment(req.query.username);
                    if (resultAppointments.length != 0) {
                        for (var i in resultAppointments) {
                            var resultAppointment = resultAppointments[i];
                            await userDAO.deletePatient(resultAppointment.patient.patientID);
                            await userDAO.deleteAppointment(resultAppointment.appointmentID);
                        }
                    }
                    var resultClinic = await userDAO.getClinic(req.query.username);
                    if (resultClinic != null) {
                        if (resultClinic.workingHours.length != 0) {
                            for (var j in resultClinic.workingHours) {
                                await userDAO.deleteWorkingHours(resultClinic.workingHours[j].id);
                            }
                        }
                        await userDAO.deleteClinic(resultClinic.username);
                    }
                    await userDAO.deleteUser(req.query.username);
                    res.json(utils.responseSuccess("Delete account successfully"));
                    logger.successLog("deleteUser");
                }
            }
        }
        catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.log(err);
        }
    });
    //-------------------------------------------------------------------------//
    apiRouter.post("/hash", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        userDAO.getUserInfo(username)
            .then(function (results) {
                if (password == null) {
                    res.json(utils.responseFailure("Vui lòng nhập mật khẩu"));
                } else {
                    if (password == results.password) {
                        hash.hashPassword(password)
                            .then(function (newpass) {
                                userDAO.updateUser(username, newpass)
                                    .then(function (result) {
                                        res.json(utils.responseSuccess(result));
                                        logger.successLog("hash");
                                    });
                            });
                    }
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err);
            });
    });
    //-------------------------------------------------------------------------//

    //api for dev time

    apiRouter.get("/dev/getAllUser", function (req, res) {
        baseDao.findAll(db.User)
            .then(collection => {
                res.json(utils.responseSuccess(collection));
                logger.successLog("dev/getAllUser");
            })
            .catch(err => {
                logger.log(err);
                res.json(utils.responseFailure(err.message));
            })
    });

    apiRouter.post("/dev/changePassword", async function (req, res) {
        var username = req.body.username;
        var password = req.body.password;

        try {
            var newPassword = await hash.hashPassword(password);
            var json = { "username": username, "password": newPassword };
            var result = await baseDao.update(db.User, json, "username");
            res.json(utils.responseSuccess(result));
            logger.successLog("dev/changePassword");
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(error.message));
        }
    });
    return apiRouter;
};