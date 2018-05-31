var mysql = require('mysql');

class ConnectData{
    constructor(config){
        this.pool = mysql.createPool({
            host: "203.205.29.13",
            user: "duync",
            password: "123456",
            database: "callcenter"
            // host: "localhost",
            // user: "root",
            // password: "",
            // database: "callcenter"
        });
    }
}

module.exports = ConnectData;