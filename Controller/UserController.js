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

    apiRouter.get("/Twilio", function(req, res){
        var xml = require('xml');
        response.set('Content-Type', 'text/xml');
        response.send(xml());
    });

    return apiRouter;
};