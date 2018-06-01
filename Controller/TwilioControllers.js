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
    getReceiveSMS: function (req, res) {
        console.log(req.body);
    }
}
module.exports = twilioController;