var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var blockDao = {
    getAllBlock: function (clinicUsername) {
        var json = { "clinicUsername": clinicUsername };
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
        var json = { "clinicUsername": clinicUsername };
        return new Promise((resolve, reject) => {
            dao.findByProperties(db.Block, json)
                .then(collection => {
                    console.log(collection);
                    resolve(collection);
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