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
        var userPost = req.body.username;
        var passPost = req.body.password;
        var phonePost = req.body.phonenumber;

        connectDB.pool.getConnection(function (err, connection) {
            if (err) {
                res.json(makeResponse(false, null, "444 No Response"));
                console.log("Connect Error" + err);
                return;
            } else {
                // query to get data
                var queryString = "SELECT * FROM tbl_user";
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
                                if (item.username == userPost && item.password == passPost) {
                                    var result = {
                                        "UserName": item.username,
                                        "Password": item.password,
                                        "PhoneNumber": item.phoneNumber,
                                        "Role": item.role,
                                        "isActive": item.isActive
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
                        res.json(makeResponse(false, null, 'Username or password is not correct'));
                        connection.release();
                    }
                });
            }
        });
    },
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // post method Register
    postUserRegister: function (req, res) {
        var userPost = req.body.username;
        var passPost = req.body.password;
        var phonePost = req.body.phonenumber;

        connectDB.pool.getConnection(function (err, connection) {
            if (err) {
                res.json(makeResponse(false, null, "444 No Response"));
                console.log("Connect Error" + err);
                return;
            }
            // query check user in database
            var querySearch = 'SELECT * FROM tbl_user WHERE username=?'
            connectDB.pool.query(querySearch, userPost, function (err, results, fields) {
                if (err) {
                    res.json(makeResponse(false, null, "404 Not Found"));
                    connection.release();
                    console.log("Query Error: " + err);
                    return;
                }
                if (results.length > 0) {
                    res.json(makeResponse(false, null, 'Username have been existed!'));
                    connection.release();
                    return;
                } else {
                    var queryInsert = "INSERT INTO tbl_user (username,password,phoneNumber,role,isActive) VALUES ?";
                    var values = [[userPost, passPost, phonePost, 1, 1]];
                    connectDB.pool.query(queryInsert, [values], function (err, results, fields) {
                        if (err) {
                            res.json(makeResponse(false, null, "404 Not Found"));
                            connection.release();
                            console.log("Query Error: " + err);
                            return;
                        }
                        // query search user in database
                        connectDB.pool.query(querySearch, userPost, function (err, results, fields) {
                            if (err) {
                                res.json(makeResponse(false, null, "404 Not Found"));
                                connection.release();
                                console.log("Query Error: " + err);
                                return;
                            }
                            if (results.length > 0) {
                                var results = {
                                    "UserName": results[0].username,
                                    "Password": results[0].password,
                                    "PhoneNumber": results[0].phoneNumber,
                                    "Role": results[0].role,
                                    "isActive": results[0].isActive
                                };
                                res.json(makeResponse(true, results, null));
                                connection.release();
                                return;
                            }
                        });

                    });
                }
            });
        });
    },
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // get method for list user
    getListAllUser: function (req, res) {
        connectDB.pool.getConnection(function (err, connection) {
            if (err) {
                res.json(makeResponse(false, null, "444 No Response"));
                connection.release();
                console.log("Connect Error" + err);
                return;
            }
            // query get list all user
            var querySearch = "SELECT * FROM tbl_user";
            connectDB.pool.query(querySearch, function (err, results, fields) {
                var listResults = [];
                for (var i = 0; i < results.length; i++) {
                    var tmp = {
                        "UserName": results[0].username,
                        "Password": results[0].password,
                        "PhoneNumber": results[0].phoneNumber,
                        "Role": results[0].role,
                        "isActive": results[0].isActive
                    };
                    listResults.push(tmp);
                }
                res.json(makeResponse(true, listResults, null));
            });
        });
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
};

module.exports = usersController;