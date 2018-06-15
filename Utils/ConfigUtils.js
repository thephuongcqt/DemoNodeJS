var fs = require('fs');
var filePath = "./AppConfig/config.txt";

function getConfigJson(){
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getTwilioAccount(accountSid, authToken){
    return require('twilio')(accountSid, authToken);
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
        console.log(twilio);
        return getTwilioAccount(twilio.accountSid, twilio.authToken);
    }, 
    getTwilioByID: function(id){
        var config = getConfigJson();
        var twilios = config.twilios;
        for(var i in twilios){            
            if(twilios[i].accountSid.trim() === id.trim()){
                console.log(twilios[i]);
                return getTwilioAccount(twilios[i].accountSid, twilios[i].authToken);
            }
        }
        return null;
    }
};
module.exports = config;