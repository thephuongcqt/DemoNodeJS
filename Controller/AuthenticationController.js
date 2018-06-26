var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var baseDao = require("../DataAccess/BaseDAO");
var tokenDao = require("../DataAccess/TokenDAO");
var path = require("path");

module.exports = function (app, express) {
    var apiRouter = express.Router();

    apiRouter.get("/authenToken", async function (req, res) {        
        var username = req.query.username;
        var token = req.query.token;
        try {
            if (username && token) {
                var json = { "token": token };
                var tokens = await baseDao.findByPropertiesWithRelated(db.Token, json, "user");                
                if (tokens && tokens.length > 0) {
                    dbToken = tokens[0];                                    
                    if (username.trim() == dbToken.username) {
                        if (dbToken.expiredDate >= new Date()) {
                            var userJson = {
                                "isActive": Const.ACTIVATION,
                                "username": username
                            }
                            baseDao.update(db.User, userJson, "username");
                            baseDao.delete(db.Token, "ID", dbToken.ID);
                            // res.json("Authentication success");
                            res.sendFile(path.resolve('html/success.html'));
                            return;
                            //need to delete token
                        } else {
                            logger.log(new Error("Expired Token: " + token + " Username: " + username));
                            res.sendFile(path.resolve('html/error.html'));                            
                            return;
                        }
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

    return apiRouter;
}