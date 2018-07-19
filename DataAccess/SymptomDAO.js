var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var baseDAO = require("./BaseDAO");

var symptomDao = {
    insertSymptoms: async function (appointmentID, symptomList) {
        var promises = []
        for (var index in symptomList) {
            var item = symptomList[index];
            var symptom = await this.insertNotExistedSymptom(item);
            var json = {
                appointmentID: appointmentID,
                symptomID: symptom.symptomID
            }
            promises.push(baseDAO.create(db.MedicalSymptom, json));
        }
        await Promise.all(promises);
    },

    insertNotExistedSymptom: async function (symptom) {
        return new Promise((resolve, reject) => {
            try {
                var json = {"symptom": symptom};
                var existedSymptom = await this.checkExistedSymptom(json);
                if (existedSymptom) {
                    resolve(existedSymptom);
                } else {                    
                    var result = await baseDAO.create(db.Symptom, json);
                    json.symptomID = result.id;
                    resolve(json);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    checkExistedSymptom: async function (json) {
        return new Promise((resolve, reject) => {
            try {                
                var list = await baseDAO.findByProperties(db.Symptom, json);
                if(list){
                    for(var index in list){
                        var item = list[index];
                        if(item.symptom.toUpperCase() == json.symptom.toUpperCase()){
                            resovle(item);
                            return;
                        }
                    }
                }
                resolve(null);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.export = symptomDao;