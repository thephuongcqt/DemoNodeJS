var express = require("express");
var app = express();
var userController = require("./Controller/UserController")(app, express);
var userDB = require("./Controller/UserDBController");
var twilioController = require("./Controller/TwilioController")(app, express);
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
// require to UsersController
var usersController = require("./Controller/UsersController");
// require to AppointmentController
var appointmentController = require("./Controller/AppointmentController");
// require to AppointmentController
var twilioControllers = require("./Controller/TwilioControllers");
// parse request to json
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
// post request for client login
app.route("/postUserLogin").post(usersController.postUserLogin);
// post request for client register
app.route("/postUserRegister").post(usersController.postUserRegister);
// get request for client get list user
app.route("/getListUser").get(usersController.getListAllUser);
// post request for client make an appointment
app.route("/postMakeAppointment").post(appointmentController.postMakeAppointment);
// get request for client get list an appointment
app.route("/getListAppointment").get(appointmentController.getListAllAppointment);
// post request for server get message
app.route("/message").post(twilioControllers.postReceiveSMS);
// post request for server get voice
app.route("/voice").post(twilioControllers.postReceiveVoice);
// post request for server get voice
app.route("/record").post(twilioControllers.postReceiveRecord);
//////////////////////////////////////////////////////////////////////

app.use("/twilio", twilioController);
app.use("/user", userController);
app.route("/userDB").get(userDB.getAll);
app.route("/getUserDB").get(userDB.getUserDB);



app.use("/", function(req, res){
    res.json({
        "username": "PhuongNT",
        "password": "blank"
    });
});

var server = app.listen(process.env.PORT || 8080, function(){
});
