var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var twilioDao = require("../DataAccess/twilioDAO");
var logger = require("../Utils/Logger");
var cloudServices = require("../SpeechToText/CloudServices");

var twilioUtils = {
    announceAppointment: async function (fromPhone, to, message, httpObj) {
        if (httpObj) {
            //booking appointment by a call
            //httpObj contain fields: req, res 
            var clinicPhone = utils.getOnlyNumber(fromPhone);
            var audioUrl = cloudServices.getVoiceFromText(message, clinicPhone);
            var VoiceResponse = require('twilio').twiml.VoiceResponse;
            var twiml = new VoiceResponse();
            twiml.play({
                loop: 2
            }, audioUrl);
            twiml.hangup();
            httpObj.res.end(twiml.toString());
            var sendSMSMethod = () => {
                twilioUtils.sendSMS(fromPhone, to, message);
            }
            setTimeout(sendSMSMethod, 2000);
        } else {
            twilioUtils.sendSMS(fromPhone, to, message);
        }
    },

    sendSMS: async (fromPhone, to, message) => {
        try {
            var client = await twilioDao.getTwilioByPhone(fromPhone);
            if (client) {
                if (to.includes("+1")) {
                    client.messages.create({
                        body: message,
                        from: fromPhone,
                        to: to
                    }).then(messages => {
                    })
                        .catch(function (err) {
                            logger.log(err);
                            this.callToAnnouncement(fromPhone, to, message, client);
                        })
                        .done();
                } else {
                    this.callToAnnouncement(fromPhone, to, message, client);
                }
            } else {
                logger.log(new Error("An error occurred when get twilio account"));
            }
        } catch (error) {
            logger.log(error);            
        }
    },

    callToAnnouncement: async function (fromPhone, toPhone, message, client) {
        try {
            var clinicPhone = utils.getOnlyNumber(fromPhone);
            var audioUrl = await cloudServices.getVoiceFromText(message, clinicPhone, 4000);
            var VoiceResponse = require('twilio').twiml.VoiceResponse;
            var twiml = new VoiceResponse();
            twiml.play({
                loop: 2
            }, audioUrl);
            twiml.hangup();

            var filePath = Const.FilePath + "/" + clinicPhone + new Date().getTime() + ".xml";
            var xmlUrl = Const.HostName + "/" + filePath;
            await utils.writeFile(filePath, twiml.toString());

            if (!client) {
                client = await twilioDao.getTwilioByPhone(fromPhone);
            }
            client.calls
                .create({
                    url: xmlUrl,
                    to: toPhone,
                    from: fromPhone
                })
                .then(call => {
                    logger.log(new Error(JSON.stringify(call)));
                })
                .catch(err => {
                    logger.log(err);
                })
                .done();
        } catch (error) {
            logger.log(error);
        }
    }
}
module.exports = twilioUtils;