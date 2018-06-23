var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var nodeMailer = require("../Utils/Email");
var hash = require("../Utils/Bcrypt");
var userDAO = require("../DataAccess/UserDAO");
var baseDao = require("../DataAccess/BaseDAO");

module.exports = function (app, express) {
    var apiRouter = express.Router();
    // login
    apiRouter.post("/Login", function (req, res) {
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
                                if (results.isActive == Const.ACTIVATION && results.role == Const.ROLE_ADMIN) {
                                    delete results.password;
                                    delete results.isActive;
                                    res.json(utils.responseSuccess(results));
                                } else if (results.isActive == Const.ACTIVATION && results.role == Const.ROLE_STAFF) {
                                    delete results.password;
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
                            logger.log(err.message, "login", "UserController");
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err.message, "login", "UserController");
            });
    });
    // get all user by role from database
    apiRouter.get("/getAllUser", function (req, res) {
        var users;
        var role = req.query.role;
        if (role == Const.ROLE_ADMIN || role == Const.ROLE_STAFF) {
            userDAO.getAllUser(role)
                .then(function (result) {
                    res.json(utils.responseSuccess(result));
                })
                .catch(function (err) {
                    res.json(utils.responseFailure(err));
                    logger.log(err.message, "getAllUser", "UserController");
                });
        } else if (role == Const.ROLE_CLINIC) {
            userDAO.getAllClinic()
                .then(function (result) {
                    res.json(utils.responseSuccess(result));
                })
                .catch(function (err) {
                    res.json(utils.responseFailure(err));
                    logger.log(err.message, "getAllUser", "UserController");
                });
        } else {
            userDAO.getAll()
                .then(function (result) {
                    res.json(utils.responseSuccess(result));
                })
                .catch(function (err) {
                    res.json(utils.responseFailure(err));
                    logger.log(err.message, "getAllUser", "UserController");
                });
        }
    });
    //change password
    apiRouter.post("/changePassword", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var newPassword = req.body.newPassword;
        userDAO.getUserInfo(username)
            .then(function (result) {
                if (password == null) {
                    res.json(utils.responseFailure("Vui lòng nhập mật khẩu"));
                } else {
                    hash.comparePassword(password, result.password)
                        .then(function (result) {
                            if (result == true) {
                                if (newPassword == null) {
                                    res.json(utils.responseFailure("Vui lòng nhập mật khẩu mới"));
                                } else {
                                    hash.hashPassword(newPassword)
                                        .then(function (result) {
                                            userDAO.updateUser(username, result)
                                                .then(function (result) {
                                                    res.json(utils.responseSuccess("Thay đổi mật khẩu thành công"));
                                                })
                                                .catch(function (err) {
                                                    res.json(utils.responseFailure(err));
                                                    logger.log(err.message, "changePassword", "UserController");
                                                });
                                        })
                                        .catch(function (err) {
                                            res.json(utils.responseFailure(err));
                                            logger.log(err.message, "changePassword", "UserController");
                                        });
                                }
                            } else {
                                res.json(utils.responseFailure("Mật khẩu không đúng"));
                            }
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err));
                            logger.log(err.message, "changePassword", "UserController");
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err.message, "changePassword", "UserController");
            });
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
        var examinationDuration = req.body.examinationDuration;
        var expiredLicense = req.body.expiredLicense;
        var imageURL = req.body.imageURL;
        var greetingURL = req.body.greetingURL;
        try {
            var resultClinic;
            var users = await userDAO.getUserInfo(username);
            if (password|| phoneNumber|| fullName|| role|| isActive|| email != null) {
                var resultUser = await userDAO.updateUser(username, password, phoneNumber, fullName, role, isActive, email);
                if (users.role == Const.ROLE_CLINIC) {
                    resultClinic = await userDAO.updateClinic(username, address, clinicName);
                    var results = Object.assign(resultUser, resultClinic);
                    res.json(utils.responseSuccess(results));
                } else {
                    res.json(utils.responseSuccess(resultUser));
                }
            } else {
                if (users.role == Const.ROLE_CLINIC) {
                    resultClinic = await userDAO.updateClinic(username, address, clinicName);
                    res.json(utils.responseSuccess(resultClinic));
                } else {
                    res.json(utils.responseFailure("Không thể cập nhật"));
                }
            }
        }
        catch (err) {
            res.json(utils.responseFailure("Không thể cập nhật"));
            logger.log(err, "update", "UserController");
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
                                    })
                                    .catch(function (err) {
                                        res.json(utils.responseFailure(err));
                                        logger.log(err.message, "createAdmin", "UserController");
                                    });
                            }
                            else {
                                res.json(utils.responseFailure("Tạo tài khoản không thành công"));
                            }
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err));
                            logger.log(err.message, "createAdmin", "UserController");
                        });
                } else {
                    res.json(utils.responseFailure("Không thể tạo tài khoản này"));
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err.message, "createAdmin", "UserController");
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
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err.message, "checkDuplicate", "UserController");
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
                            } else {
                                res.json(utils.responseFailure("Mật khẩu không đúng"));
                            }
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err));
                            logger.log(err.message, "checkPassword", "UserController");
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err.message, "checkPassword", "UserController");
            });
    });
    //reset password
    apiRouter.post("/resetPassword", function (req, res) {
        var username = req.body.username;
        var email = req.body.email;
        userDAO.getUserInfo(username)
            .then(function (results) {
                if (results.isActive == Const.DEACTIVATION) {
                    res.json(utils.responseFailure("Tài khoản này không hoạt động"));
                } else {
                    if (email == null) {
                        res.json(utils.responseFailure("Vui lòng nhập email"));
                    } else {
                        if (email == results.email) {
                            var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
                            // Generate random number, eg: 0.123456
                            // Convert  to base-36 : "0.4fzyo82mvyr"
                            // Cut off last 8 characters : "yo82mvyr"
                            var randomstring = Math.random().toString(36).slice(-8);
                            hash.hashPassword(randomstring)
                                .then(function (password) {
                                    userDAO.updateUser(username, password)
                                        .then(function (result) {
                                            res.json(utils.responseSuccess("Đặt lại mật khẩu thành công"));
                                        })
                                        .catch(function (err) {
                                            res.json(utils.responseFailure(err));
                                            logger.log(err.message, "resetPassword", "UserController");
                                        });
                                    nodeMailer.sendEmailToPatient(username, randomstring, results.fullName, email);
                                })
                                .catch(function (err) {
                                    res.json(utils.responseFailure(err));
                                    logger.log(err.message, "resetPassword", "UserController");
                                });
                        } else {
                            res.json(utils.responseFailure("Email này không tồn tại"));
                        }
                    }
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err.message, "resetPassword", "UserController");
            });
    });
    // delete account
    apiRouter.post("/delete", function (req, res) {
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
                                if (results.role == Const.ROLE_ADMIN) {
                                    userDAO.deleteUser(username)
                                        .then(function (result) {
                                            res.json(utils.responseSuccess(result));
                                        })
                                        .catch(function (err) {
                                            res.json(utils.responseFailure(err));
                                            logger.log(err.message, "delete", "UserController");
                                        });
                                } else if (results.role = Const.ROLE_CLINIC) {
                                    // Xóa clinic chưa làm
                                    res.json(utils.responseFailure("Tài khoản không thể xóa"));
                                } else {
                                    res.json(utils.responseFailure("Tài khoản không thể xóa"));
                                }
                            } else {
                                res.json(utils.responseFailure("Mật khẩu không đúng"));
                            }
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err));
                            logger.log(err.message, "delete", "UserController");
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err.message, "delete", "UserController");
            });
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
                                    });
                            });
                    }
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err.message, "hash", "UserController");
            });
    });
    //-------------------------------------------------------------------------//

    //api for dev time

    apiRouter.get("/dev/getAllUser", function (req, res) {
        baseDao.findAll(db.User)
            .then(collection => {
                res.json(utils.responseSuccess(collection));
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
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(error.message));
        }
    });
    return apiRouter;
};