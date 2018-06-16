var admin = require("firebase-admin");
var serviceAccount = require("../Certificate/firebaseadmin.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://callcenter-capstone.firebaseio.com"
});

var firebaseAdmin = {
    notifyToClinic: function () {                
        var message = {
            android: {
                ttl: 3600 * 1000, // 1 hour in milliseconds
                priority: 'normal',
                notification: {
                  title: '$GOOG up 1.43% on the day',
                  body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.',
                  icon: 'stock_ticker_update',
                  color: '#f45342'
                }
              },
            topic: 'hoanghoa'
        };
        // Send a message to devices subscribed to the provided topic.
        admin.messaging().send(message)
            .then((response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
    }
};
module.exports = firebaseAdmin;

firebaseAdmin.notifyToClinic();