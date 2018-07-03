var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var appointmentDao = require("../DataAccess/AppointmentDAO");

module.exports = function (app, express) {
    apiRouter = express.Router();    

    apiRouter.post("/dateReport", async function(req, res){
        var startString = req.body.startDate;
        var endString = req.body.endDate;
        var username = req.body.username;
        if (startString && endString && username){
            try {
                var startDate = new Date(startString);
                var endDate = new Date(endString);
                var list = await appointmentDao.reportByDate(username, startDate, endDate);
                res.json(utils.responseSuccess(list));
            } catch (error) {
                logger.log(error); 
                res.json(utils.responseFailure(error.message));
            }
        } else{
            res.json(utils.responseFailure("Missing parameters"));
        }
    });

    apiRouter.post("/monthReport", async function(req, res){
        var startString = req.body.startDate;
        var endString = req.body.endDate;
        var username = req.body.username;
        if (startString && endString && username){
            try {
                var startDate = new Date(startString);
                var endDate = new Date(endString);
                var list = await appointmentDao.reportByMonth(username, startDate, endDate);
                res.json(utils.responseSuccess(list));
            } catch (error) {
                logger.log(error); 
                res.json(utils.responseFailure(error.message));
            }
        } else{
            res.json(utils.responseFailure("Missing parameters"));
        }
    });

    apiRouter.post("/yearReport", async function(req, res){
        var startString = req.body.startDate;
        var endString = req.body.endDate;
        var username = req.body.username;
        if (startString && endString && username){
            try {
                var startDate = new Date(startString);
                var endDate = new Date(endString);
                var list = await appointmentDao.reportByYear(username, startDate, endDate);
                res.json(utils.responseSuccess(list));
            } catch (error) {
                logger.log(error); 
                res.json(utils.responseFailure(error.message));
            }
        } else{
            res.json(utils.responseFailure("Missing parameters"));
        }
    });

    return apiRouter
}