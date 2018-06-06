var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");

module.exports = function (app, express) {
    apiRouter = express.Router();
    // get working hours
    apiRouter.get("/getAllLicense", function (req, res) {
        new db.License()
        .fetchAll()
        .then(function(collection){
            res.json(utils.responseSuccess(collection.toJSON()));
        })
        .catch(function(err){
            res.json(utils.responseFailure(err.message));
        })
    });

    return apiRouter;
}