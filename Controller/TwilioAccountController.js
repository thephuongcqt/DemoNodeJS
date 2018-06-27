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

    apiRouter.post("/createNewTwilio", async function (req, res) {
        var phoneNumber = req.body.phoneNumber;
        var accountSid = req.body.accountSid;
        var authToken = req.body.authToken;
        if(phoneNumber, accountSid, authToken){
            var json = {
                "phoneNumber": phoneNumber,
                "accountSid": accountSid,
                "authToken": authToken
            }
            try {
                var result = await baseDAO.create(db.Twilio, json);
                res.json(utils.responseSuccess("success"));
                return;
            } catch (error) {
                logger.log(error);
                res.json(utils.responseFailure("Duplicate Phone number"))
                return;
            }           
        }
        res.json(utils.responseFailure("An error occured"));
    });

    apiRouter.get("/getTwilios", async function (req, res) {
        try {
            var list = await baseDAO.findAll(db.Twilio);    
            res.json(utils.responseSuccess(list));
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(error.message));
        }    
    });

    return apiRouter;
}