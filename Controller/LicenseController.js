var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var licenseDAO = require("../DataAccess/LicenseDAO");

module.exports = function (app, express) {
    apiRouter = express.Router();
    // get All lincese
    apiRouter.get("/getAllLicense", function (req, res) {
        licenseDAO.getAllLicense()
            .then(function (results) {
                res.json(utils.responseSuccess(results));
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err.message, "getAllLicense", "LicenseController");
            });
    });
    // get lincese info
    apiRouter.get("/getLicenseInfo", function (req, res) {
        var licenseID = req.query.licenseID;
        licenseDAO.getLicenseInfo(licenseID)
            .then(function (results) {
                res.json(utils.responseSuccess(results));
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err.message, "getAllLicense", "LicenseController");
            });
    });
    // create license
    apiRouter.post("/create", function (req, res) {
        licenseDAO.createLicense(req.body.price, req.body.duration, req.body.name, req.body.description)
            .then(function (results) {
                res.json(utils.responseSuccess(results));
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err.message, "create", "LicenseController");
            });
    });
    // update license
    apiRouter.post("/update", function (req, res) {
        licenseDAO.getLicenseInfo(req.body.licenseID)
            .then(function (result) {
                licenseDAO.updateLicense(req.body.licenseID, req.body.price, req.body.duration, req.body.name, req.body.description, req.body.isActive)
                    .then(function (results) {
                        res.json(utils.responseSuccess(results));
                    })
                    .catch(function (err) {
                        res.json(utils.responseFailure(err));
                        logger.log(err.message, "update", "LicenseController");
                    });
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err.message, "update", "LicenseController");
            });
    });
    // delete license
    apiRouter.get("/delete", function (req, res) {
        licenseDAO.getLicenseBill(req.query.licenseID)
            .then(function (results) {
                if (results.bills.length == 0) {
                    licenseDAO.deleteLicense(req.query.licenseID)
                        .then(function (result) {
                            res.json(utils.responseSuccess(result));
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err));
                            logger.log(err.message, "delete", "LicenseController");
                        });
                } else {
                    res.json(utils.responseFailure("Giấy phép này đang được sử dụng"));
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err.message, "delete", "LicenseController");
            });
    });
    return apiRouter;
}