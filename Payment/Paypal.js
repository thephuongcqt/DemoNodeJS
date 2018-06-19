var braintree = require("braintree");
var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");

// var gateway = braintree.connect({
//     environment: braintree.Environment.Sandbox,
//     merchantId: "pfg7tm6zrnm22cjc",
//     publicKey: "f5b3g3dznrmgqwxj",
//     privateKey: "b305cabe62b01c1cc1d6c37b575139b8"
// });

var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   'pfg7tm6zrnm22cjc',
    publicKey:    'bwf663qdgns9n55z',
    privateKey:   'f4b52632c8ff7c83bde508f03531dff2'
});

module.exports = function (app, express) {
    var apiRouter = express.Router();

    apiRouter.get("/getToken", function (req, res) {
        gateway.clientToken.generate({ customerId: 520840836 }, function (err, response) {
            if (typeof response !== 'undefined') {
                res.json(utils.responseSuccess(response));
            } else {
                res.json(utils.responseFailure(err.message));
                console.log(err);
            }
        });        
    });

    apiRouter.post("/checkout", function (req, res) {
        var username = req.body.username;
        var licenseID = req.body.licenseID;
        var nonce = req.body.nonce;
        console.log(nonce);
        var saleRequest = {
            amount: 1,
            paymentMethodNonce: nonce,
            orderId: "Mapped to PayPal Invoice Number",
            options: {
                submitForSettlement: true,
                paypal: {
                    customField: "PayPal custom field PhuongNT",
                    description: "Description for PayPal email receipt PhuongNT",
                },
            }
        };
        gateway.transaction.sale(saleRequest, function (err, result) {
            if (err) {
                console.log("Error: " + err);
            } else if (result.success) {
                console.log(result.transaction.id);
            } else {
                console.log("Message: " + result.message);
            }
            res.end();
        })
    });

    // apiRouter.get("/getTokenForCustomer", function (req, res) {
    //     var aCustomerId = "259682334";
    //     gateway.clientToken.generate({
    //         customerId: aCustomerId
    //     }, function (err, response) {
    //         if (typeof response !== 'undefined') {
    //             res.json(utils.responseSuccess(response));
    //         } else {
    //             res.json(utils.responseFailure(err.message));
    //             console.log(err);
    //         }
    //     });
    // });

    return apiRouter;
}
