var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var Moment = require('moment');
var logger = require("../Utils/Logger");
var workingHoursDAO = require("../DataAccess/WokingHoursDAO");

module.exports = function (app, express) {
    apiRouter = express.Router();

    // get working hours
    apiRouter.get("/getWorkingHours", function (req, res) {
        getWorkingHours(req.query.username)
            .then(function (results) {
                res.json(utils.responseSuccess(results));
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err, "getWorkingHours", "WorkingHoursController");
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
        getWorkingHours(username)
            .then(function (results) {
                if (applyDates == null) {
                    res.json(utils.responseFailure("Vui lòng chọn ngày áp dụng"));
                } else {
                    for (var i in applyDates) {
                        var applyDate = applyDates[i];
                        if (!isNaN(applyDate)) {
                            workingHoursDAO.updateWorkingHour(username, applyDate, parseStartWorking, parseEndWorking, isDayOff)
                                .catch(function (err) {
                                    res.json(utils.responseFailure(err));
                                    logger.log(err, "update", "WorkingHoursController");
                                });
                        }
                    }
                    getWorkingHours(username)
                        .then(function (result) {
                            res.json(utils.responseSuccess(result));
                        })
                        .catch(function (err) {
                            res.json(utils.responseFailure(err));
                            logger.log(err, "update", "WorkingHoursController");
                        });
                }
            })
            .catch(function (err) {
                res.json(utils.responseFailure(err));
                logger.log(err, "update", "WorkingHoursController");
            });
    });
    // update working hours with all apply date
    apiRouter.post("/updateAll", async function (req, res) {
        var username = req.body.username;
        var listValue = req.body.values;
        // var listValue = [{
        //     "startWorking": "08:00:00 AM",
        //     "endWorking": "8:00:00 PM",
        //     "applyDate": 1
        // },
        // {
        //     "startWorking": "09:00:00 AM",
        //     "endWorking": "9:00:00 PM",
        //     "applyDate": 0
        // }];
        if (listValue == null) {
            res.json(utils.responseFailure("Vui lòng nhập giờ làm việc"));
        } else {
            if (listValue.length > 0) {
                for (var i = 0; i < listValue.length; i++) {
                    var applyDate = listValue[i].applyDate;
                    var startWorking = listValue[i].startWorking;
                    var parseStartWorking = Moment(startWorking, "h:mm:ss A").format("HH:mm:ss");
                    var endWorking = listValue[i].endWorking;
                    var parseEndWorking = Moment(endWorking, "h:mm:ss A").format("HH:mm:ss");
                    workingHoursDAO.updateWorkingHours(username, applyDate, parseStartWorking, parseEndWorking)
                        .catch(function (err) {
                            res.json(utils.responseFailure(err));
                            logger.log(err, "update", "WorkingHoursController");
                        });
                }
            }
            await getWorkingHours(username)
                .then(function (result) {
                    res.json(utils.responseSuccess(result));
                })
                .catch(function (err) {
                    res.json(utils.responseFailure(err));
                    logger.log(err, "update", "WorkingHoursController");
                });
        }
    });
    return apiRouter;
};
function getWorkingHours(username) {
    return new Promise((resolve, reject) => {
        workingHoursDAO.getWorkingHours(username)
            .then(function (results) {
                var workingHoursList = [];
                for (var i in results.workingHours) {
                    var workingHour = results.workingHours[i];
                    delete workingHour.id;
                    delete workingHour.clinicUsername;
                    workingHoursList.push(workingHour);
                }
                workingHoursList.sort(function (a, b) {
                    return a.applyDate - b.applyDate;
                });
                resolve(workingHoursList);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}