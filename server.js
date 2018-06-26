var express = require("express");
var app = express();
var userController = require("./Controller/UserController")(app, express);
var twilioController = require("./ThirdPartyHotline/TwilioController")(app, express);
var clinicController = require("./Controller/ClinicController")(app, express);
var workController = require("./Controller/WorkingHoursController")(app, express);
var licenseController = require("./Controller/LicenseController")(app, express);
var paypalController = require("./Payment/Paypal")(app, express);
var appointmentController = require("./Controller/AppointmentController")(app, express);
var authenticationController = require("./Controller/AuthenticationController")(app, express);
// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
/////////////////////////////////////////////////////////////////////////

// parse request to json
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
/////////////////////////////////////////////////////////////////////////
// route to Appointment Controller
app.use("/appointment", appointmentController);
// route to Clinic Controller
app.use("/clinic", clinicController);
// route to User Controller
app.use("/user", userController);
// route to Twilio Controller
app.use("/twilio", twilioController);
// route to Working Hours Controller
app.use("/work", workController);
// route to License Controller
app.use("/license", licenseController);
// route to Paypal Controller 
app.use("/paypal", paypalController);
// route to authentication Controller 
app.use("/authen", authenticationController);
//////////////////////////////////////////////////////////////////////

app.use("/", function(req, res){
    res.json({
        "success": false,
        "value": null,
        "error": "Someting went wrong!!! this is a default route"
    });
});

var server = app.listen(process.env.PORT || 8080, function(){
});
