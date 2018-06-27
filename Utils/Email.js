var db = require("../DataAccess/DBUtils");
var utils = require("./Utils");
var Const = require("./Const");
var logger = require("./Logger");
var nodemailer = require('nodemailer');
var Moment = require('moment');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'callcentercapstone@gmail.com',
        pass: 'Callcenterpass1Callcenterpass1'
    }
});

var nodeMailer = {
    sendEmailToPatient: function (username, password, fullName, email) {
        var currentDate = Moment(new Date()).format('DD-MM-YYYY');
        var currentTime = Moment(new Date()).format('HH:mm:ss');     
        var html = '<!DOCTYPE html>' +
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
        '</div></body></html>';   
        var mailOptions = {
            from: 'callcentercapstone@gmail.com', // sender address
            to: email, // list of receivers
            subject: 'Thông tin khôi phục mật khẩu', // Subject line
            html: html
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {                
                logger.log(err);
            }
        });
    },

    sendConfirmRegisterEmail: function(email, link){
        var html = '<!DOCTYPE html>' +
        '<html><head><title>Appointment</title>' +
        '</head><body><div style="padding:10px 250px 5px 250px;text-align:center">' +
        '<img src="https://www.brandcrowd.com/gallery/brands/pictures/picture13882532337876.jpg" alt="logo" width="160" height="100">' +
        '<tr><td style="background:#00b9f2;height:5px;line-height:5px;width:233px"></td>' +
        '<td style="background:#f7941d;height:5px;line-height:5px;width:233px"></td>' +
        '<td style="background:#5cb85c;height:5px;line-height:5px;width:233px"></td></tr></div>' +
        '<div style="padding:5px 250px 10px 250px"><h1 style="color:#03a9f4;text-align:center">Chào mừng bạn đến với</h1>' +
        '<h1 style="color:#03a9f4;text-align:center;font-size:250%;">Call Center</h1>' +
        '<p style="text-align:center">Hệ thống đặt hẹn cho phòng khám hàng đầu Việt Nam.</p>' +
        '<h3>Xin chào,</h3>' +
        '<p>Chúc mừng bạn, dưới đây là thông tin tài khoản đã được tạo.</p>' +
        '<table style="width:50%;text-align:center"><tr><td style="width:82px"><img style="display:block" src="https://ci5.googleusercontent.com/proxy/T11Gf_DPtq_Xxyy8pJXo1ZtVc3U-JzcVmTifr_HJ36IJUy5N2cs1qYOmwGJOjj7ZrO1NaZr5IG3Hc7vvKLWCEuCZNzef47O1l67W=s0-d-e1-ft#https://images.vietnamworks.com/img/email_account.png" class="CToWUd" width="72" height="72"></td>'+
        '<td style="border-radius:7px;background:#b3e5fc"><strong> <a style="color:#424242;text-decoration:none">'+email+'</a></strong></td></tr></table>'+
        '<p>Chỉ thêm một bước nữa, bạn đã có thể tham gia vào hệ thống đặt hẹn chuyên nghiệp lớn nhất tại Việt Nam. Hãy kích hoạt tài khoản của bạn và bắt đầu sử dụng hệ thống ngay hôm nay! .</p>' +
        '<p style="padding:15px 0 15px 0;border-radius:5px;width:240px;background-color:#ff9800;text-align:center;"><a style="text-decoration: none;padding:15px 55px;font-size:14px;color:white;" target="_blank" href="'+ link +'">Kích hoạt tài khoản</a></p>' +
        '<p style="color:red;">Email này có hiệu lực trong vòng 24 tiếng! .</p>' +
        '</div></body></html>';
        var mailOptions = {
            from: 'callcentercapstone@gmail.com', // sender address
            to: email, // list of receivers
            subject: 'Xác nhận đăng ký', // Subject line            
            html: html
        }
        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {                
                    logger.log(err);
                    reject(err);
                } else{
                    resolve(null);
                }
            });
        })        
    },

    sendCodeForResetPassword: function(email, code, username){
        var currentDate = Moment(new Date()).format('DD-MM-YYYY');
        var currentTime = Moment(new Date()).format('HH:mm:ss');     
        var html = '<!DOCTYPE html>' +
        '<html><head><title>Appointment</title>' +
        '</head><body><div style="padding:10px 250px 5px 250px;text-align:center">' +
        '<img src="https://www.brandcrowd.com/gallery/brands/pictures/picture13882532337876.jpg" alt="logo" width="160" height="100">' +
        '<tr><td style="background:#00b9f2;height:5px;line-height:5px;width:233px"></td>' +
        '<td style="background:#f7941d;height:5px;line-height:5px;width:233px"></td>' +
        '<td style="background:#5cb85c;height:5px;line-height:5px;width:233px"></td></tr></div>' +
        '<div style="padding:5px 250px 10px 250px"><h1 style="color:#03a9f4;text-align:center">Quên mật khẩu?</h1>' +
        '<h1 style="color:#03a9f4;text-align:center">Thiết lập mật khẩu mới!</h1>' +
        '<h3>Xin chào ' + username + ',</h3>' +
        '<p>Cảm ơn bạn đã yêu cầu đặt lại mật khẩu.</p>' +
        '<p>Mật khẩu cho tài khoản ' + '<strong style="color:#15c; font-size:120%;">' + username + '</strong>' + ' đã được thay đổi thành công.</p>' +
        '<p>Mã xác nhận của bạn là: <strong style="color:#15c; font-size:120%;">' + code + '</strong></p>' +
        '<p>Bạn yêu cầu đặt lại mật khẩu ngày ' + currentDate + ' lúc ' + currentTime + '.</p>' +
        '</div></body></html>';   
        var mailOptions = {
            from: 'callcentercapstone@gmail.com', // sender address
            to: email, // list of receivers
            subject: 'Mã xác nhận thiết lập lại mật khẩu', // Subject line
            html: html
        };

        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {                
                    logger.log(err);
                    reject(err);
                } else{
                    resolve(null);
                }
            });
        })  
    }
}
module.exports = nodeMailer; 
