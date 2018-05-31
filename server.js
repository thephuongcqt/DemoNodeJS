var express = require("express");
var app = express();
var userController = require("./Controller/UserController")(app, express);
var userDB = require("./Controller/UserDBController");
var twilioController = require("./Controller/TwilioController")(app, express);

/////////////////////////////////////////////////////////////////////////
// require to UsersController
var usersController = require("./Controller/UsersController");
// require to AppointmentController
var appointmentController = require("./Controller/AppointmentController");
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
app.route("/makeAppointment").post(appointmentController.postMakeAppointment);
// get request for client get list an appointment
app.route("/getListAppointment").get(appointmentController.getListAllAppointment);
//////////////////////////////////////////////////////////////////////

app.use("/api", userController);
app.route("/userDB").get(userDB.getAll);
app.route("/getUserDB").get(userDB.getUserDB);



app.use("/", function(req, res){
    res.json({
        "username": "PhuongNT",
        "password": "blank"
    });
});

var server = app.listen(process.env.PORT || 3000, function(){
});