var myConnect = require("./ConnectDataController.js");
var connectDB = new myConnect("ConnectData");
var utils = require("./Utils");

var usersController = {
    // post method Login
    postUserLogin: function (req, res) {
        var userPost = req.body.username;
        var passPost = req.body.password;
        var phonePost = req.body.phonenumber;

        connectDB.pool.getConnection(function (err, connection) {
            if (err) {
                res.json(utils.makeResponse(false, null, "444 No Response"));
                console.log("Connect Error" + err);
                return;
            } else {
                // query to get data
                var queryString = "SELECT * FROM tbl_user";
                connectDB.pool.query(queryString, function (err, result, fields) {
                    if (err) {
                        res.json(utils.makeResponse(false, null, "404 Not Found"));
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
                                        "userName": item.username,
                                        "password": item.password,
                                        "phoneNumber": item.phoneNumber,
                                        "role": item.role,
                                        "isActive": item.isActive
                                    };
                                    res.json(utils.makeResponse(true, result, null));
                                    connection.release();
                                    found = true;
                                    break;
                                }
                            }
                        }
                    });
                    if (found == false) {
                        res.json(utils.makeResponse(false, null, 'Username or password is not correct'));
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
                res.json(utils.makeResponse(false, null, "444 No Response"));
                console.log("Connect Error" + err);
                return;
            }
            // query check user in database
            var querySearch = 'SELECT * FROM tbl_user WHERE username=?'
            connectDB.pool.query(querySearch, userPost, function (err, results, fields) {
                if (err) {
                    res.json(utils.makeResponse(false, null, "404 Not Found"));
                    connection.release();
                    console.log("Query Error: " + err);
                    return;
                }
                if (results.length > 0) {
                    res.json(utils.makeResponse(false, null, 'Username have been existed!'));
                    connection.release();
                    return;
                } else {
                    var queryInsert = "INSERT INTO tbl_user (username,password,phoneNumber,role,isActive) VALUES ?";
                    var values = [[userPost, passPost, phonePost, 1, 1]];
                    connectDB.pool.query(queryInsert, [values], function (err, results, fields) {
                        if (err) {
                            res.json(utils.makeResponse(false, null, "404 Not Found"));
                            connection.release();
                            console.log("Query Error: " + err);
                            return;
                        }
                        // query search user in database
                        connectDB.pool.query(querySearch, userPost, function (err, results, fields) {
                            if (err) {
                                res.json(utils.makeResponse(false, null, "404 Not Found"));
                                connection.release();
                                console.log("Query Error: " + err);
                                return;
                            }
                            if (results.length > 0) {
                                var results = {
                                    "userName": results[0].username,
                                    "password": results[0].password,
                                    "phoneNumber": results[0].phoneNumber,
                                    "role": results[0].role,
                                    "isActive": results[0].isActive
                                };
                                res.json(utils.makeResponse(true, results, null));
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
                res.json(utils.makeResponse(false, null, "444 No Response"));
                connection.release();
                console.log("Connect Error" + err);
                return;
            }
            // query get list all user
            var querySearch = "SELECT * FROM tbl_user";
            connectDB.pool.query(querySearch, function (err, results, fields) {
                var listResults = [];
                if (results.length > 0) {
                    for (var i = 0; i < results.length; i++) {
                        var tmp = {
                            "userName": results.username,
                            "password": results.password,
                            "phoneNumber": results.phoneNumber,
                            "role": results.role,
                            "isActive": results.isActive
                        };
                        listResults.push(tmp);
                    }
                    res.json(utils.makeResponse(true, listResults, null));
                    connection.release();
                    return;
                } else {
                    res.json(utils.makeResponse(true, null, 'List User is empty'));
                    connection.release();
                    return;
                }

            });
        });
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
};

module.exports = usersController;