var express = require("express");
var app = express();

app.use("/", function(req, res){
    res.json({
        "username": "PhuongNT",
        "password": "blank"
    });
});

var server = app.listen(8080, function(){
});