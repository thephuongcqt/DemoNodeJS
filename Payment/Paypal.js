var paypal = require('paypal-rest-sdk');
var braintree = require('braintree');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AeNoWVMyCSKtV55KaRHZ03_3o89NE068ltb-UIXeaCSNEAyX-viiU5o3DAP5YmMR2L7tIcWkZycw6r65',
    'client_secret': 'EEq53_vyRg33XFYhB2socXGHu0EHqY4r73Pe_hcGGs6LalgXfgL2s2iAgJLeu6PV0IBIl8ADfS2TJ-rv'
});

var gateway = braintree.connect({
    mode: "sandbox",
    client_id: "AeNoWVMyCSKtV55KaRHZ03_3o89NE068ltb-UIXeaCSNEAyX-viiU5o3DAP5YmMR2L7tIcWkZycw6r65",
    client_secret: "EEq53_vyRg33XFYhB2socXGHu0EHqY4r73Pe_hcGGs6LalgXfgL2s2iAgJLeu6PV0IBIl8ADfS2TJ-rv"
});

// gateway.oauth.createTokenFromCode({
//     code: codeFromQueryString
// }, function (err, response) {

//     var accessToken = response.credentials.accessToken;
//     var expiresAt = response.credentials.expiresAt;
//     var refreshToken = response.credentials.refreshToken;

//     console.log(response);
// });

gateway.clientToken.generate({}, function (err, response) {
    var clientToken = response.clientToken
    console.log(response);
  });
  