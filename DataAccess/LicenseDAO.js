var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var licenseDao = {
    getLicenseInfo: function (username) {
        return new Promise((resolve, reject) => {
            dao.findByID(db.User, "username", username)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Không tồn tại tài khoản nào");
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
                    reject("Không tồn tại giấy phép nào");
                });
        });
    },
    updateUser: function (username, password, phoneNumber, fullName, role, isActive, email) {
        var json = { "username": username, "password": password, "phoneNumber": phoneNumber, "fullName": fullName, "role": role, "isActive": isActive, "email": email };
        return new Promise((resolve, reject) => {
            dao.update(db.User, json, "username")
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Cập nhật không thành công");
                });
        });
    },
    createUser: function (username, password, phoneNumber, fullName, email) {
        var json = { "username": username, "password": password, "phoneNumber": phoneNumber, "fullName": fullName, "role": Const.ROLE_ADMIN, "isActive": Const.ACTIVATION, "email": email };
        return new Promise((resolve, reject) => {
            dao.create(db.User, json)
                .then(collection => {
                    delete collection.password;
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Tạo tài khoản không thành công");
                });
        });
    },
    checkUserInfo: function () {
        return new Promise((resolve, reject) => {
            dao.findAll(db.User)
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Không tồn tại tài khoản nào");
                });
        });
    },
    deleteUser: function () {
        return new Promise((resolve, reject) => {
            dao.delete(db.User, "username", username)
                .then(collection => {
                    resolve("Tài khoản đã xóa thành công");
                })
                .catch(err => {
                    logger.log(err);
                    reject("Tài khoản không xóa được");
                });
        });
    }
}
module.exports = licenseDao; 