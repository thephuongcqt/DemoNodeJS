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
            var patients = [];
            if(collection != null && collection.models.length > 0){  
                var count = 0;              
                for(var i = 0; i < collection.models.length; i++){                                        
                    db.Patient.forge("patientID", collection.models[i].attributes.patientID)
                    .fetch()
                    .then(function(result){                        
                        count++;
                        patients.push(result.attributes);

                        if(count == collection.models.length){
                            var result = [];
                            console.log(patients);
                            for(var ii = 0; ii < collection.models.length; ii++){
                                var appointment = collection.models[ii].attributes;
                                console.log(appointment);
                                for(var jj = 0; jj < patients.length; jj++){
                                    var patient = patients[jj];
                                    if(appointment.patientID == patient.patientID){
                                        appointment.patient = patient;
                                    }
                                }
                                result.push(appointment);
                            }
                            res.json(utils.makeResponse(true, result, null));
                        }
                    })
                    .catch(function(err){
                        count++;
                        patients.push("null");
                    });                
                }    
            }   
                     
        })
        .catch(function(err){
            var responseObj = utils.makeResponse(false, null, err.message);
            res.json(responseObj);            
        });
    });

    return apiRouter;
}
