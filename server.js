var express = require("express");
var app = express();
var userController = require("./Controller/UserController")(app, express);
var userDB = require("./Controller/UserDBController");

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
// post request for client connect UsersController
app.route("/postUserLogin").post(usersController.postUserLogin);
// posy request for client make an appointment
app.route("/makeAppointment").post(appointmentController.postAppointment);
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

var server = app.listen(process.env.PORT || 8080, function(){
});