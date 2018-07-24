var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var baseDao = require("../DataAccess/BaseDAO");
var tokenDao = require("../DataAccess/TokenDAO");
var path = require("path");
var authenUtils = require("../Utils/AuthenUtils");
var emailUtils = require("../Utils/Email");

module.exports = function (app, express) {
    var apiRouter = express.Router();

    apiRouter.get("/authenToken", async function (req, res) {
        var username = req.query.username;
        var token = req.query.token;
        try {
            if (username && token) {
                var json = { "token": token, "username": username };
                var tokens = await baseDao.findByPropertiesWithRelated(db.Token, json, "user");
                if (tokens && tokens.length > 0) {
                    dbToken = tokens[0];
                    if (dbToken.expiredDate >= new Date()) {
                        var userJson = {
                            "isActive": Const.ACTIVATION,
                            "username": username
                        }
                        baseDao.update(db.User, userJson, "username");
                        baseDao.delete(db.Token, "ID", dbToken.ID);
                        res.sendFile(path.resolve('html/success.html'));
                        return;
                    } else {
                        logger.log(new Error("Expired Token: " + token + " Username: " + username));
                        res.sendFile(path.resolve('html/error.html'));
                        return;
                    }
                }
            }
        } catch (error) {
            logger.log(error);
            res.sendFile(path.resolve('html/error.html'));
            return;
        }
        logger.log(new Error("Cannot authenticate token: " + token + " Username: " + username));
        res.sendFile(path.resolve('html/error.html'));
    });

    apiRouter.get("/requestSendingEmailConfirm", async function (req, res) {
        var username = req.query.username;
        try {
            var user = await baseDao.findByID(db.User, "username", username);
            if (user && user.isActive == Const.DEACTIVATION) {
                var host = req.protocol + '://' + req.get('host');
                await authenUtils.sendConfirmRegister(host, username, user.email);
                res.json(utils.responseSuccess("Gửi email thành công"));
                return;
            }
        } catch (error) {
            logger.log(error);            
        }
        res.json(utils.responseFailure("Đã có lỗi xảy ra trong quá trình gửi mail, bạn vui lòng thử lại sau"));
    });

    apiRouter.post("/requestResetPassword", async function(req, res){
        var username = req.body.username;
        try {
            var user = await baseDao.findByID(db.User, "username", username);
            if (user) {
                var token = utils.generatePasswordToken();
                await tokenDao.createToken(token, user.username);
                await emailUtils.sendCodeForResetPassword(user.email, token, user.username);
                res.json(utils.responseSuccess("Bạn vui lòng nhập mã đã được gửi tới email để xác nhận đổi mật khẩu"));
                return;
            }
        } catch (error) {
            logger.log(error);            
        }
        res.json(utils.responseFailure("Đã có lỗi xảy ra trong quá trình gửi mail, bạn vui lòng thử lại sau")); 
    });

    apiRouter.get("/authenPassword", async function (req, res) {
        var username = req.query.username;
        var token = req.query.token;
        try {
            if (username && token) {
                var json = { "token": token, "username": username };
                var tokens = await baseDao.findByPropertiesWithRelated(db.Token, json, "user");
                if (tokens && tokens.length > 0) {
                    for (var i in tokens) {
                        dbToken = tokens[i];
                        if (dbToken.expiredDate >= new Date()) {
                            res.json(utils.responseSuccess("success"));
                            baseDao.delete(db.Token, "ID", dbToken.ID);
                            return;
                        } else {
                            logger.log(new Error("Expired Token: " + token + " Username: " + username));
                        }
                    }
                }
            }
        } catch (error) {
            logger.log(error);
        }
        res.json(utils.responseFailure("Đã có lỗi xảy khi xác nhận"));
    });

    return apiRouter;
}