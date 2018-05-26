var myConnect = require("./ConnectDataController");
var connectDB = new myConnect("ConnectData");
var dateFormat = require('dateformat');

function makeResponse(success, value, error) {
    var response = {
        "status": success,
        "value": value,
        "error": error
    };
    return response;
}


var appointmentController = {
    // post method for make an appointment
    postAppointment: function (req, res) {
        var phonePost = req.body.phonenumber;
        var namePost = req.body.fullname;
        var departPost = req.body.department;
        connectDB.pool.getConnection(function (err, connection) {
            if (err) {
                res.json(makeResponse(false, null, "444 No Response"));
                connection.release();
                console.log("Connect Error" + err);
                return;
            }
            // query check appointment
            var querySearch = "SELECT * FROM appointment WHERE phonenumber=? AND fullname=?";
            connectDB.pool.query(querySearch, [phonePost, namePost], function (err, result, fields) {
                if (err) {
                    res.json(makeResponse(false, null, "404 Not Found"));
                    connection.release();
                    console.log("Query Error: " + err);
                    return;
                }
                console.log(result);
                if (result.length > 0) {
                    var day = dateFormat(new Date(result[0].date), "yyyy-mm-dd");
                    var result = {
                        "PhoneNumber": result[0].phonenumber,
                        "UserName": result[0].username,
                        "Number": result[0].number,
                        "Department": result[0].department,
                        "Status": result[0].status,
                        "Date": day,
                    };
                    res.json(makeResponse(true, result, null));
                    connection.release();
                    return;
                } else {
                    // query make appointment
                    var insertPhone = phonePost;
                    var insertName = namePost;
                    var insertDepart = departPost;
                    var queryInsert = "INSERT INTO appointment (phonenumber,fullname,number,department,status,date) VALUES ?";
                    var values = [[insertPhone, insertName, "", insertDepart, "active", "2018-05-26"]];
                    connectDB.pool.query(queryInsert, [values], function (err, result, fields) {
                        if (err) {
                            res.json(makeResponse(false, null, "404 Not Found"));
                            connection.release();
                            console.log("Query Error: " + err);
                            return;
                        }
                        // query check appointment
                        var querySearch = "SELECT * FROM appointment WHERE phonenumber=? AND fullname=?";
                        connectDB.pool.query(querySearch, [insertPhone, insertName], function (err, result, fileds) {
                            if (err) {
                                res.json(makeResponse(false, null, "404 Not Found"));
                                connection.release();
                                console.log("Query Error: " + err);
                                return;
                            }
                            var day = dateFormat(new Date(result[0].date), "yyyy-mm-dd");
                            var result = {
                                "PhoneNumber": result[0].phonenumber,
                                "UserName": result[0].username,
                                "Number": result[0].number,
                                "Department": result[0].department,
                                "Status": result[0].status,
                                "Date": day,
                            };
                            res.json(makeResponse(true, result, null));
                            connection.release();
                            return;
                        });
                    });
                }
            });


        });
    }
};

module.exports = appointmentController;