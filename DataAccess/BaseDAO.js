var dao = {
    create: function (table, json) {
        return new Promise((resolve, reject) => {
            table.forge(json)
                .save()
                .then(model => {
                    resolve(model.toJSON());
                })
                .catch(err => {
                    reject(err);
                });
        });
    },

    update: function (table, json, idName) {
        var existedObj = {};
        existedObj[idName] = json[idName];
        delete json[idName];
        return new Promise((resolve, reject) => {
            table.where(existedObj)
            .save(json, { patch: true })
            .then(model => {
                resolve(model.toJSON());
            })
            .catch(err => {
                reject(err);
            });
        });
    },

    delete: function (table, idName, id){
        var json = {};
        json[idName] = id;

        return new Promise((resolve, reject) => {
            table.where(json)
            .destroy()
            .then(model => {
                resolve(model.toJSON());
            })
            .catch(err => {
                reject(err);
            });
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
                    reject(err);
                });
        });
    },

    findByIDWithRelated: function (table, idName, id, related) {
        var relatedJson = { withRelated: [related] };
        return new Promise((resolve, reject) => {
            var json = {};
            json[idName] = id;
            table.forge(json)
                .fetch(relatedJson)
                .then(model => {
                    resolve(model.toJSON());
                })
                .catch(err => {
                    reject(err);
                });
        });
    },

    findByProperties: function (table, json) {
        return new Promise((resolve, reject) => {
            table.where(json)
                .fetchAll()
                .then(model => {
                    resolve(model.toJSON());
                })
                .catch(err => {
                    reject(err);
                });
        });
    },

    findByPropertiesWithRelated: function (table, json, related){
        var relatedJson = { withRelated: [related] };
        return new Promise((resolve, reject) => {
            table.where(json)
                .fetchAll(relatedJson)
                .then(model => {
                    resolve(model.toJSON());
                })
                .catch(err => {
                    reject(err);
                });
        });
    },
    
    findAll: function(table){
        return new Promise((resolve, reject) => {
            table.forge()
            .fetchAll()
            .then(collection => {
                resolve(collection.toJSON());
            })
            .catch(err => {
                reject(err);
            });
        })
    },

    findAllWithRealted: function(table, related){
        var relatedJson = { withRelated: [related] };
        return new Promise((resolve, reject) => {
            table.forge()
            .fetchAll(relatedJson)
            .then(collection => {
                resolve(collection.toJSON());
            })
            .catch(err => {
                reject(err);
            });
        })
    }
};

module.exports = dao;