var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var twilioDao = {    
    getTwilioByID: async function(accountSid){
        var users = await dao.findByProperties(db.Twilio, {"accountSid": accountSid});
        if(users && users.length > 0){
            return this.getTwilioAccount(users[0].accountSid, users[0].authToken);
        }
        throw new Error("Cannot find twilio by accountSid: " + accountSid);
    },

    getTwilioByPhone: async function(phoneNumber){
        phoneNumber = phoneNumber.trim();
        if(!phoneNumber.includes("+")){
            phoneNumber = "+" + phoneNumber;
        }
        var user = await dao.findByID(db.Twilio, "phoneNumber", phoneNumber);
        if(user){
            return this.getTwilioAccount(user.accountSid, user.authToken);
        }
        throw new Error("Cannot find twilio by phoneNumber: " + phoneNumber);
    },

    getTwilioAccount: function(accountSid, authToken){
        try {
            var account = require('twilio')(accountSid, authToken);    
            return account;
        } catch (error) {
            logger.log(error);
            return null;
        }
    }
}
module.exports = twilioDao;