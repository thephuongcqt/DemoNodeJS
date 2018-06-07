var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");

module.exports = function (app, express) {
    apiRouter = express.Router();
    // get All lincese
    apiRouter.get("/getAllLicense", function (req, res) {
        new db.License()
            .fetchAll()
            .then(function (collection) {
                res.json(utils.responseSuccess(collection.toJSON()));
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
            })
    });
    // create license
    apiRouter.post("/create", function (req, res) {
        new db.License()
            .save({ "price": req.body.price, "duration": req.body.duration, "name": req.body.name, "description": req.body.description })
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
                        .save({ "price": req.body.price, "duration": req.body.duration, "name": req.body.name, "description": req.body.description }, { patch: true })
                        .then(function (collection) {
                            res.json(utils.responseFailure(collection));
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
            });
    });
    return apiRouter;
}