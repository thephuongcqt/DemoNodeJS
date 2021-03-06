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
                        logger.successLog("authenToken");
                        res.sendFile(path.resolve('html/success.html'));
                        return;
                    } else {
                        logger.log(new Error("Expired Token: " + token + " Username: " + username));
                        logger.failLog("authenToken", new Error("Expired Token"));
                        res.sendFile(path.resolve('html/error.html'));
                        return;
                    }
                }
            }
        } catch (error) {
            logger.log(error);
            logger.failLog("authenToken", error);
            res.sendFile(path.resolve('html/error.html'));
            return;
        }
        logger.log(new Error("Cannot authenticate token: " + token + " Username: " + username));
        logger.failLog("authenToken", new Error("Cannot authenticate token"));
        res.sendFile(path.resolve('html/error.html'));
    });

    apiRouter.get("/requestSendingEmailConfirm", async function (req, res) {
        var username = req.query.username;
        try {
            if (!username) {
                res.json(utils.responseFailure("Vui lòng nhập tên đăng nhập"));
                logger.failLog("requestSendingEmailConfirm", new Error("Please enter username"));
                return;
            }
            var user = await baseDao.findByID(db.User, "username", username);
            if (!user) {
                res.json(utils.responseFailure("Tài khoản không tồn tại"));
                logger.failLog("requestSendingEmailConfirm", new Error("Account is not exist!"));
                return;
            }
            if (user) {
                if (user.isActive == Const.ACTIVATION) {
                    res.json(utils.responseFailure("Tài khoản đã kích hoạt thành công"));
                    logger.failLog("requestSendingEmailConfirm", new Error("Account is actived"));
                    return;
                }
                if (user.isActive == Const.DEACTIVATION) {
                    var host = req.protocol + '://' + req.get('host');
                    await authenUtils.sendConfirmRegister(host, username, user.email);
                    res.json(utils.responseSuccess("Gửi email thành công"));
                    logger.successLog("requestSendingEmailConfirm");
                    return;
                }
            }
        } catch (error) {
            logger.failLog("requestSendingEmailConfirm", error);
            logger.log(error);
        }
        logger.failLog("requestSendingEmailConfirm", new Error("Send mail fail!"));
        res.json(utils.responseFailure("Đã có lỗi xảy ra trong quá trình gửi mail, bạn vui lòng thử lại sau"));
    });

    apiRouter.post("/requestResetPassword", async function (req, res) {
        var username = req.body.username;
        try {
            if (!username) {
                res.json(utils.responseFailure("Vui lòng nhập tên đăng nhập"));
                logger.failLog("requestResetPassword", new Error("Please enter username"));
                return;
            }
            var user = await baseDao.findByID(db.User, "username", username);
            if (user) {
                var json = { "username": user.username };
                var isToken = await baseDao.findByPropertiesWithManyRelated(db.Token, json, "user");
                if (isToken && isToken.length > 0) {
                    if (user.isActive == Const.DEACTIVATION) {
                        res.json(utils.responseSuccess("Vui lòng xác nhận email trước khi đặt lại mật khẩu"));
                        logger.failLog("requestResetPassword", new Error("Please verify email"));
                        return;
                    } else {
                        await tokenDao.deleteExpiredTokens();
                        var existToken = await baseDao.findByPropertiesWithManyRelated(db.Token, json, "user");
                        if (existToken && existToken.length > 0) {
                            for (var i in existToken) {
                                var expired = utils.expiredDate();
                                await baseDao.update(db.Token, { "ID": existToken[i].ID, "expiredDate": expired }, "ID");
                                await emailUtils.sendCodeForResetPassword(user.email, existToken[i].token, user.username);
                                res.json(utils.responseSuccess("Bạn vui lòng nhập mã đã được gửi tới email để xác nhận đặt lại mật khẩu"));
                                logger.successLog("requestResetPassword");
                                return;
                            }
                        }
                    }
                }
                var token = utils.generatePasswordToken();
                await tokenDao.createToken(token, user.username);
                await emailUtils.sendCodeForResetPassword(user.email, token, user.username);
                res.json(utils.responseSuccess("Bạn vui lòng nhập mã đã được gửi tới email để xác nhận đặt lại mật khẩu"));
                logger.successLog("requestResetPassword");
                return;
            }
            res.json(utils.responseFailure("Tài khoản không tồn tại"));
            logger.failLog("requestResetPassword", new Error("Account is not exist"));
            return;
        } catch (error) {
            logger.failLog("requestResetPassword", error);
            logger.log(error);
        }
        logger.failLog("requestResetPassword", new Error("An error occured"));
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
                            var user = await baseDao.update(db.User, json, "username");
                            var checkPass = await hash.comparePassword(password, user.password);
                            if (checkPass == false) {
                                res.json(utils.responseFailure("Đặt lại mật khẩu thất bại"));
                                logger.failLog("authenPassword", new Error("Re-enter password fail"));
                                return;
                            }
                            await baseDao.delete(db.Token, "ID", dbToken.ID);
                            res.json(utils.responseSuccess("Đặt lại mật khẩu thành công"));
                            logger.successLog("authenPassword");
                            return;
                        } else {
                            logger.failLog("authenPassword", new Error("Expired Token"));
                            logger.log(new Error("Expired Token: " + token + " Username: " + username));
                        }
                    }
                }
            }
            if (!token) {
                res.json(utils.responseFailure("Vui lòng nhập mã xác nhận"));
                logger.failLog("authenPassword", new Error("Please enter verify code"));
                return;
            } if (!password) {
                res.json(utils.responseFailure("Vui lòng nhập mật khẩu mới"));
                logger.failLog("authenPassword", new Error("Please neter new password"));
                return;
            }
        } catch (error) {
            logger.failLog("authenPassword", error);
            logger.log(error);
        }
        logger.failLog("authenPassword", new Error("An error occured"));
        res.json(utils.responseFailure("Đã có lỗi xảy khi xác nhận"));
    });

    return apiRouter;
}