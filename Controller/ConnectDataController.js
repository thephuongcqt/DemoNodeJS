var mysql = require('mysql');

class ConnectData{
    constructor(config){
        this.pool = mysql.createPool({
            host: "192.168.1.48",
            user: "duync",
            password: "123456",
            database: "demo"
        });
    }
}

module.exports = ConnectData;