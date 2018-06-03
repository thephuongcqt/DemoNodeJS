var db = require("./DBUtils");
var utils = require("./Utils");

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.post("/changeInformation", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var address = req.body.address;
        var clinicName = req.body.clinicName;
        db.User.where({ "username": username, "password": password })
            .fetch()
            .then(function (collection) {
                if (collection == null) {
                    var responseObj = utils.makeResponse(false, false, "Incorrect username or password");
                    res.json(responseObj);
                } else {
                    db.Clinic.where({ "username": username })
                        .save({ "address": address, "clinicName": clinicName }, { patch: true })
                        .then(function (model) {
                            res.json(utils.makeResponse(true, null, null));
                        })
                        .catch(function (err) {
                            var responseObj = utils.makeResponse(false, false, err);
                            res.json(responseObj);
                        });
                }
            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, false, "Incorrect username or password");
                res.json(responseObj);
            });
    });

    return apiRouter;
}
