const accountSid = 'AC0182c9b950c8fe1229f93aeb40900a5d';
const authToken = '903448ab8b8a1e8a59bf62126841bd10';

module.exports.twilios = require('twilio')(accountSid, authToken);