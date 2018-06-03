var utils = require("./Utils");
var db = require("./DBUtils");

module.exports = function (app, express) {
    var apiRouter = express.Router();

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
                    responseObj = utils.makeResponse(true, collection.toJSON(), null);
                }
                res.json(responseObj)
            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, err.message, null);
                res.json(responseObj);
            });

    });
    apiRouter.get("/getAll", function (req, res) {
        db.User.forge()
            .fetchAll()
            .then(function (collection) {
                var responseObj = utils.makeResponse(true, collection.toJSON(), false);
                res.json(responseObj)
            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, err.message, true);
                res.json(responseObj);
            });
    });
    return apiRouter;
};