var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var baseDao = require("../DataAccess/BaseDAO");
var tokenDao = require("../DataAccess/TokenDAO");

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
                            res.json("Authentication success");
                            return;
                            //need to delete token
                        } else {
                            logger.log(new Error("Expired Token: " + token + " Username: " + username));
                            res.json("An error occured. Expired Token");
                            return;
                        }
                    }
                }
            }
        } catch (error) {
            logger.log(error);
            return;
        }
        logger.log(new Error("Cannot authenticate token: " + token + " Username: " + username));
        res.json("An error occured. Cannot authenticate a token");
    });

    return apiRouter;
}