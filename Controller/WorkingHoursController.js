var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var Moment = require('moment');
var logger = require("../Utils/Logger");

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
                            logger.log(err.message, "getworkinghours");
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "getworkinghours");
            });
    });

    // update working hours with one apply date
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
                                    if (!isNaN(applyDate)) {
                                        db.WorkingHours.where({ "clinicUsername": username, "applyDate": applyDate })
                                            .save({ "startWorking": parseStartWorking, "endWorking": parseEndWorking, "isDayOff": isDayOff }, { patch: true });
                                    }
                                }
                                db.WorkingHours.where({ "clinicUsername": username })
                                    .fetchAll()
                                    .then(function (collection) {
                                        var workingHours = collection.toJSON();
                                        var workingList = [];
                                        for (var i in workingHours) {
                                            var workList = workingHours[i];
                                            workingList.push(workList);
                                            delete workList.id;
                                            delete workList.clinicUsername;
                                        }
                                        res.json(utils.responseSuccess(workingList));
                                    })
                                    .catch(function (err) {
                                        res.json(utils.responseFailure(err.message));
                                    });
                            }
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                            logger.log(err.message, "update", "WorkingHoursController");
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "update", "WorkingHoursController");
            });
    });
    // update working hours with all apply date
    apiRouter.post("/updateAll", async function (req, res) {
        var username = req.body.username;
        var startWorkings = req.body.startWorking.split(",");
        var endWorkings = req.body.endWorking.split(",");
        var applyDates = req.body.applyDate;
        var isDayOffs = req.body.isDayOff;
        await new db.User({ "username": username })
            .fetch({ withRelated: ["clinic"] })
            .then(async function (model) {
                if (model == null) {
                    res.json(utils.responseFailure("This clinic is not exist!"));
                } else {
                    var clinic = model.toJSON();
                    delete clinic.password;
                    await new db.Clinic({ "username": username })
                        .fetch({ withRelated: ["workingHours"] })
                        .then(async function (model) {
                            if (model == null) {
                                res.json(utils.responseFailure("This clinic is not exist!"));
                            } else {
                                var listApplyDate = [];
                                for (var i in applyDates) {
                                    var applyDate = applyDates[i];
                                    if (!isNaN(applyDate)) {
                                        listApplyDate.push(applyDate);
                                    }
                                }
                                var listIsDayOff = [];
                                for (var i in isDayOffs) {
                                    var isDayOff = isDayOffs[i];
                                    if (!isNaN(isDayOff)) {
                                        listIsDayOff.push(isDayOff);
                                    }
                                }
                                for (var j = 0; j < listApplyDate.length; j++) {
                                    var parseStartWorking = Moment(startWorkings[j], "h:mm:ss A").format("HH:mm:ss");
                                    var parseEndWorking = Moment(endWorkings[j], "h:mm:ss A").format("HH:mm:ss");
                                    var apply = listApplyDate[j];
                                    var dayOff = listIsDayOff[j];
                                    await db.WorkingHours.where({ "clinicUsername": username, "applyDate": apply })
                                        .save({ "startWorking": parseStartWorking, "endWorking": parseEndWorking, "isDayOff": dayOff }, { patch: true });
                                }
                            }
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err.message));
                            logger.log(err.message, "update", "WorkingHoursController");
                        });

                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err.message, "update", "WorkingHoursController");
            });
        await db.WorkingHours.where({ "clinicUsername": username })
            .fetchAll()
            .then(function (collection) {
                var workingHours = collection.toJSON();
                var workingList = [];
                for (var i in workingHours) {
                    var workList = workingHours[i];
                    workingList.push(workList);
                    delete workList.id;
                    delete workList.clinicUsername;
                }
                console.log(workingList);
                res.json(utils.responseSuccess(workingList));
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err.message));
            });
    });
    return apiRouter;
};