var paypal = require('paypal-rest-sdk');
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AeNoWVMyCSKtV55KaRHZ03_3o89NE068ltb-UIXeaCSNEAyX-viiU5o3DAP5YmMR2L7tIcWkZycw6r65',
    'client_secret': 'EEq53_vyRg33XFYhB2socXGHu0EHqY4r73Pe_hcGGs6LalgXfgL2s2iAgJLeu6PV0IBIl8ADfS2TJ-rv'
  });


  var create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://return.url",
        "cancel_url": "http://cancel.url"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "item",
                "sku": "item",
                "price": "1.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "1.00"
        },
        "description": "This is the payment description."
    }]
};


paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        console.log("Create Payment Response");
        console.log(payment);
    }
});