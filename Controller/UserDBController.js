var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "demo"
});
var pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "demo"
});
function makeResponse(success, value, error){
    var response = {
        "status": success,
        "value": value,
        "error": error
    };
    return response;
}
var userDBController = {
    getAll: function(req, res){
        res.json({
            "dm": "dm"
        });
    },
    
    getUserDB: function(req, res){
        pool.getConnection(function(error){
            if(error){
                console.log("Connect Error: " + error);
                return;
            } else{
                var queryString = "SELECT * FROM useraccount";
                con.query(queryString, function (err, result, fields){
                    if(err) {
                        console.log("Query Error: " + err);
                        return;
                    }                                        
                    res.json({
                        "username": "132",
                        "password": "123",
                        "age": "unlimited"
                    });
                });                             
            }
        });    
    },
    postUserDB: function (req,res) {
        var phonePost = req.body.phonenumber;
        var passPost = req.body.password;
        
        pool.getConnection(function (err, connection) {
            if(err){
                console.log("Connect Error" + err);
                return;
            }else{
                var queryString = "SELECT * FROM useraccount";
                pool.query(queryString, function (err, result, fields){
                    if(err) {
                        console.log("Query Error: " + err);
                        return;
                    }
                    var parseResult = JSON.parse(JSON.stringify(result));
                    var found = false;
                   parseResult.forEach(function(item){
                       if(found == false){
                            for(var i=0;i<parseResult.length;i++){
                                if(item.phonenumber == phonePost && item.password == passPost){
                                    var result = {
                                        "PhoneNumber":item.phonenumber,
                                        "UserName":item.username,
                                        "Password":item.password,
                                        "IdNumber":item.idnumber
                                    };        
                                    res.json(makeResponse(true,result,null));
                                    connection.release();
                                    found = true;
                                    break;
                                }
                            }
                       }
                   });
                   if(found == false){
                       res.json(makeResponse(false,null,"wrong user or pass"));
                       connection.release();
                   } 
                });
            }
        });
    }
};

module.exports = userDBController;