var express = require("express");
var app = express();
var userController = require("./Controller/UserController")(app, express);
var userDB = require("./Controller/UserDBController");

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