var bcrypt = require('bcrypt');

var hash = {
    hashPassword: function (password) {
        return new Promise((resolve, reject) => {
            const saltRounds = 10;
            bcrypt.hash(password, saltRounds)
                .then(function (hash) {
                    resolve(hash);
                })
                .catch(function (err) {
                    reject(err.message);
                });
        });
    },
    comparePassword: function (password, hashPassword) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hashPassword)
                .then(function (res) {
                    resolve(res);
                })
                .catch(function (err) {
                    reject(err.message);
                });
        });
    }
};
module.exports = hash;
