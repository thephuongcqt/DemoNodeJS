var utils = {
    // makeResponse: function(success, value, error) {
    //     var response = {
    //         "status": success,
    //         "value": value,
    //         "error": error
    //     };
    //     return response;
    // },

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
            "status": false,
            "value": value,
            "error": null
        };
        return response;   
    }
}
module.exports = utils;