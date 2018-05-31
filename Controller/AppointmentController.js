var myConnect = require("./ConnectDataController");
var connectDB = new myConnect("ConnectData");
var dateFormat = require('dateformat');

const twilioConnect = require('./ConnectTwilioController');

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
    postMakeAppointment: function (req, res) {
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
                if (result.length > 0) {
                    var patientPhone = result[0].phonenumber;
                    var patientName = result[0].fullname;
                    var patientDepartment = result[0].department;
                    var date = dateFormat(new Date(result[0].appointment_time), "yyyy-mm-dd HH:MM");
                    var result = {
                        // "AppointmentID": result[0].appointment_ID,
                        "PhoneNumber": result[0].phonenumber,
                        "FullName": result[0].fullname,
                        "Department": result[0].department,
                        "Status": result[0].status,
                        "AppointmantTime": date
                    };
                    // Send SMS to announcement appointment has book successfull //////////////////////////////////////////////
                    twilioConnect.twilios.messages.create({
                        body: patientName + ' đã đặt lịch khám ngày ' + date + ' khoa ' + patientDepartment + ' thành công',
                        from: '+19792136847',
                        to: '+1' + patientPhone
                    }).then(messages => {
                        console.log(messages);
                    }).done();
                    //////////////////////////////////////////////////////////////////////////////////////////////////////////
                    res.json(makeResponse(true, result, null));
                    connection.release();
                    return;
                } else {
                    // query make appointment
                    var appointmentDate = new Date();
                    var aYear = appointmentDate.getFullYear();
                    var aMonth = appointmentDate.getMonth() + 1;
                    var aDate = appointmentDate.getDate();
                    var aHours = appointmentDate.getHours();
                    var aMinutes = appointmentDate.getMinutes();
                    var aSeconds = appointmentDate.getSeconds();
                    var appointmentTime = aYear + "-" + aMonth + "-" + aDate + " " + aHours + ":" + aMinutes + ":" + aSeconds;
                    var queryInsert = "INSERT INTO appointment (phonenumber,fullname,department,status,appointment_time) VALUES ?";
                    var values = [[phonePost, namePost, departPost, "active", appointmentTime]];
                    connectDB.pool.query(queryInsert, [values], function (err, result, fields) {
                        if (err) {
                            res.json(makeResponse(false, null, "404 Not Found"));
                            connection.release();
                            console.log("Query Error: " + err);
                            return;
                        }
                        // query check appointment
                        var querySearch = "SELECT * FROM appointment WHERE phonenumber=? AND fullname=?";
                        connectDB.pool.query(querySearch, [phonePost, namePost], function (err, result, fileds) {
                            if (err) {
                                res.json(makeResponse(false, null, "404 Not Found"));
                                connection.release();
                                console.log("Query Error: " + err);
                                return;
                            }
                            var patientPhone = result[0].phonenumber;
                            var patientName = result[0].fullname;
                            var patientDepartment = result[0].department;
                            var date = dateFormat(new Date(result[0].appointment_time), "yyyy-mm-dd HH:MM");
                            var result = {
                                // "AppointmentID": result[0].appointment_ID,
                                "PhoneNumber": patientPhone,
                                "FullName": patientName,
                                "Department": patientDepartment,
                                "Status": result[0].status,
                                "AppointmantTime": date
                            };
                            // Send SMS to announcement appointment has book successfull //////////////////////////////////////////////
                            twilioConnect.twilios.messages.create({
                                body: patientName + ' đã đặt lịch khám ngày ' + date + ' khoa ' + patientDepartment + ' thành công',
                                from: '+19792136847',
                                to: '+1' + patientPhone
                            }).then(messages => {
                                console.log(messages);
                            }).done();
                            ///////////////////////////////////////////////////////////////////////////////////////////////////////////
                            res.json(makeResponse(true, result, null));
                            connection.release();
                            return;
                        });
                    });
                }
            });
        });
    },
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // get method for list an appointment
    getListAllAppointment: function (req, res) {
        connectDB.pool.getConnection(function (err, connection) {
            if (err) {
                res.json(makeResponse(false, null, "444 No Response"));
                connection.release();
                console.log("Connect Error" + err);
                return;
            }

            // query get list all appointment
            var querySearch = "SELECT * FROM appointment";
            connectDB.pool.query(querySearch, function (err, results, fields) {
                var listResults = [];
                var date = dateFormat(new Date(results[0].appointment_time), "yyyy-mm-dd HH:MM");
                for (var i = 0; i < results.length; i++) {
                    var tmp = {
                        // "AppointmentID": result[0].appointment_ID,
                        "PhoneNumber": results[0].phonenumber,
                        "FullName": results[0].fullname,
                        "Department": results[0].department,
                        "Status": results[0].status,
                        "AppointmantTime": date
                    };
                    listResults.push(tmp);
                }
                res.json(makeResponse(true, listResults, null));
            });
        });
    }
};

module.exports = appointmentController;