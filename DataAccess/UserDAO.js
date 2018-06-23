var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var userDao = {
    getUserInfo: function (username) {
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
    getAll: function () {
        var json = { "isActive": Const.ACTIVATION };
        return new Promise((resolve, reject) => {
            dao.findByProperties(db.User, json)
                .then(collection => {
                    var listUser = [];
                    for (var i in collection) {
                        var user = collection[i];
                        delete user.isActive;
                        delete user.password;
                        listUser.push(user);
                    }
                    resolve(listUser);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Không tồn tại tài khoản nào");
                });
        });
    },
    getAllUser: function (role) {
        var json = { "role": role, "isActive": Const.ACTIVATION };
        return new Promise((resolve, reject) => {
            dao.findByProperties(db.User, json)
                .then(collection => {
                    var listUser = [];
                    for (var i in collection) {
                        var user = collection[i];
                        delete user.isActive;
                        delete user.password;
                        listUser.push(user);
                    }
                    resolve(listUser);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Không tồn tại tài khoản nào");
                });
        });
    },
    getAllClinic: function () {
        var json = { "role": Const.ROLE_CLINIC, "isActive": Const.ACTIVATION };
        return new Promise((resolve, reject) => {
            dao.findByPropertiesWithRelated(db.User, json, "clinic")
                .then(collection => {
                    var listUser = [];
                    for (var i in collection) {
                        var user = collection[i];
                        delete user.password;
                        delete user.isActive;
                        user.address = user.clinic.address;
                        user.clinicName = user.clinic.clinicName;
                        user.examinationDuration = user.clinic.examinationDuration;
                        user.expiredLicense = user.clinic.expiredLicense;
                        user.imageURL = user.clinic.imageURL;
                        user.greetingURL = user.clinic.greetingURL;
                        delete user.clinic;
                        listUser.push(user);
                    }
                    resolve(listUser);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Không tồn tại tài khoản nào");
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
    updateClinic: function (username, address, clinicName) {
        var json = { "username": username, "address": address, "clinicName": clinicName };
        return new Promise((resolve, reject) => {
            dao.update(db.Clinic, json, "username")
                .then(collection => {
                    resolve(collection);
                })
                .catch(err => {
                    logger.log(err);
                    reject("Cập nhật không thành công");
                });
        });
    },
    createUser: function (username, password, phoneNumber, fullName, email, role) {
        var json = { "username": username, "password": password, "phoneNumber": phoneNumber, "fullName": fullName, "role": role, "isActive": Const.ACTIVATION, "email": email };
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
module.exports = userDao; 