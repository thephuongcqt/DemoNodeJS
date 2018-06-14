var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var Moment = require('moment');
module.exports = function (app, express) {
    apiRouter = express.Router();
    // get working hours
    apiRouter.get("/getworkinghours", function (req, res) {
        var username = req.query.username;
        new db.User({ "username": username })
            .fetch({ withRelated: ["clinic"] })
            .then(function (model) {
                if (model == null) {
                    res.json(utils.responseFailure("This clinic is not exist!"));
                } else {
                    var clinic = model.toJSON();
                    new db.Clinic({ "username": username })
                        .fetch({ withRelated: ["workingHours"] })
                        .then(function (model) {
                            if (model == null) {
                                res.json(utils.responseFailure("This clinic is not exist!"));
                            } else {
                                var workingHours = model.toJSON();
                                var workingHoursList = [];
                                for (var i in workingHours.workingHours) {
                                    var workList = workingHours.workingHours[i];
                                    workingHoursList.push(workList);
                                    delete workList.id;
                                    delete workList.clinicUsername;
                                }
                                res.json(utils.responseSuccess(workingHoursList));
                            }
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

    // update working hours
    apiRouter.post("/update", function (req, res) {
        var username = req.body.username;
        var startWorking = req.body.startWorking;
        var endWorking = req.body.endWorking;
        var parseStartWorking = Moment(startWorking, "h:mm:ss A").format("HH:mm:ss");
        var parseEndWorking = Moment(endWorking, "h:mm:ss A").format("HH:mm:ss");
        var applyDates = req.body.applyDate;
        var isDayOff = req.body.isDayOff;
        new db.User({ "username": username })
            .fetch({ withRelated: ["clinic"] })
            .then(function (model) {
                if (model == null) {
                    res.json(utils.responseFailure("This clinic is not exist!"));
                } else {
                    var clinic = model.toJSON();
                    delete clinic.password;
                    new db.Clinic({ "username": username })
                        .fetch({ withRelated: ["workingHours"] })
                        .then(function (model) {
                            if (model == null) {
                                res.json(utils.responseFailure("This clinic is not exist!"));
                            } else {
                                for (var i in applyDates) {
                                    var applyDate = applyDates[i];
                                    db.WorkingHours.where({ "clinicUsername": username, "applyDate": applyDate })
                                        .save({ "startWorking": parseStartWorking, "endWorking": parseEndWorking, "isDayOff": isDayOff }, { patch: true });
                                }
                                db.WorkingHours.where({ "clinicUsername": username })
                                    .fetch()
                                    .then(function (collection) {
                                        var workingHours = model.toJSON();
                                        var workingHoursList = [];
                                        for (var i in workingHours.workingHours) {
                                            var workList = workingHours.workingHours[i];
                                            workingHoursList.push(workList);
                                            delete workList.id;
                                            delete workList.clinicUsername;
                                        }
                                        res.json(utils.responseSuccess(workingHoursList));
                                    })
                                    .catch(function (err) {
                                        res.json(utils.responseFailure(err.message));
                                    });

                            }
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
};