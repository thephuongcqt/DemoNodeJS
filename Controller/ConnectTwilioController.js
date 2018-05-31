// var accountSid = 'AC0182c9b950c8fe1229f93aeb40900a5d'; // Your Account SID from www.twilio.com/console
// var authToken = '903448ab8b8a1e8a59bf62126841bd10';   // Your Auth Token from www.twilio.com/console

// var twilio = require('twilio');

// var twilioClient = new twilio(accountSid, authToken);

// module.exports = twilioClient;
///////////////////////////////////////////////////////////////////////////
// const accountSid = 'AC0182c9b950c8fe1229f93aeb40900a5d';
// const authToken = '903448ab8b8a1e8a59bf62126841bd10';

// const client = require('twilio')(accountSid, authToken);

// client.messages
//     .create({
//         body: 'your appointment have book',
//         from: '+19792136847',
//         to: '+18327795475'
//     })
//     .then(message => console.log(message.sid))
//     .done();
/////////////////////////////////////////////////////////////////////////
const accountSid = 'AC0182c9b950c8fe1229f93aeb40900a5d';
const authToken = '903448ab8b8a1e8a59bf62126841bd10';

module.exports.twilios = require('twilio')(accountSid, authToken);
// module.exports = reqClient;
// module.exports.accountSid = 'AC0182c9b950c8fe1229f93aeb40900a5d';
// module.exports.authToken = '903448ab8b8a1e8a59bf62126841bd10';