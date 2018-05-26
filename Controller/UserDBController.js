var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "shevchenko7",
    database: "vietmoneydb"
});

var userDBController = {
    getAll: function(req, res){
        res.json({
            "dm": "dm"
        });
    },
    
    getUserDB: function(req, res){
        con.connect(function(error){
            if(error){
                console.log("Connect Error: " + error);
                return;
            } else{
                var queryString = "SELECT * FROM vm_user_role";                
                con.query(queryString, function (err, result, fields){
                    if(err) {
                        console.log("Query Error: " + err);
                        return;
                    }                                        
                    res.json({
                        "username": result[0].email,
                        "password": "blank",
                        "age": "unlimited"
                    });
                });                             
            }
        });    
    },

    demo: function(req, res){
        con.connect(function(error){
            if(error){
                console.log("Connect Error: " + error);
                return;
            } else{                            
                var queryInsert = "INSERT INTO appointment (phonenumber,fullname,number,department,status,date) VALUES ?";
                var values = [
                    ["TADA", "The Phuong Ne", "My Number", "Department", 0, '2013-08-26T12:00:00+00:00']
                ];
                con.query(queryInsert, [values], function (err, result, fields){
                    if(err) {
                        console.log("Query Error: " + err);
                        return;
                    }                                        
                    res.json({
                        "username": "username",
                        "password": "blank",
                        "age": "unlimited"
                    });
                });                             
            }
        });    
    }
};

module.exports = userDBController;