var db = require("./DBUtils");
var utils = require("./Utils");

module.exports = function(app, express){
    apiRouter = express.Router();

    apiRouter.get("/getAll", function(req, res){
        db.Appointment.forge()
        .fetchAll()
        .then(function(collection){
            var responseObj = utils.makeResponse(true, collection.toJSON(), false);
            res.json(responseObj)
        })
        .catch(function(err){
            var responseObj = utils.makeResponse(false, err.message, true);
            res.json(responseObj);            
        });
    });

    apiRouter.get("/findAppointmentForClinic", function(req, res){
        var clinicUsername = req.query.clinicUsername;
        db.Appointment.where("clinicUsername", "=", clinicUsername)
        .fetchAll()
        .then(function(collection){
            var responseObj = utils.makeResponse(true, collection.toJSON(), null);
            res.json(responseObj)
        })
        .catch(function(err){
            var responseObj = utils.makeResponse(false, null, err.message);
            res.json(responseObj);            
        });
    })

    return apiRouter;
}
