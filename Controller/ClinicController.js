var db = require("../Utils/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.post("/changeInformation", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var address = req.body.address;
        var clinicName = req.body.clinicName;
        db.User.where({ "username": username, "password": password })
            .fetch()
            .then(function (collection) {
                var user = collection.toJSON();
                if (collection == null) {
                    var responseObj = utils.makeResponse(false, null, "Incorrect username or password");
                    res.json(responseObj);
                } else {
                    db.Clinic.where({ "username": username })
                        .save({ "address": address, "clinicName": clinicName }, { patch: true })
                        .then(function (model) {                                                        
                            res.json(utils.makeResponse(true, model.toJSON(), null));
                        })
                        .catch(function (err) {
                            var responseObj = utils.makeResponse(false, null, err);
                            res.json(responseObj);
                        });

                }
            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, null, "Incorrect username or password");
                res.json(responseObj);
            });
    });


    apiRouter.get("/getAllClinic", function (req, res) {
        db.User.forge()
            .where("role", Const.ROLE_CLINIC)
            .fetchAll()
            .then(function (collection) {
                var userList = collection.toJSON();
                var usernames = [];
                for (var i in userList) {
                    usernames.push(userList[i].username);
                }
                db.Clinic.forge()
                    .where("username", "in", usernames)
                    .fetchAll()
                    .then(function (result) {
                        var clinics = result.toJSON();
                        var clinicList = []
                        for (var i in clinics) {
                            var clinic = clinics[i];
                            for (var j in userList) {
                                var user = userList[j];
                                if (clinic.username == user.username) {
                                    user.address = clinic.address;
                                    user.clinicName = clinic.clinicName;
                                    user.password = "";
                                    clinicList.push(user);
                                }
                            }
                        }
                        var responseObj = utils.makeResponse(true, clinicList, null);
                        res.json(responseObj)
                    })
                    .catch(function (err) {
                        var responseObj = utils.makeResponse(false, null, err.message);
                        res.json(responseObj);
                    })

            })
            .catch(function (err) {
                var responseObj = utils.makeResponse(false, null, err.message);
                res.json(responseObj);
            });
    });

    apiRouter.post("/Login", function (req, res) {
        var username = req.body.username;
        var password = req.body.password;

        new db.User({ "username": username, "password": password })
            .fetch({ withRelated: ["clinic"] })
            .then(function (model) {
                if (model == null) {
                    res.json(utils.makeResponse(false, null, "Incorrect username or password!"));
                } else {
                    var clinic = model.toJSON();
                    if (clinic.role === Const.ROLE_CLINIC) {                        
                        clinic.clinicName = clinic.clinic.clinicName;
                        clinic.address = clinic.clinic.clinicName;
                        delete clinic.clinic;
                        delete clinic.password;
                        res.json(utils.makeResponse(true, clinic, null));
                    } else {
                        res.json(utils.makeResponse(false, null, "Access denied"));
                    }
                }
            })
            .catch(function (err) {
                console.log(err);
                var responseObj = utils.makeResponse(false, null, "Incorrect username or password!");
                res.json(responseObj);
            });
    });

    return apiRouter;
}
