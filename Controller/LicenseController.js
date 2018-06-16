var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");

module.exports = function (app, express) {
    apiRouter = express.Router();
    // get All lincese
    apiRouter.get("/getAllLicense", function (req, res) {
        db.License.forge()
            .fetchAll()
            .then(function (collection) {
                if (collection == null) {
                    res.json(utils.responseFailure(err.message));
                } else {
                    res.json(utils.responseSuccess(collection.toJSON()));
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "getAllLicense", "LicenseController");
            });
    });
    // create license
    apiRouter.post("/create", function (req, res) {
        new db.License()
            .save({ "price": req.body.price, "duration": req.body.duration, "name": req.body.name, "description": req.body.description, "isActive": req.body.isActive })
            .then(function (collection) {
                var license = collection.toJSON();
                if (collection == null) {
                    res.json(utils.responseFailure("Create mot success"));
                } else {
                    res.json(utils.responseSuccess(collection.toJSON()));
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "create", "LicenseController");
            });
    });
    // update license
    apiRouter.post("/update", function (req, res) {
        db.License.where({ "licenseID": req.body.licenseID })
            .fetchAll()
            .then(function (collection) {
                if (collection == null) {
                    res.json(utils.responseFailure("License is not exist"));
                } else {
                    db.License.where({ "licenseID": req.body.licenseID })
                        .save({ "price": req.body.price, "duration": req.body.duration, "name": req.body.name, "description": req.body.description, "isActive": req.body.isActive }, { patch: true })
                        .then(function (collection) {
                            res.json(utils.responseSuccess(collection));
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                            logger.log(err.message, "update", "LicenseController");
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "update", "LicenseController");
            });
    });
    // delete license
    apiRouter.get("/delete", function (req, res) {
        var licenseID = req.query.licenseID;
        var responseObj;
        db.License.forge({ "licenseID": licenseID })
            .fetch({ withRelated: ["bills"] })
            .then(function (collection) {
                var license = collection.toJSON();
                if (collection != null) {
                    var listBill = [];
                    for (var i in license.bills) {
                        var bill = license.bills[i];
                        if (bill.isActive == 0) {
                            db.License.where({ "licenseID": licenseID })
                                .destroy()
                                .then(function (model) {
                                    res.json(utils.responseSuccess("License have deleted successfull"));
                                })
                                .catch(function (err) {
                                    res.json(utils.responseFailure(err.message));
                                });
                        } else {
                            res.json(utils.responseFailure("Can not delete this license"));
                        }
                    }
                } else {
                    res.json(utils.responseFailure("License is not exist"));
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "delete", "LicenseController");
            });
    });
    return apiRouter;
}