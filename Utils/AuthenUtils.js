var db = require("../DataAccess/DBUtils");
var utils = require("./Utils");
var Const = require("./Const");
var logger = require("./Logger");
var emailUtils = require("./Email");
var baseDao = require("../DataAccess/BaseDAO");
var Moment = require('moment');
const uuidv1 = require('uuid/v1');
var tokenDao = require("../DataAccess/TokenDAO");

var authen = {
    sendConfirmRegister: async function (host, username, email) {
        var json = { "username": username };
        try {
            var isToken = await baseDao.findByPropertiesWithManyRelated(db.Token, json, "user");
            if (isToken && isToken.length > 0) {
                for (var i in isToken) {
                    dbToken = isToken[i];
                    if (dbToken.expiredDate >= new Date()) {
                        var link = host + "/authen/authenToken?username=" + username + "&token=" + dbToken.token;
                        var expired = utils.expiredDate();
                        await baseDao.update(db.Token, { "ID": dbToken.ID, "expiredDate": expired }, "ID");
                        await emailUtils.sendConfirmRegisterEmail(email, link);
                    }
                }
            } else {
                var token = uuidv1();
                var expiredDate = await tokenDao.createToken(token, username);
                var link = host + "/authen/authenToken?username=" + username + "&token=" + token;
                await emailUtils.sendConfirmRegisterEmail(email, link);
            }
        }
        catch (error) {
            logger.log(error);
        }
    },
};

module.exports = authen;