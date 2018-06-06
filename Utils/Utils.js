var utils = {
    responseFailure: function(error){
        var response = {
            "status": false,
            "value": null,
            "error": error
        };
        return response;
    },
    responseSuccess: function(value){
        var response = {
            "status": true,
            "value": value,
            "error": null
        };
        return response;
    }
}
module.exports = utils;