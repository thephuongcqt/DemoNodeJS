var db = require("../DataAccess/DBUtils");
var utils = require("./Utils");
var Const = require("./Const");
var logger = require("./Logger");
var emailUtils = require("./Email");
var Moment = require('moment');
const uuidv1 = require('uuid/v1');
var tokenDao = require("../DataAccess/TokenDAO");

var authen = {
    sendConfirmRegister: async function(host, username, email){
        var token = uuidv1();
        var expiredDate = await tokenDao.createToken(token, username);
        var link = host + "/authen/authenToken?username=" + username + "&token=" + token;
        emailUtils.sendConfirmRegisterEmail(email, link);
    }
};

module.exports = authen;