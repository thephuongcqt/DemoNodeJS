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

    handlePost: function (request, res){
        var body = request.body;
        console.log(body);
        request.end("a");
    }
};

module.exports = userDBController;