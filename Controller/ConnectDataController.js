var mysql = require('mysql');

class ConnectData{
    constructor(config){
        this.pool = mysql.createPool({
            host: "localhost",
            user: "root",
            password: "",
            database: "demo"
        });
    }
}

module.exports = ConnectData;