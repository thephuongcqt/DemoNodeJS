var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var diseaseDao = {
    getDiseaseInfo: function (diseaseID) {
        return new Promise((resolve, reject) => {
            dao.findByID(db.Disease, "diseaseID", diseaseID)
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
            dao.findAll(db.Disease)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Disease is not exist");
                });
        });
    },
    updateDisease: function (diseaseID, diseaseName, isActive) {
        var json = { "diseaseID": diseaseID, "diseaseName": diseaseName, "isActive": isActive };
        return new Promise((resolve, reject) => {
            dao.update(db.Disease, json, "diseaseID")
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Update disease fail");
                });
        });
    },
    createDisease: function (diseaseName) {
        var json = { "diseaseName": diseaseName, "isActive": Const.ACTIVATION };
        return new Promise((resolve, reject) => {
            dao.create(db.Disease, json)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Create disease successfully");
                });
        });
    },
    deleteDisease: function (diseaseID) {
        return new Promise((resolve, reject) => {
            dao.delete(db.Disease, "diseaseID", diseaseID)
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