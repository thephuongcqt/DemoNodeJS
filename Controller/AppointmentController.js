var db = require("./DBUtils");
var utils = require("./Utils");

module.exports = function(app, express){
    apiRouter = express.Router();

    apiRouter.get("/getAll", function(req, res){
        db.Appointment.forge()
        .fetchAll()
        .then(function(collection){
            var responseObj = utils.makeResponse(true, collection.toJSON(), false);
            res.json(responseObj);
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
            
            if(collection != null && collection.models.length > 0){  
                var tmp = [];
                for(var i in collection.models){        
                    tmp.push(collection.models[i].attributes.patientID);
                }
                db.Patient.forge()
                .where("patientID", "in", tmp)
                .fetchAll()
                .then(function(patientsResult){
                    var results = [];
                    for(var i in collection.models){
                        var tmpAppointment = collection.models[i].toJSON();                        
                        for(j in patientsResult.models){                                                        
                            var tmpPatient = patientsResult.models[j].toJSON();                                                        
                            if(tmpAppointment.patientID == tmpPatient.patientID){                            
                                tmpAppointment.patient = tmpPatient;                                
                            }
                        }   
                        delete tmpAppointment.clinicUsername;
                        delete tmpAppointment.patientID;
                        results.push(tmpAppointment);
                    }
                    res.json(utils.makeResponse(true, results, null));
                });                
            } else{
                res.json(utils.makeResponse(false, null, "Không có cuộc hẹn nào"));
            }                      
        })
        .catch(function(err){
            var responseObj = utils.makeResponse(false, null, err.message);
            res.json(responseObj);            
        });
    });

    return apiRouter;
}
