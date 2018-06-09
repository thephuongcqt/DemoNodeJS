var braintree = require("braintree");
var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");

var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: "pfg7tm6zrnm22cjc",
    publicKey: "f5b3g3dznrmgqwxj",
    privateKey: "b305cabe62b01c1cc1d6c37b575139b8"
});



module.exports = function (app, express) {
    var apiRouter = express.Router();
    
    apiRouter.get("/getToken", function(req, res){
        gateway.clientToken.generate({}, function (err, response) {    
            if(typeof response !== 'undefined'){                
                res.json(utils.responseSuccess(response));
            } else{       
                res.json(utils.responseFailure(err.message)); 
                console.log(err);
            }   
        });
    });

    return apiRouter;
}
