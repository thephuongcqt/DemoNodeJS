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
                logger.successLog("getAllLicense");
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err);
            });
    });
    // get lincese info
    apiRouter.get("/getLicenseInfo", function (req, res) {
        var licenseID = req.query.licenseID;
        licenseDAO.getLicenseInfo(licenseID)
            .then(function (results) {
                res.json(utils.responseSuccess(results));
                logger.successLog("getLicenseInfo");
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err);
            });
    });
    // create license
    apiRouter.post("/create", function (req, res) {
        var price = req.body.price;
        var duration = req.body.duration;
        if (isNaN(price)) {
            price = undefined;
        }
        if (isNaN(duration)) {
            duration = undefined;
        }
        licenseDAO.createLicense(price, duration, req.body.name, req.body.description)
            .then(function (results) {
                res.json(utils.responseSuccess(results));
                logger.successLog("create");
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err);
            });
    });
    // update license
    apiRouter.post("/update", async function (req, res) {
        var price = req.body.price;
        var duration = req.body.duration;
        var isActive = req.body.isActive;
        try {
            var resultInfo = await licenseDAO.getLicenseInfo(req.body.licenseID);
            if (!resultInfo) {
                res.json(utils.responseFailure("License is not exist"));
            } else {
                if (isNaN(price)) {
                    price = undefined;
                }
                if (isNaN(duration)) {
                    duration = undefined;
                }
                if (isNaN(isActive)) {
                    isActive = undefined;
                }
                var resultUpdate = await licenseDAO.updateLicense(req.body.licenseID, price, duration, req.body.name, req.body.description, isActive);
                res.json(utils.responseSuccess(resultUpdate));
                logger.successLog("updateLicense");
            }
        }
        catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.log(err);
        }
    });
    // delete license
    apiRouter.get("/delete", async function (req, res) {
        try {
            var resultLicense = await licenseDAO.getLicenseBill(req.query.licenseID);
            if (!resultLicense) {
                res.json(utils.responseFailure("License is not exist"));
            } else {
                if (resultLicense.bills.length != 0) {
                    res.json(utils.responseFailure("License is using"));
                } else {
                    var resultDelete = await licenseDAO.deleteLicense(req.query.licenseID);
                    res.json(utils.responseFailure(resultDelete));
                    logger.successLog("deleteLicense");
                }
            }
        }
        catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.log(err);
        }
    });
    return apiRouter;
}