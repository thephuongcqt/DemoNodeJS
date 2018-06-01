const twilioConnect = require('./ConnectTwilioController');

function makeResponse(success, value, error) {
    var response = {
        "status": success,
        "value": value,
        "error": error
    };
    return response;
}

var twilioController = {
    // receice SMS from twilio
    postReceiveSMS: function (req, res) {
        console.log(req.body.From); 
        console.log(req.body.Body);
    }
}
module.exports = twilioController;