var dao = {
    create: function (table, json) {
        return new Promise((resolve, reject) => {
            table.forge(json)
                .save()
                .then(model => {
                    resolve(model.toJSON());
                })
                .catch(err => {
                    reject(err.message);
                })
        });
    },

    update: function (table, json, idName) {
        var existedObj = {};
        existedObj[idName] = json[idName];
        delete json[idName];
        return new Promise((resolve, reject) => {
            table.forge(existedObj)
            .save(json, { patch: true })
            .then(model => {
                resovle(model.toJSON());
            })
            .catch(err => {
                reject(err.message);
            });
        });
    },

    delete: function (table, idName, id){
        var json = {};
        json[idName] = id;

        return new Promise((resolve, reject) => {
            table.forge(json)
            .destroy()
            .then(model => {
                resolve(model.toJSON());
            })
            .catch(err => {
                reject(err);
            })
        });
    },

    findByID: function (table, idName, id) {
        return new Promise((resolve, reject) => {
            var json = {};
            json[idName] = id;

            table.forge(json)
                .fetch()
                .then(model => {
                    resolve(model.toJSON());
                })
                .catch(err => {
                    reject(err.message);
                });
        });
    },
    findByProperties: function (table, json) {
        return new Promise((resolve, reject) => {
            table.forge(json)
                .fetchAll()
                .then(model => {
                    resolve(model.toJSON());
                })
                .catch(err => {
                    reject(err.message);
                })
        });
    }
};

module.exports = dao;
