var admin = require("firebase-admin");
var serviceAccount = require("../Certificate/firebaseadmin.json");
var logger = require("../Utils/Logger");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://callcenter2-79faf.firebaseio.com"
});

var firebaseAdmin = {
    notifyToClinic: function (clinicUsername, notifyTitle, notifyMessage) {
        var message = {          
            data: {
                code: "0"
            },
            android: {
                ttl: 3600 * 1000, // 1 hour in milliseconds
                priority: 'high',
                notification: {
                    title: notifyTitle,
                    body: notifyMessage,
                    icon: 'stock_ticker_update',
                    color: '#f45342'
                }
            },
            topic: clinicUsername
        };
        // Send a message to devices subscribed to the provided topic.
        admin.messaging().send(message)
            .then((response) => {                
                //send success
            })
            .catch((error) => {
                logger.log(err);
            });
    },


    testNotify: function (clinicUsername, notifyMessage) {

        var message = {          
            data: {
                code: "0"
            },
            android: {
                ttl: 3600 * 1000, // 1 hour in milliseconds
                priority: 'high',
                notification: {
                    title: "Test Title",
                    body: notifyMessage,
                    icon: 'stock_ticker_update',
                    color: '#f45342'
                }
            },
            topic: clinicUsername
        };
        // Send a message to devices subscribed to the provided topic.
        admin.messaging().send(message)
            .then((response) => {                
                //send success
            })
            .catch((error) => {
                logger.log(err);
            });
    },
    
    subscribeTopic: function(token, topic){
        admin.messaging().subscribeToTopic(token, topic)
        .then(response =>{
            // logger.log(new Error(response));
        })
        .catch(error => {
            logger.log(error);
        })
    },

    unsubscribeTopic: function(token, topic){        
        admin.messaging().unsubscribeFromTopic([token], topic)
        .then(response =>{
            // logger.log(new Error(response));
        })
        .catch(error => {
            logger.log(error);
        })
    }
};
module.exports = firebaseAdmin;