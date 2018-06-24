var db = require("../DataAccess/DBUtils");
var utils = require("./Utils");
var Const = require("./Const");
var logger = require("./Logger");
var nodemailer = require('nodemailer');
var Moment = require('moment');

var nodeMailer = {
    sendEmailToPatient: function (username, password, fullName, email) {
        //  Send Email to patient when reset password successfull 
        //setup email by link
        //https://myaccount.google.com/lesssecureapps?pli=1
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'callcentercapstone@gmail.com',
                pass: 'Callcenterpass1Callcenterpass1'
            }
        });
        var currentDate = Moment(new Date()).format('DD-MM-YYYY');
        var currentTime = Moment(new Date()).format('HH:mm:ss');
        const mailOptions = {
            from: 'callcentercapstone@gmail.com', // sender address
            to: email, // list of receivers
            subject: 'Thông tin khôi phục mật khẩu', // Subject line
            html: '<!DOCTYPE html>' +
                '<html><head><title>Appointment</title>' +
                '</head><body><div style="padding:10px 250px 5px 250px;text-align:center">' +
                '<img src="https://www.brandcrowd.com/gallery/brands/pictures/picture13882532337876.jpg" alt="logo" width="160" height="100">' +
                '<tr><td style="background:#00b9f2;height:5px;line-height:5px;width:233px"></td>' +
                '<td style="background:#f7941d;height:5px;line-height:5px;width:233px"></td>' +
                '<td style="background:#5cb85c;height:5px;line-height:5px;width:233px"></td></tr></div>' +
                '<div style="padding:5px 250px 10px 250px"><h1 style="color:#03a9f4;text-align:center">Quên mật khẩu?</h1>' +
                '<h1 style="color:#03a9f4;text-align:center">Thiết lập mật khẩu mới!</h1>' +
                '<h3>Xin chào ' + fullName + ',</h3>' +
                '<p>Cảm ơn bạn đã yêu cầu đặt lại mật khẩu.</p>' +
                '<p>Mật khẩu cho tài khoản ' + '<strong style="color:#15c; font-size:120%;">' + username + '</strong>' + ' đã được thay đổi thành công.</p>' +
                '<p>Đây là mật khẩu mới của bạn: <strong style="color:#15c; font-size:120%;">' + password + '</strong></p>' +
                '<p>Bạn yêu cầu đặt lại mật khẩu ngày ' + currentDate + ' lúc ' + currentTime + '.</p>' +
                '</div></body></html>'
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                res.json(utils.responseFailure(err.message));
                logger.log(err);
            }
        });
    }
}
module.exports = nodeMailer; 
