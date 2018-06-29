var Const = require("./Utils/Const");
var db = require("./DataAccess/DBUtils");
var utils = require("./Utils/Utils");
var Moment = require('moment');
var logger = require("./Utils/Logger");
var configUtils = require("./Utils/ConfigUtils");
var twilioUtils = require("./ThirdPartyHotline/TwilioUtils");

var test = async function () {
    var dao = require("./DataAccess/BaseDAO");
    var clinicDao = require("./DataAccess/ClinicDAO");
    var appointmentDao = require("./DataAccess/AppointmentDAO");
    var scheduler = require("./Scheduler/Scheduler");

    // var startDate = new Date("2018-06-25");
    // var endDate = new Date();
    // var sql = "SELECT * FROM tbl_appointment WHERE remindTime BETWEEN ? AND ? "
    //     + " AND clinicUsername = ?"
    //     + " AND isReminded = ?";
    // db.knex.raw(sql, [startDate, endDate, "hoanghoa", 0])
    // .then(collection => {
    //     var result = collection[0];
    //     if(result && result.length > 0){
    //         var model = JSON.parse(JSON.stringify(result));
    //         console.log(model);
    //     }        
    // })
    // .catch(error => {
    //     console.log(error);
    // })
    try {        
        dao.findAll(db.License)
        .then(model => {
            console.log(model);
        })
        // var blockDao = require("./DataAccess/BlockDAO");
        // var isBlock = await blockDao.isBlockNumber("+18327795275", "+19792136847");
        // var isBlock2 = await blockDao.isBlockNumber("+18326735555", "+19792136847");
        // console.log(isBlock);
        // console.log(isBlock2);
        // var nonce = '{\n  "mBillingAddress": {},\n  "mClientMetadataId": "BA-3LH5161843851561Y",\n  "mEmail": "phuongntse62087-buyer@fpt.edu.vn",\n  "mFirstName": "test",\n  "mLastName": "buyer",\n  "mPayerId": "4PXH4BAKHM4TL",\n  "mPhone": "",\n  "mShippingAddress": {},\n  "mDefault": false,\n  "mDescription": "PayPal",\n  "mNonce": "ee71d1e2-58c2-0486-5fd4-0d7fcc4576a9"\n}';
        // nonce = JSON.parse('{\n mBillingAddress: {},\n  mClientMetadataId: "BA-3LH5161843851561Y",\n  mEmail: "phuongntse62087-buyer@fpt.edu.vn",\n  mFirstName: "test",\n  mLastName: "buyer",\n  mPayerId: "4PXH4BAKHM4TL",\n  mPhone: "",\n  mShippingAddress: {},\n  mDefault: false,\n  mDescription: "PayPal",\n  mNonce: "ee71d1e2-58c2-0486-5fd4-0d7fcc4576a9" }' );
        // console.log(nonce);
        // var mBookedTime = Moment(new Date());
        // var message = "Cuộc hẹn của bạn sẽ diễn ra vào lúc " + mBookedTime.format("HH:mm") + " phút ngày " + mBookedTime.format("YYYY-MM-DD") + ". Mong bạn có mặt đúng giờ";

        // twilioUtils.sendSMS("+19792136847", "+18327795475", message);
        // var appointments = await appointmentDao.getAppointmentsToRemind(new Date());
        // console.log(appointments);
        // var appointments = await appointmentDao.getAppointmentsToRemind(new Date("2018-06-26 20:00:00"), "hoanghoa");
        // console.log(appointments);
        // var clinic = await dao.findByIDWithRelated(db.Clinic, "username", "hoanghoa", "user");
        // var mDuration = utils.getMomentTime(clinic.examinationDuration);
        // var aDuration = getTotalDuration(1, mDuration);
        // var mDuration =  Moment.duration(clinic.examinationDuration);
        // var mTime = Moment(new Date("2018-06-26 20:00:00"));
        // console.log(mTime);
        // mTime.subtract(mDuration);
        // console.log(mTime);
        // console.log(clinic);
        // var startDate = new Date("2018-06-26");
        // var endDate = new Date("2018-06-26 20:00:00"));
        //     });
    } catch (error) {
        console.log(error);
    }
};
test();

function getTotalDuration(count, duration) {
    var times = miliseconds(duration.hour(), duration.minute(), duration.second());
    return count * times;
}

function miliseconds(hours, minutes, seconds) {
    return ((hours * 60 * 60 + minutes * 60 + seconds) * 1000);
}