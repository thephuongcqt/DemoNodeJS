var admin = require("firebase-admin");
var serviceAccount = require("../Certificate/firebaseadmin.json");
var logger = require("../Utils/Logger");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://callcenter2-79faf.firebaseio.com"
});
var firestore = admin.firestore();
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

var firebaseAdmin = {
    notifyToClinic: function (clinicUsername, notifyTitle, notifyMessage) {
        this.addNotificationToFirestore(clinicUsername, notifyTitle, notifyMessage);
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

    createClinicDocument(username) {
        return new Promise((resolve, reject) => {
            try {
                var ref = firestore.collection("callcenter");
                ref.doc(username).set({})
                    .then(ref => {
                        resolve(ref);
                    });
            } catch (error) {
                reject(error);
            }
        })
    },

    addNotificationToFirestore(clinicUsername, notifyTitle, notifyMessage) {
        try {
            var clinicRef = firestore.collection("callcenter").doc(clinicUsername);
            clinicRef.get()
                .then(async doc => {
                    if (!doc.exists) {
                        await this.createClinicDocument(clinicUsername);
                    }
                    var notiRef = firestore.collection("callcenter").doc(clinicUsername).collection("notifications");
                    notiRef.add({
                        title: notifyTitle,
                        message: notifyMessage
                    })
                        .then(ref => {
                            console.log(ref);
                        })
                        .catch(error => {
                            logger.log(error);
                        })
                })
                .catch(error => {
                    logger.log(error);
                })
        } catch (error) {
            logger.log(error);
        }
    },

    testNotify: function (clinicUsername, notifyMessage) {
        this.addNotificationToFirestore(clinicUsername, "Test title", notifyMessage);
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

    subscribeTopic: function (token, topic) {
        admin.messaging().subscribeToTopic(token, topic)
            .then(response => {
                // logger.log(new Error(response));
            })
            .catch(error => {
                logger.log(error);
            })
    },

    unsubscribeTopic: function (token, topic) {
        admin.messaging().unsubscribeFromTopic([token], topic)
            .then(response => {
                // logger.log(new Error(response));
            })
            .catch(error => {
                logger.log(error);
            })
    }
};
module.exports = firebaseAdmin;