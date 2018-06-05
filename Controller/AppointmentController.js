var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.get("/getAll", function (req, res) {
        db.Appointment.forge()
            .fetchAll()
            .then(function (collection) {
                var responseObj = utils.makeResponse(true, collection.toJSON(), false);
                res.json(responseObj);
            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, err.message, true);
                res.json(responseObj);
            });
    });

    apiRouter.get("/findAppointmentForClinic", function (req, res) {
        var username = req.query.username;
        new db.Clinic({ "username": username })
            .fetch({ withRelated: ["appointments"] })
            .then(function (model) {
                var clinic = model.toJSON();
                res.json(utils.makeResponse(true, clinic, null));
            })
            .catch(function (err) {
                console.log(err);
            })
    });

    return apiRouter;
}
