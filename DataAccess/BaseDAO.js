var dao = {
    create: function (table, json) {
        return new Promise((resolve, reject) => {
            table.forge(json)
                .save()
                .then(model => {
                    if(model){
                        resolve(model.toJSON());
                    } else{
                        resolve(model);
                    }
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
                if(model){
                    resolve(model.toJSON());
                } else{
                    resolve(model);
                }
            })
            .catch(err => {
                reject(err);
            });
        });
    },

    updateArray: function (table, json, idName1, idName2) {
        var existedObj = {};
        existedObj[idName1] = json[idName1];
        existedObj[idName2] = json[idName2];
        delete json[idName1];
        delete json[idName2];
        return new Promise((resolve, reject) => {
            table.where(existedObj)
            .save(json, { patch: true })
            .then(model => {
                if(model){
                    resolve(model.toJSON());
                } else{
                    resolve(model);
                }
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
                if(model){
                    resolve(model.toJSON());
                } else{
                    resolve(model);
                }
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
                    if(model){
                        resolve(model.toJSON());
                    } else{
                        resolve(model);
                    }                    
                })
                .catch(err => {
                    reject(err);
                });
        });
    },

    findByIDWithRelated: function (table, idName, id, related) {
        var relatedJson = { withRelated: related };
        return new Promise((resolve, reject) => {
            var json = {};
            json[idName] = id;
            table.forge(json)
                .fetch(relatedJson)
                .then(model => {
                    if(model){
                        resolve(model.toJSON());
                    } else{
                        resolve(model);
                    }
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
                    if(model){
                        resolve(model.toJSON());
                    } else{
                        resolve(model);
                    }
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
                    if(model){
                        resolve(model.toJSON());
                    } else{
                        resolve(model);
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });
    },

    findByPropertiesWithManyRelated: function(table, json, relateds){
        var relatedJson = { withRelated: relateds };
        return new Promise((resolve, reject) => {
            table.where(json)
                .fetchAll(relatedJson)
                .then(model => {
                    if(model){
                        resolve(model.toJSON());
                    } else{
                        resolve(model);
                    }
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
                if(collection){
                    resolve(collection.toJSON());
                } else{
                    resolve(collection);
                }
            })
            .catch(err => {
                reject(err);
            });
        })
    },

    findAllWithRelated: function(table, related){
        var relatedJson = { withRelated: [related] };
        return new Promise((resolve, reject) => {
            table.forge()
            .fetchAll(relatedJson)
            .then(collection => {
                if(collection){
                    resolve(collection.toJSON());
                } else{
                    resolve(collection);
                }
            })
            .catch(err => {
                reject(err);
            });
        })
    }
};

module.exports = dao;