var myConnect = require("./ConnectDataController.js");
var connectDB = new myConnect("ConnectData");

function makeResponse(success, value, error) {
    var response = {
        "status": success,
        "value": value,
        "error": error
    };
    return response;
}

var usersController = {
    // post method Login
    postUserLogin: function (req, res) {
        var phonePost = req.body.phonenumber;
        var passPost = req.body.password;

        connectDB.pool.getConnection(function (err, connection) {
            if (err) {
                res.json(makeResponse(false, null, "444 No Response"));
                console.log("Connect Error" + err);
                return;
            } else {
                // query to get data
                var queryString = "SELECT * FROM useraccount";
                connectDB.pool.query(queryString, function (err, result, fields) {
                    if (err) {
                        res.json(makeResponse(false, null, "404 Not Found"));
                        console.log("Query Error: " + err);
                        return;
                    }
                    //parse data to json
                    var parseResult = JSON.parse(JSON.stringify(result));
                    var found = false;
                    // check login
                    parseResult.forEach(function (item) {
                        if (found == false) {
                            for (var i = 0; i < parseResult.length; i++) {
                                if (item.phonenumber == phonePost && item.password == passPost) {
                                    var result = {
                                        "PhoneNumber": item.phonenumber,
                                        "UserName": item.username,
                                        "Password": item.password,
                                        "IdNumber": item.idnumber
                                    };
                                    res.json(makeResponse(true, result, null));
                                    connection.release();
                                    found = true;
                                    break;
                                }
                            }
                        }
                    });
                    if (found == false) {
                        res.json(makeResponse(false, null, "400 Bad Request"));
                        connection.release();
                    }
                });
            }
        });
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
};

module.exports = usersController;