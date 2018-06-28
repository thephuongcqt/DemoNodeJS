var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var blockDao = {
    isBlockNumber: async function(patientPhone, clinicPhone){
        try {
            var users = await dao.findByProperties(db.User, {"phoneNumber": clinicPhone});            
            if(users && users.length > 0){
                var user = users[0];                
                var blocks = await dao.findByProperties(db.Block, {"clinicUsername": user.username, "phoneNumber": patientPhone, "isBlock": 1});                
                if(blocks && blocks.length > 0){
                    return true;
                }
            }
            return false;
        } catch (error) {
            logger.log(error);            
        }
        return false;
    },

    getAllBlock: function (clinicUsername) {
        var json = { "clinicUsername": clinicUsername, "isBlock": Const.BLOCK };
        return new Promise((resolve, reject) => {
            dao.findByProperties(db.Block, json)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Không có số nào bị chặn");
                });
        });
    },
    arrayAllBlock: function (clinicUsername) {
        var json = { "clinicUsername": clinicUsername, "isBlock": Const.BLOCK };
        return new Promise((resolve, reject) => {
            dao.findByProperties(db.Block, json)
                .then(collection => {
                    var arrayPhoneNumbers = [];
                    for (var i in collection) {
                        var blockNumber = collection[i].phoneNumber;
                        arrayPhoneNumbers.push(blockNumber);
                    }
                    resolve(arrayPhoneNumbers);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Không có số nào bị chặn");
                });
        });
    },
    addBlock: function (clinicUsername, phoneNumber) {
        var json = { "clinicUsername": clinicUsername, "phoneNumber": phoneNumber, "isBlock": Const.BLOCK };
        return new Promise((resolve, reject) => {
            dao.create(db.Block, json)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Không thể chặn số điện thoại");
                });
        });
    },
    updateBlock: function (clinicUsername, phoneNumber, isBlock) {
        var json = { "clinicUsername": clinicUsername, "phoneNumber": phoneNumber, "isBlock": isBlock };
        return new Promise((resolve, reject) => {
            dao.updateArray(db.Block, json, "clinicUsername", "phoneNumber")
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Không thể thay đổi chặn số điện thoại");
                });
        });
    },
    getBlockNumber: function (clinicUsername, phoneNumber) {
        var json = { "clinicUsername": clinicUsername, "phoneNumber": phoneNumber };
        return new Promise((resolve, reject) => {
            dao.findByProperties(db.Block, json)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Không có số điện thoại nào bị chặn");
                });
        });
    }
}
module.exports = blockDao;