var fs = require('fs');
var logger = require("./Logger");
var filePath = "./AppConfig/config.txt";

function getConfigJson(){
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

var config = {
    getTestNumbers: function(){
        var config = getConfigJson();
        return config.testNumbers;
    },
    getRandomNumbers: function(){
        var config = getConfigJson();
        return config.randomNumbers;
    },
    getTwilioByPhone: function(phoneNumber){
        var config = getConfigJson();
        var twilios = config.twilios;
        var twilio = twilios[phoneNumber];        
        return this.getTwilioAccount(twilio.accountSid, twilio.authToken);
    }, 
    getTwilioByID: function(id){
        var config = getConfigJson();
        var twilios = config.twilios;
        for(var i in twilios){            
            if(twilios[i].accountSid.trim() === id.trim()){                
                return this.getTwilioAccount(twilios[i].accountSid, twilios[i].authToken);
            }
        }
        return null;
    },
    getDefaultTwilio: function(){
        var config = getConfigJson();
        var defaultTwilio = config.defaultTwilio;
        return this.getTwilioAccount(defaultTwilio.accountSid, defaultTwilio.authToken);
    },

    getTwilioAccount: function(accountSid, authToken){
        try {
            var account = require('twilio')(accountSid, authToken);    
            return account;
        } catch (error) {
            logger.log(error.message);
            return null;
        }    
    },

    getDefaultGreetingURL: function(){
        var config = getConfigJson();
        return config.defaultGreetingURL;
    }
};
module.exports = config;