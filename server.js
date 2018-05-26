var express = require("express");
var app = express();
var userController = require("./Controller/UserController")(app, express);
var userDB = require("./Controller/UserDBController");
var twilioController = require("./Controller/TwilioController")(app, express);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use("/api", userController);
app.use("/twilio", twilioController);

app.route("/userDB").get(userDB.getAll);
app.route("/getUserDB").get(userDB.getUserDB);
app.route("/test").get(userDB.demo);

app.use("/", function(req, res){
    res.json({
        "username": "PhuongNT",
        "password": "blank"
    });
});

var server = app.listen(process.env.PORT || 8080, function(){
});