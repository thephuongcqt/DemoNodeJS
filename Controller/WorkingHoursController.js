var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var Moment = require('moment');
var logger = require("../Utils/Logger");
var baseDAO = require("../DataAccess/BaseDAO");
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
                logger.log(err);
            });
    });

    // update one working hours for apply dates
    apiRouter.post("/update", async function (req, res) {
        var username = req.body.username;
        var startWorking = req.body.startWorking;
        var endWorking = req.body.endWorking;
        var parseStartWorking = utils.parseTime(req.body.startWorking);
        var parseEndWorking = utils.parseTime(req.body.endWorking);
        var applyDates = req.body.applyDate;
        var isDayOff = req.body.isDayOff;
        var checkStartWorking = utils.getMomentTime(parseStartWorking).isValid();
        var checkEndWorking = utils.getMomentTime(parseEndWorking).isValid();
        if (checkStartWorking == false) {
            parseStartWorking = undefined;
        }
        if (checkEndWorking == false) {
            parseEndWorking = undefined;
        }
        try {
            if (!applyDates) {
                res.json(utils.responseFailure("Vui lòng chọn ngày áp dụng"));
            } else {
                for (var i in applyDates) {
                    var applyDate = applyDates[i];
                    if (!isNaN(applyDate)) {
                        workingHoursDAO.updateWorkingHour(username, applyDate, parseStartWorking, parseEndWorking, isDayOff);
                    }
                }
                var resultUpdate = await getWorkingHours(username);
                res.json(utils.responseSuccess(resultUpdate));
            }
        }
        catch (err) {
            res.json(utils.responseFailure(err));
            logger.log(err);
        }
    });
    // update working hours with all apply date
    apiRouter.post("/updateAll", async function (req, res) {
        var username = req.body.username;
        var listValue = req.body.values;
        var examinationDuration = req.body.examinationDuration;
        var isDayOff = Const.DAYWORK;
        // var listValue = [{
        //     "startWorking": "08:00:00 AM",
        //     "endWorking": "8:00:00 PM",
        //     "applyDate": 1
        // },
        // {
        //     "startWorking": "08:00:00 AM",
        //     "endWorking": "10:00:00 PM",
        //     "applyDate": 0
        // }];
        try {
            if (req.body.examinationDuration) {
                examinationDuration = utils.parseTime(req.body.examinationDuration);
                var checkDuration = utils.getMomentTime(examinationDuration).isValid();
                if (checkDuration == true) {
                    if (examinationDuration == "00:00:00") {
                        res.json(utils.responseFailure("Thời lượng khám không chính xác"));
                        return;
                    }
                    var jsonDuration = { "username": username };
                    jsonDuration.examinationDuration = examinationDuration;
                    await baseDAO.update(db.Clinic, jsonDuration, "username");
                }
            }
            if (listValue == null) {
                res.json(utils.responseFailure("Vui lòng nhập giờ làm việc"));
                return;
            } else {
                if (listValue.length > 0) {
                    for (var i = 0; i < listValue.length; i++) {
                        var applyDate = listValue[i].applyDate;
                        if (isNaN(applyDate)) {
                            logger.log(applyDate);
                        } else {
                            var startWorking = listValue[i].startWorking;
                            var parseStartWorking = utils.parseTime(startWorking);
                            var checkStartWorking = utils.getMomentTime(parseStartWorking).isValid();
                            var endWorking = listValue[i].endWorking;
                            var parseEndWorking = utils.parseTime(endWorking);
                            var checkEndWorking = utils.getMomentTime(parseEndWorking).isValid();
                            if (isNaN(applyDate) || checkStartWorking == false || checkEndWorking == false) {
                                applyDate = undefined;
                                parseEndWorking = undefined;
                                parseStartWorking = undefined;
                                isDayOff = undefined;
                            }
                            if (!isNaN(applyDate)) {
                                await workingHoursDAO.updateWorkingHours(username, applyDate, parseStartWorking, parseEndWorking, isDayOff);
                            }
                        }
                    }
                }
                var resultUpdate = await getWorkingHours(username);
                for (var j in resultUpdate) {
                    var getResult = resultUpdate[j];
                    if (!getResult.startWorking || !getResult.endWorking) {
                        parseStartWorking = Const.DefaultStartWorking;
                        parseEndWorking = Const.DefaultEndWorking;
                        isDayOff = Const.DAYOFF;
                        applyDate = getResult.applyDate;
                        await workingHoursDAO.updateWorkingHours(username, applyDate, parseStartWorking, parseEndWorking, isDayOff);
                    }
                }
                resultUpdate = await getWorkingHours(username);
                res.json(utils.responseSuccess(resultUpdate));
            }
        }
        catch (err) {
            res.json(utils.responseFailure(err));
            logger.log(err);
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