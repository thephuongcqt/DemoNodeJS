var utils = {
    makeResponse: function(success, value, error) {
        var response = {
            "status": success,
            "value": value,
            "error": error
        };
        return response;
    }
}
module.exports = utils;