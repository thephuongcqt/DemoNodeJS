var db = require("../DataAccess/DBUtils");
var utils = require("./Utils");
var Const = require("./Const");
var logger = require("./Logger");
var nodemailer = require('nodemailer');
var Moment = require('moment');
var handlebars = require('handlebars');
var fs = require('fs');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'callcentercapstone@gmail.com',
        pass: 'Callcenterpass1Callcenterpass1'
    }
});

var nodeMailer = {
    sendCodeForResetPassword: function (email, code, username) {
        try {
            var currentDate = Moment(new Date()).format('DD-MM-YYYY');
            var currentTime = Moment(new Date()).format('HH:mm:ss');
            var readHTMLFile = function (path, callback) {
                fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
                    if (err) {
                        logger.log(err);
                        callback(err);
                    }
                    else {
                        callback(null, html);
                    }
                });
            };
            readHTMLFile('./html/ResetPassword.html', function (err, html) {
                var template = handlebars.compile(html);
                var info = { "username": username, "code": code, "currentDate": currentDate, "currentTime": currentTime };
                var htmlToSend = template(info);
                var mailOptions = {
                    to: email, // list of receivers
                    subject: 'Thông tin khôi phục mật khẩu', // Subject line
                    html: htmlToSend
                };
                return new Promise((resolve, reject) => {
                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            logger.log(err);
                            reject(err);
                        } else {
                            resolve(null);
                        }
                    });
                });
            });
        }
        catch (error) {
            logger.log(error);
        }
    },
    sendConfirmRegisterEmail: function (email, link) {
        try {
            var readHTMLFile = function (path, callback) {
                fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
                    if (err) {
                        logger.log(err);
                        callback(err);
                    }
                    else {
                        callback(null, html);
                    }
                });
            };
            readHTMLFile('./html/ActiveAccount.html', function (err, html) {
                var template = handlebars.compile(html);
                var info = { "email": email, "link": link };
                var htmlToSend = template(info);
                var mailOptions = {
                    to: email, // list of receivers
                    subject: 'Xác nhận đăng ký', // Subject line
                    html: htmlToSend
                };
                return new Promise((resolve, reject) => {
                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            logger.log(err);
                            reject(err);
                        } else {
                            resolve(null);
                        }
                    });
                });
            });
        }
        catch (error) {
            logger.log(error);
        }
    }
}
module.exports = nodeMailer; 
