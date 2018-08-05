var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var baseDAO = require("../DataAccess/BaseDAO");
var Moment = require("moment");
var logger = require("../Utils/Logger");

module.exports = function (app, express) {
    apiRouter = express.Router();
    apiRouter.post("/getRegimen", async function (req, res) {
        try {
            var username = req.body.username;
            var diseaseIDs = req.body.diseaseIDs;
            if (username && diseaseIDs) {
                var remindingList = [];                
                var medicinesList = [];
                var medicineMap = {};
                for (var i in diseaseIDs) {
                    var diseaseID = diseaseIDs[i];
                    var json = {
                        clinicUsername: username,
                        diseaseID: diseaseID
                    }
                    var regimens = await baseDAO.findByProperties(db.Regimen, json);
                    if (regimens && regimens.length > 0) {
                        var reminding = regimens[0].reminding;
                        var regimenMedicine = await baseDAO.findByPropertiesWithRelated(db.RegimenMedicine, json, "medicine");                        
                        for (var index in regimenMedicine) {
                            var item = regimenMedicine[index];
                            var medicine = {
                                "medicineID": item.medicineID,
                                "quantity": item.quantity,
                                "description": item.description,
                                "unitName": item.medicine.unitName,
                                "medicineName": item.medicine.medicineName
                            }                            
                            if(medicine){
                                addMedicine(medicineMap, medicine);
                            }
                        }
                        if (reminding){
                            addReminding(remindingList, reminding);
                        }
                    }
                }
                for(var key in medicineMap){
                    medicinesList.push(medicineMap[key]);
                }
                var jsonResponse = {
                    remindings: remindingList,                    
                    regimens: medicinesList
                }
                res.json(utils.responseSuccess(jsonResponse));
                logger.successLog("getRegimen");
            } else {
                res.json(utils.responseFailure("Đã có lỗi xảy ra khi lấy phác đồ điều trị"))
            }
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure("Đã có lỗi xảy ra khi lấy phác đồ điều trị"))
        }
    });
    return apiRouter;
}

function addMedicine(medicineMap, medicine){    
    var existedMedicine = medicineMap[medicine.medicineID];
    if(existedMedicine){
        existedMedicine.quantity += medicine.quantity;
    } else{
        medicineMap[medicine.medicineID] = medicine
    }
}

function addReminding(remindingList, reminding){
    for(var index in remindingList){
        var item = remindingList[index];
        var oldReminding = item.toUpperCase().trim();
        var newReminding = reminding.toUpperCase().trim();
        if(oldReminding == newReminding || oldReminding.includes(newReminding)){ 
            return;
        }
        if(newReminding.includes(oldReminding)){
            remindingList[index] = reminding.trim();
            return;
        }
    }
    remindingList.push(reminding);
}