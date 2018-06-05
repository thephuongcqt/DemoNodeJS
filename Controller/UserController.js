var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
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
                    responseObj = utils.makeResponse(false, null, "Incorrect username or password!");
                } else {
                    var user = collection.toJSON();
                    delete user.password;
                    responseObj = utils.makeResponse(true, user, null);
                }
                res.json(responseObj)
            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, null, err.message);
                res.json(responseObj);
            });
    });

    apiRouter.post("/changePassword", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var newPassword = req.body.newPassword;
        db.User.where({ "username": username, "password": password })
            .save({ "password": newPassword }, { patch: true })
            .then(function (model) {
                var responseObj = utils.makeResponse(true, null, null);
                res.json(responseObj);
            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, false, "Incorrect username or password");
                res.json(responseObj);
            });
    });
    
    // get all admin from database
    apiRouter.get("/getAllAdmin", function (req, res) {
        db.User.forge()
            .where("role", Const.ROLE_ADMIN)
            .fetchAll()
            .then(function (collection) {
                var responseObj = utils.makeResponse(true, collection.toJSON(), null);
                res.json(responseObj)
            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, null, err.message);
                res.json(responseObj);
            });
    });
    // get all user by role from database
    apiRouter.get("/getAllUser", function (req, res) {
        if (req.query.role == 0) {
            db.User.forge()
                .where("role", Const.ROLE_ADMIN)
                .fetchAll()
                .then(function (collection) {
                    var responseObj = utils.makeResponse(true, collection.toJSON(), null);
                    res.json(responseObj)
                })
                .catch(function (err) {
                    var responseObj = utils.makeResponse(false, null, err.message);
                    res.json(responseObj);
                });
        }
        else if (req.query.role == 1) {
            db.User.forge()
                .where("role", Const.ROLE_CLINIC)
                .fetchAll()
                .then(function (collection) {
                    var responseObj = utils.makeResponse(true, collection.toJSON(), null);
                    res.json(responseObj)
                })
                .catch(function (err) {
                    var responseObj = utils.makeResponse(false, null, err.message);
                    res.json(responseObj);
                });
        }
        else {
            db.User.forge()
                .fetchAll()
                .then(function (collection) {
                    var responseObj = utils.makeResponse(true, collection.toJSON(), null);
                    res.json(responseObj)
                })
                .catch(function (err) {
                    var responseObj = utils.makeResponse(false, null, err.message);
                    res.json(responseObj);
                });
        }
    });
    // create user for admin
    apiRouter.post("/create", function (req, res) {
        var username = req.body.username;
        var phoneNumber = req.body.phoneNumber;
        var role = req.body.role;
        db.User.forge({ "username": username })
            .fetch()
            .then(function (collection) {
                var responseObj;
                if (collection == null) {
                    db.User.forge({ 'username': username, 'password': '123456', 'phoneNumber': phoneNumber, 'role': role, 'isActive': '1' })
                        .save()
                        .then(function (collection) {
                            responseObj = utils.makeResponse(true, collection.toJSON(), null);
                            res.json(responseObj);
                        })
                        .catch(function (err) {
                            responseObj = utils.makeResponse(false, null, err.message);
                            res.json(responseObj);
                        });
                } else {
                    responseObj = utils.makeResponse(true, collection.toJSON(), null);
                    res.json(responseObj);
                }
            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, null, err.message);
                res.json(responseObj);
            });
    });
    // get user information
    apiRouter.get("/information", function (req, res) {
        var username = req.query.username;
        db.User.forge({ "username": username })
            .fetch()
            .then(function (collection) {
                var responseObj1 = collection.toJSON();
                if (responseObj1.role == 1) {
                    db.Clinic.forge({ "username": username })
                        .fetch()
                        .then(function (collection) {
                            var responseObj2 = collection.toJSON();
                            var output = Object.assign(responseObj2, responseObj1);
                            var responseOutput = utils.makeResponse(true, output, null);
                            res.json(responseOutput);
                        });
                }
                else {
                    var responseObj = utils.makeResponse(true, responseObj1, null);
                    res.json(responseObj);
                }
            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, null, err.message);
                res.json(responseObj);
            });
    });
    // update user information
    apiRouter.post("/update", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var phoneNumber = req.body.phoneNumber;
        var address = req.body.address;
        var clinicName = req.body.clinicName;
        var defaultStartWorking = req.body.defaultStartWorking;
        var defaultEndWorking = req.body.defaultEndWorking;
        var role = req.body.role;
        var isActive = req.body.isActive;
        var responseObj;
        db.User.where({ "username": username })
            .save({ "password": password, "phoneNumber": phoneNumber, "isActive": isActive }, { patch: true })
            .then(function (model) {
                db.User.forge({ "username": username })
                    .fetch()
                    .then(function (collection) {
                        var responseObj1 = collection.toJSON();
                        if (collection.attributes.role == 1) {
                            db.Clinic.where({ "username": username })
                                .save({ "address": address, "clinicName": clinicName, "defaultStartWorking": defaultStartWorking, "defaultEndWorking": defaultEndWorking }, { patch: true })
                                .then(function (model) {
                                    db.Clinic.forge({ "username": username })
                                        .fetch()
                                        .then(function (model) {
                                            var responseObj2 = model.toJSON();
                                            responseObj = Object.assign(responseObj1, responseObj2);
                                            var output = utils.makeResponse(true, responseObj, null);
                                            res.json(output);
                                        })
                                        .catch(function (err) {
                                            responseObj = utils.makeResponse(false, false, err.message);
                                            res.json(responseObj);
                                        })
                                })
                                .catch(function (err) {
                                    responseObj = utils.makeResponse(false, false, err.message);
                                    res.json(responseObj);
                                });
                        } else if (collection.attributes.role == 0) {
                            responseObj = utils.makeResponse(true, collection.toJSON(), null);
                            res.json(responseObj);
                        }
                    })
                    .catch(function (err) {
                        responseObj = utils.makeResponse(false, false, err.message);
                        res.json(responseObj);
                    });
            })
            .catch(function (err) {
                responseObj = utils.makeResponse(false, false, err.message);
                res.json(responseObj);
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
                                    responseObj = utils.makeResponse(true, "Account have deleted", null);
                                    res.json(responseObj);
                                })
                                .catch(function (err) {
                                    responseObj = utils.makeResponse(false, false, err.message);
                                    res.json(responseObj);
                                });
                        })
                        .catch(function (err) {
                            responseObj = utils.makeResponse(false, false, err.message);
                            res.json(responseObj);
                        });
                } else if (collection.attributes.role == 0) {
                    db.User.where({ "username": username })
                        .destroy()
                        .then(function (model) {
                            responseObj = utils.makeResponse(true, "Account have deleted", null);
                            res.json(responseObj);
                        })
                        .catch(function (err) {
                            responseObj = utils.makeResponse(false, false, err.message);
                            res.json(responseObj);
                        });
                }
            })
            .catch(function (err) {
                responseObj = utils.makeResponse(false, false, err.message);
                res.json(responseObj);
            });
    });
    return apiRouter;
};