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
        var patientPhonePost = req.body.patientphone;
        var patientIDPost = req.body.patientid;
        var clinicNamePost = req.body.clinicusername;
        var appointmentTimePost = req.body.appointmenttime;
        connectDB.pool.getConnection(function (err, connection) {
            if (err) {
                res.json(makeResponse(false, null, "444 No Response"));
                connection.release();
                console.log("Connect Error" + err);
                return;
            }
            // query check appointment
            var querySearch = "SELECT * FROM tbl_appointment WHERE patientID=?";
            connectDB.pool.query(querySearch, patientIDPost, function (err, results, fields) {
                if (err) {
                    res.json(makeResponse(false, null, "404 Not Found"));
                    connection.release();
                    console.log("Query Error: " + err);
                    return;
                }
                if (results.length > 0) {
                    var appointID = results[0].appointmentID;
                    var clinicName = results[0].clinicUsername;
                    var patientIDs = results[0].patientID;
                    var appointDate = dateFormat(new Date(results[0].appointmentTime), "dd-mm-yyyy");
                    var appointTime = dateFormat(new Date(results[0].appointmentTime), "HH:MM");
                    var results = {
                        "Appointment ID": appointID,
                        "Clinic Name": clinicName,
                        "Patient ID": patientIDs,
                        "AppointmantTime": appointDate + ' ' + appointTime
                    };
                    // Send SMS to announcement appointment has book successfull //////////////////////////////////////////////
                    twilioConnect.twilios.messages.create({
                        body: 'Bạn đã đặt lịch khám tại ' + clinicName + ' ngày ' + appointDate + ' lúc ' + appointTime + ' mã số ' + patientIDs,
                        from: '+19792136847',
                        to: '+1' + patientPhonePost
                    }).then(messages => {
                        
                    }).done();
                    //////////////////////////////////////////////////////////////////////////////////////////////////////////
                    res.json(makeResponse(true, results, null));
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
                    var queryInsert = "INSERT INTO tbl_appointment (clinicUsername,patientID,appointmentTime) VALUES ?";
                    var values = [[clinicNamePost, patientIDPost, appointmentTime]];
                    connectDB.pool.query(queryInsert, [values], function (err, results, fields) {
                        if (err) {
                            res.json(makeResponse(false, null, "404 Not Found"));
                            connection.release();
                            console.log("Query Error: " + err);
                            return;
                        }
                        // query check appointment
                        var querySearch = "SELECT * FROM tbl_appointment WHERE patientID=?";
                        connectDB.pool.query(querySearch, patientIDPost, function (err, results, fileds) {
                            if (err) {
                                res.json(makeResponse(false, null, "404 Not Found"));
                                connection.release();
                                console.log("Query Error: " + err);
                                return;
                            }
                            if (results.length > 0) {
                                var appointID = results[0].appointmentID;
                                var clinicName = results[0].clinicUsername;
                                var patientIDs = results[0].patientID;
                                var appointDate = dateFormat(new Date(results[0].appointmentTime), "dd-mm-yyyy");
                                var appointTime = dateFormat(new Date(results[0].appointmentTime), "HH:MM");
                                var results = {
                                    "Appointment ID": appointID,
                                    "Clinic Name": clinicName,
                                    "Patient ID": patientIDs,
                                    "AppointmantTime": appointDate + ' ' + appointTime
                                };
                            }
                            // Send SMS to announcement appointment has book successfull //////////////////////////////////////////////
                            twilioConnect.twilios.messages.create({
                                body: 'Bạn đã đặt lịch khám tại ' + clinicName + ' ngày ' + appointDate + ' lúc ' + appointTime + ' mã số ' + patientIDs,
                                from: '+19792136847',
                                to: '+1' + patientPhonePost
                            }).then(messages => {
                                console.log(messages);
                            }).done();
                            ///////////////////////////////////////////////////////////////////////////////////////////////////////////
                            res.json(makeResponse(true, results, null));
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
            var querySearch = "SELECT * FROM tbl_appointment";
            connectDB.pool.query(querySearch, function (err, results, fields) {
                var listResults = [];
                if (results.length > 0) {
                    
                    for (var i = 0; i < results.length; i++) {
                        var date = dateFormat(new Date(results[i].appointmentTime), "yyyy-mm-dd HH:MM");
                        var tmp = {
                            "AppointmentID": results[i].appointmentID,
                            "Clinic Name": results[i].clinicUsername,
                            "Patient ID": results[i].patientID,
                            "AppointmantTime": date
                        };
                        listResults.push(tmp);
                    }
                    res.json(makeResponse(true, listResults, null));
                    connection.release();
                    return;
                } else {
                    res.json(makeResponse(true, null, 'Appointment schedule is empty'));
                    connection.release();
                    return;
                }
            });
        });
    }
};

module.exports = appointmentController;