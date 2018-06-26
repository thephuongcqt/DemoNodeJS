var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
const dateFormat = require('dateformat');
var Moment = require('moment');
var baseDAO = require("../DataAccess/BaseDAO");
var logger = require("../Utils/Logger");
var appointmentDao = require("../DataAccess/AppointmentDAO");

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.get("/createNewTwilio", async function (req, res) {
        var phoneNumber = req.body.phoneNumber;
        var accountSid = req.body.accountSid;
    });

    return apiRouter;
}