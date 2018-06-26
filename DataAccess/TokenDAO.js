var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var tokensDao = {
    createToken: async function(token, username){
        var expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() + 1);

        var json = {
            token: token,
            username: username,
            expiredDate: expiredDate
        }
        await dao.create(db.Token, json);
        return expiredDate
    }
};

module.exports = tokensDao;