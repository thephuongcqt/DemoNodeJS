var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var licenseDao = {
    getLicenseInfo: function (licenseID) {
        return new Promise((resolve, reject) => {
            dao.findByID(db.License, "licenseID", licenseID)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("License is not exist");
                });
        });
    },
    getAllLicense: function () {
        return new Promise((resolve, reject) => {
            dao.findAll(db.License)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("License is not exist");
                });
        });
    },
    updateLicense: function (licenseID, price, duration, name, description, isActive) {
        var json = { "licenseID": licenseID, "price": price, "duration": duration, "name": name, "description": description, "isActive": isActive };
        return new Promise((resolve, reject) => {
            dao.update(db.License, json, "licenseID")
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Update license successfully");
                });
        });
    },
    createLicense: function (price, duration, name, description) {
        var json = { "price": price, "duration": duration, "name": name, "description": description, "isActive": Const.ACTIVATION };
        return new Promise((resolve, reject) => {
            dao.create(db.License, json)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Create license successfully");
                });
        });
    },
    deleteLicense: function (licenseID) {
        return new Promise((resolve, reject) => {
            dao.delete(db.License, "licenseID", licenseID)
                .then(collection => {
                    resolve("Delete license successfully");
                })
                .catch(err => {
                    logger.log(err);
                    reject("Delete license is fail");
                });
        });
    },
    getLicenseBill: function (licenseID) {
        return new Promise((resolve, reject) => {
            dao.findByIDWithRelated(db.License, "licenseID", licenseID, "bills")
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("License is not exist");
                });
        });
    }
}
module.exports = licenseDao; 