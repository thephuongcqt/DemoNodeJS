var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
module.exports = function (app, express) {
    apiRouter = express.Router();
    // get working hours
    apiRouter.get("/getworkinghours", function (req, res) {
        var username = req.query.username;
        new db.User({ "username": username })
            .fetch({ withRelated: ["clinic"] })
            .then(function (model) {
                if (model == null) {
                    res.json(utils.makeResponse(false, null, "This clinic is not exist!"));
                } else {
                    var clinic = model.toJSON();
                    new db.Clinic({ "username": username })
                        .fetch({ withRelated: ["workingHours"] })
                        .then(function (model) {
                            if (model == null) {
                                res.json(utils.makeResponse(false, null, "This clinic is not exist!"));
                            } else {
                                var workingHours = model.toJSON();
                                var workingHoursList = [];
                                for (var i in workingHours.workingHours) {
                                    var workList = workingHours.workingHours[i];
                                    workingHoursList.push(workList);
                                }
                                var responseObj = utils.makeResponse(true, workingHoursList, null);
                                res.json(responseObj);
                            }
                        })
                        .catch(function (err) {
                            var responseObj = utils.makeResponse(false, null, err);
                            res.json(responseObj);
                        });
                }
            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, null, err);
                res.json(responseObj);
            });
    });
    
    // update working hours
    apiRouter.post("/update", function (req, res) {
        var username = req.body.username;
        var starWorking = req.body.starWorking;
        var endWorking = req.body.endWorking;
        var applyDate = req.body.applyDate;
        var isDayOff = req.body.isDayOff;
        new db.User({ "username": username })
            .fetch({ withRelated: ["clinic"] })
            .then(function (model) {
                if (model == null) {
                    res.json(utils.makeResponse(false, null, "This clinic is not exist!"));
                } else {
                    var clinic = model.toJSON();
                    new db.Clinic({ "username": username })
                        .fetch({ withRelated: ["workingHours"] })
                        .then(function (model) {
                            if (model == null) {
                                res.json(utils.makeResponse(false, null, "This clinic is not exist!"));
                            } else {
                                db.WorkingHours.where({ "clinicUsername": username })
                                    .save({ "starWorking": starWorking, "endWorking": endWorking, "applyDate": applyDate, "isDayOff": isDayOff }, { patch: true })
                                    .then(function (model) {
                                        res.json(utils.makeResponse(true, model.toJSON(), null));
                                    })
                                    .catch(function (err) {
                                        var responseObj = utils.makeResponse(false, null, err);
                                        res.json(responseObj);
                                    });
                            }
                        })
                        .catch(function (err) {
                            var responseObj = utils.makeResponse(false, null, err.message);
                            res.json(responseObj);
                        });
                }
            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, null, err.message);
                res.json(responseObj);
            });
    });
    return apiRouter;
};