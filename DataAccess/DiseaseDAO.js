var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var diseaseDao = {
    getDiseaseInfo: function (diseasesID) {
        return new Promise((resolve, reject) => {
            dao.findByID(db.DiseasesName, "diseasesID", diseasesID)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Disease is not exist");
                });
        });
    },
    getAllDisease: function () {
        return new Promise((resolve, reject) => {
            dao.findAll(db.DiseasesName)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Disease is not exist");
                });
        });
    },
    updateDisease: function (diseasesID, diseasesName, isActive) {
        var json = { "diseasesID": diseasesID, "diseasesName": diseasesName, "isActive": isActive };
        return new Promise((resolve, reject) => {
            dao.update(db.DiseasesName, json, "diseasesID")
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Update disease fail");
                });
        });
    },
    createDisease: function (diseasesName) {
        var json = { "diseasesName": diseasesName, "isActive": Const.ACTIVATION };
        return new Promise((resolve, reject) => {
            dao.create(db.DiseasesName, json)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Create disease successfully");
                });
        });
    },
    deleteDisease: function (diseasesID) {
        return new Promise((resolve, reject) => {
            dao.delete(db.DiseasesName, "diseasesID", diseasesID)
                .then(collection => {
                    resolve("Delete disease successfully");
                })
                .catch(err => {
                    logger.log(err);
                    reject("Delete disease is fail");
                });
        });
    }
}
module.exports = diseaseDao;