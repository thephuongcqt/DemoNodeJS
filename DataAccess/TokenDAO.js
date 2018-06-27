var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var tokensDao = {
    createToken: async function (token, username) {
        var expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() + 1);

        var json = {
            token: token,
            username: username,
            expiredDate: expiredDate
        }
        await dao.create(db.Token, json);
        return expiredDate
    },

    deleteExpiredTokens: async function () {
        return new Promise((resolve, reject) => {
            db.Token.where('expiredDate', '<', new Date())
                .destroy()
                .then(model => {
                    if (model) {
                        resolve(model.toJSON());
                    } else {
                        resolve(null);
                    }
                })
                .catch(err => {
                    resolve(err);
                })
        });

    }
};

module.exports = tokensDao;