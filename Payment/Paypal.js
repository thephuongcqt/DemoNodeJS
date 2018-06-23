var braintree = require("braintree");
var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var baseDao = require("../DataAccess/BaseDAO");
var logger = require("../Utils/Logger");

var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   'pfg7tm6zrnm22cjc',
    publicKey:    'bwf663qdgns9n55z',
    privateKey:   'f4b52632c8ff7c83bde508f03531dff2'
});

module.exports = function (app, express) {
    var apiRouter = express.Router();

    apiRouter.get("/getToken", function (req, res) {
        gateway.clientToken.generate({ customerId: 520840836 }, function (err, response) {
            if (typeof response !== 'undefined') {
                res.json(utils.responseSuccess(response));
            } else {
                res.json(utils.responseFailure(err.message));
                console.log(err);
            }
        });        
    });

    apiRouter.post("/checkout", async function (req, res) {
        var username = req.body.username;
        var licenseID = req.body.licenseID;
        var nonce = req.body.nonce;                

        try {
            await handleBuyLicense(username, licenseID);
            res.json(utils.responseSuccess("Thanh toán thành công"));
        } catch (error) {        
            logger.log(error);
            res.json(utils.responseFailure(error.message));
        }
    });
    return apiRouter;
}

async function handleBuyLicense(username, licenseID) {
    var promises = [baseDao.findByID(db.Clinic, "username", username), baseDao.findByID(db.License, "licenseID", licenseID)];

    var result = await Promise.all(promises);
    if (result && result.length > 1) {
        clinic = result[0];
        license = result[1];
        if (!clinic || !license) {
            throw new Error("Null Pointer for Clinic or License");
        }

        addExpiryDate(clinic, license);

        var bill = {
            clinicUsername: clinic.username,
            licenseID: license.licenseID,
            startDate: new Date(),
            salePrice: license.price
        }

        var json = {"username": clinic.username, "expiredLicense": clinic.expiredLicense};
        var makeBillPromises = [baseDao.create(db.Bill, bill), baseDao.update(db.Clinic, json, "username")];
        await Promise.all(makeBillPromises);
    }
}

function addExpiryDate(clinic, license) {    
    var expiredLicense = clinic.expiredLicense;
    if (!expiredLicense || expiredLicense < new Date()) {
        var expiredLicense = new Date();
        expiredLicense.setHours(0, 0, 0, 0);
    }
    
    var days = license.duration == null ? 0 : license.duration + 1;
    expiredLicense.setTime(expiredLicense.getTime() + days * 86400000);
    clinic.expiredLicense = expiredLicense;
}
