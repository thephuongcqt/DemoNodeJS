var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var baseDAO = require("../DataAccess/BaseDAO");
var Moment = require("moment");
var logger = require("../Utils/Logger");

module.exports = function (app, express) {
    apiRouter = express.Router();
    // getRegimen
    // apiRouter.post("/getRegimen", async function (req, res) {
    //     try {
    //         var username = req.body.username;
    //         var diseaseIDs = req.body.diseaseIDs;
    //         if (username && diseaseIDs) {
    //             var list = [];
    //             for (var i in diseaseIDs) {
    //                 var diseaseID = diseaseIDs[i];
    //                 var json = {
    //                     clinicUsername: username,
    //                     diseaseID: diseaseID
    //                 }
    //                 var regimens = await baseDAO.findByProperties(db.Regimen, json);
    //                 if (regimens && regimens.length > 0) {
    //                     var reminding = regimens[0].reminding;
    //                     var regimenMedicine = await baseDAO.findByPropertiesWithRelated(db.RegimenMedicine, json, "medicine");
    //                     var medicines = [];
    //                     for (var index in regimenMedicine) {
    //                         var item = regimenMedicine[index];
    //                         var medicine = {
    //                             "medicineID": item.medicineID,
    //                             "quantity": item.quantity,
    //                             "description": item.description,
    //                             "unitName": item.medicine.unitName
    //                         }
    //                         medicines.push(medicine);
    //                     }
    //                     var jsonResponse = {
    //                         reminding: reminding,
    //                         medicines: medicines
    //                     }
    //                     list.push(jsonResponse);
    //                 }
    //             }
    //             res.json(utils.responseSuccess(list));
    //         } else {
    //             res.json(utils.responseFailure("Đã có lỗi xảy ra khi lấy phác đồ điều trị"))
    //         }
    //     } catch (error) {
    //         logger.log(error);
    //         res.json(utils.responseFailure("Đã có lỗi xảy ra khi lấy phác đồ điều trị"))
    //     }
    // });
    apiRouter.post("/getRegimen", async function (req, res) {
        try {
            var username = req.body.username;
            var diseaseIDs = req.body.diseaseIDs;
            if (username && diseaseIDs) {
                var remindingList = [];
                var regimenList = [];
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
                        // var medicines = [];
                        for (var index in regimenMedicine) {
                            var item = regimenMedicine[index];
                            var medicine = {
                                "medicineID": item.medicineID,
                                "quantity": item.quantity,
                                "description": item.description,
                                "unitName": item.medicine.unitName
                            }
                            
                            if(medicine){
                                regimenList.push(medicine);
                            }
                        }
                        if (reminding){
                            remindingList.push(reminding);
                        }
                        // var jsonResponse = {
                        //     reminding: reminding,
                        //     medicines: medicines
                        // }
                        // list.push(jsonResponse);
                    }
                }
                var jsonResponse = {
                    remindings: remindingList,
                    regimens: regimenList
                }
                res.json(utils.responseSuccess(jsonResponse));
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