var utils = require("./Utils");
module.exports = function(app, express){
    var apiRouter = express.Router();

    apiRouter.get("/getAll", function(req, res){
        res.end("get all");
    });

    apiRouter.get("/demo", function(req, res){
        res.json({
            "url": "Link",
            "username": "unknow"
        });
    });
    apiRouter.post("/Login", function(req, res){
        var username = req.body.username;
        var password = req.body.password;
        var result = {
            "username": username,
            "password": password,
            "phoneNumber": "1230941",
            "role": 1,
            "isActive": 1
        }
        res.json(utils.makeResponse(true, result, null));
    });

    return apiRouter;
};