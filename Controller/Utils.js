var utils = {
    makeResponse: function(success, value, error) {
        var response = {
            "status": success,
            "value": value,
            "error": error
        };
        return response;
    },
    Const: {
        ROLE_ADMIN: 0,
        ROLE_CLINIC: 1,
    }
}
module.exports = utils;