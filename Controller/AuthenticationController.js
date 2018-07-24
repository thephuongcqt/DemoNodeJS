var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var baseDao = require("../DataAccess/BaseDAO");
var tokenDao = require("../DataAccess/TokenDAO");
var path = require("path");
var hash = require("../Utils/Bcrypt");
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

    apiRouter.post("/requestResetPassword", async function (req, res) {
        var username = req.body.username;
        try {
            if (!username) {
                res.json(utils.responseFailure("Vui lòng nhập tên đăng nhập"));
                return;
            }
            var user = await baseDao.findByID(db.User, "username", username);
            if (user) {
                var json = { "username": user.username };
                var isToken = await baseDao.findByPropertiesWithManyRelated(db.Token, json, "user");
                if (isToken && isToken.length > 0) {
                    if (user.isActive == Const.DEACTIVATION) {
                        res.json(utils.responseSuccess("Vui lòng xác nhận email trước khi đặt lại mật khẩu"));
                        return;
                    }
                    for (var i in isToken) {
                        dbToken = isToken[i];
                        if (dbToken.expiredDate >= new Date()) {
                            await baseDao.delete(db.Token, "ID", dbToken.ID);
                        } else {
                            logger.log(new Error("Expired Token: " + token + " Username: " + username));
                        }
                    }
                }
                var token = utils.generatePasswordToken();
                await tokenDao.createToken(token, user.username);
                await emailUtils.sendCodeForResetPassword(user.email, token, user.username);
                res.json(utils.responseSuccess("Bạn vui lòng nhập mã đã được gửi tới email để xác nhận đặt lại mật khẩu"));
                return;
            }
        } catch (error) {
            logger.log(error);
        }
        res.json(utils.responseFailure("Đã có lỗi xảy ra trong quá trình gửi mail, bạn vui lòng thử lại sau"));
    });

    apiRouter.post("/authenPassword", async function (req, res) {
        var username = req.body.username;
        var token = req.body.token;
        var password = req.body.password;
        try {
            if (username && token && password) {
                var json = { "token": token, "username": username };
                var tokens = await baseDao.findByPropertiesWithRelated(db.Token, json, "user");
                if (tokens && tokens.length > 0) {
                    for (var i in tokens) {
                        dbToken = tokens[i];
                        if (dbToken.expiredDate >= new Date()) {
                            var newPassword = await hash.hashPassword(password);
                            var json = { "username": username, "password": newPassword };
                            await baseDao.update(db.User, json, "username");
                            await baseDao.delete(db.Token, "ID", dbToken.ID);
                            res.json(utils.responseFailure("Đặt lại mật khẩu thành công"));
                            return;
                        } else {
                            logger.log(new Error("Expired Token: " + token + " Username: " + username));
                        }
                    }
                }
            }
            if (!token) {
                res.json(utils.responseFailure("Vui lòng nhập mã xác nhận"));
                return;
            } if (!password) {
                res.json(utils.responseFailure("Vui lòng nhập mật khẩu mới"));
                return;
            }
        } catch (error) {
            logger.log(error);
        }
        res.json(utils.responseFailure("Đã có lỗi xảy khi xác nhận"));
    });

    return apiRouter;
}