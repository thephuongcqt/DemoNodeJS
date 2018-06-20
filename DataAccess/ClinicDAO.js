var db = require("./DBUtils");
var logger = require("../Utils/Logger");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var dao = require("./BaseDAO");

var clinicDao = {
    findClinicByPhone: async function(phoneNumber){
        var result = null;
        try {
            var collection = await dao.findByPropertiesWithRelated(db.User, {"phoneNumber": phoneNumber}, "clinic")
            if(collection != null && collection.length > 0){
                result = collection[0];
            }
        } catch (error) {
            logger.log(error);
        }
        return result;
    }
}
module.exports = clinicDao;