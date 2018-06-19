var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");

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
        db.User.forge({ "username": username })
            .fetch()
            .then(function (collection) {
                var responseObj;
                if (collection == null) {
                    db.User.forge({ 'username': username, 'password': '123456','fullName': fullName, 'phoneNumber': phoneNumber, 'role': 0, 'isActive': 1 })
                        .save()
                        .then(function (collection) {
                            res.json(utils.responseSuccess(collection.toJSON()));
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                        });
                } else {
                    res.json(utils.responseFailure("This username have been exist"));
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
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
    // update information
    apiRouter.post("/update", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var fullName = req.body.fullName;
        var phoneNumber = req.body.phoneNumber;
        var role = req.body.role;
        var isActive = req.body.isActive;
        db.User.where({ "username": username })
            .fetch()
            .then(function (collection) {
                var user = collection.toJSON();
                if (collection == null) {
                    res.json(utils.responseFailure("Username is not exist"));
                } else {
                    db.User.where({ "username": username })
                        .save({ "password": password,"fullName":fullName, "phoneNumber": phoneNumber, "role": role, "isActive": isActive }, { patch: true })
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