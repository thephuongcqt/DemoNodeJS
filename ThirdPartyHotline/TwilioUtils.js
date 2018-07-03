var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var twilioDao = require("../DataAccess/twilioDAO");
var logger = require("../Utils/Logger");

var utils = {
    sendSMS: async function (fromPhone, to, message) {
        var client = await twilioDao.getTwilioByPhone(fromPhone);
        if (client) {
            client.messages.create({
                body: message,
                from: fromPhone,
                to: to
            }).then(messages => {
            })
                .catch(function (err) {
                    logger.log(err);
                })
                .done();
        } else {
            logger.log(new Error("An error occurred when get twilio account"));
        }
    }
}
module.exports = utils;