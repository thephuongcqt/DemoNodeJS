var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var appointmentDao = require("../DataAccess/AppointmentDAO");

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.post("/dateReport", async function (req, res) {
        var startString = req.body.startDate;
        var endString = req.body.endDate;
        var username = req.body.username;
        if (startString && endString && username) {
            try {
                var startDate = new Date(startString);
                var endDate = new Date(endString);
                var list = await appointmentDao.reportByDate(username, startDate, endDate);
                var result = []
                for (var i in list) {
                    var item = list[i];
                    var tmp = {
                        total: item.total,
                        present: item.present,
                        date: utils.parseDate(item.date)
                    }
                    result.push(tmp);
                }
                res.json(utils.responseSuccess(result));
                logger.successLog("dateReport");
            } catch (error) {
                logger.log(error);
                logger.failLog("dateReport", error);
                res.json(utils.responseFailure(error.message));
            }
        } else {
            logger.failLog("dateReport", new Error("Missing parameters"));
            res.json(utils.responseFailure("Missing parameters"));
        }
    });

    apiRouter.post("/monthReport", async function (req, res) {
        var startString = req.body.startDate;
        var endString = req.body.endDate;
        var username = req.body.username;
        if (startString && endString && username) {
            try {
                var startDate = new Date(startString);
                var endDate = new Date(endString);
                var list = await appointmentDao.reportByMonth(username, startDate, endDate);
                res.json(utils.responseSuccess(list));
                logger.successLog("monthReport");
            } catch (error) {
                logger.log(error);
                logger.failLog("monthReport", error);
                res.json(utils.responseFailure(error.message));
            }
        } else {
            logger.failLog("monthReport", new Error("Missing parameters"));
            res.json(utils.responseFailure("Missing parameters"));
        }
    });

    apiRouter.post("/yearReport", async function (req, res) {
        var startString = req.body.startDate;
        var endString = req.body.endDate;
        var username = req.body.username;
        if (startString && endString && username) {
            try {
                var startDate = new Date(startString);
                var endDate = new Date(endString);
                var list = await appointmentDao.reportByYear(username, startDate, endDate);
                res.json(utils.responseSuccess(list));
                logger.successLog("yearReport");
            } catch (error) {
                logger.log(error);
                logger.failLog("yearReport", error);
                res.json(utils.responseFailure(error.message));
            }
        } else {
            logger.failLog("yearReport", new Error("Missing parameters"));
            res.json(utils.responseFailure("Missing parameters"));
        }
    });

    return apiRouter
}