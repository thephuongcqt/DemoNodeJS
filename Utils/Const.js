module.exports = {
    ROLE_ADMIN: 0,
    ROLE_CLINIC: 1,
    ROLE_STAFF: 2,
    ACTIVATION: 1,
    DEACTIVATION: 0,
    DAYOFF: 1,
    DAYWORK: 0,
    appointmentStatus: {
        ABSENT: 0,
        PRESENT: 1
    },
    UNCHECK: 0,
    VISIT: 1,
    NOTVISIT: 2,
    NOTBLOCK: 0,
    BLOCK: 1,
    FullSlot: "Hôm nay phòng khám đã nhận đủ lịch khám, xin quý khách quay lại vào hôm sau",        
    BookAppointmentFailure: "Đã có lỗi xảy ra khi đặt lịch hẹn, xin quý khách vui lòng thử lại sau",
    GetAppointmentListFailure: "Đã có lỗi xảy ra khi lấy danh sách lịch hẹn",
    BlockedError: "Bạn thông thể đặt hẹn, vui lòng liên hệ phòng khám để biết thêm chi tiết",
    Error: {
        UpdateClinicError: "Đã có lỗi xảy ra khi chỉnh sửa thông tin",
        ClinicChangeInformationError: "Đã có lỗi xảy ra khi chỉnh sửa thông tin phòng khám",
        IncorrectUsernameOrPassword: "Sai tên đăng nhập hoặc mật khẩu",
        ScheduleAppointmentError: "Đã có lỗi xảy ra khi sắp xếp lịch khám, xin quý khách vui lòng thử lại sau",
        ClinicRegisterMissingFields: "Vui lòng điền đủ thông tin để đăng ký tài khoản",
        ClinicRegisterExistedClinic: "Tên đăng nhập hoặc Email hoặc số điện thoại đã tồn tại!",
        ClinicRegisterAnErrorOccured: "Đã có lỗi xảy ra trong quá trình đăng ký tài khoản, Vui lòng thử lại sau"
    },

    DefaultGreetingURL: "https://firebasestorage.googleapis.com/v0/b/chatfirebase-1e377.appspot.com/o/Welcome.mp3?alt=media&token=6914df70-85d3-4ea4-9ce0-edf4516ea353",
    DefaultExaminationDuration: "00:30:00",
    DefaultStartWorking: "17:00:00",
    DefaultEndWorking: "20:00:00",
    
    Day: {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6
    },

    Appointment: {
        appointmentID: "appointmentID",
        clinicUsername: "clinicUsername",
        patientID: "patientID", 
        appointmentTime: "appointmentTime",
        status: "status"
    },
    Bill: {
        billID: "billID", 
        clinicUsername: "clinicUsername",
        licenseID: "licenseID",
        startDate: "startDate",
        salePrice: "salePrice"
    },
    Clinic: {
        username: "username",
        address: "address", 
        clinicName: "clinicName", 
        examinationDuration: "examinationDuration",
        expiredLicense: "expiredLicense"
    },
    License: {
        licenseID: "licenseID", 
        price: "price",
        duration: "duration",
        name: "name",
        description: "description"
    },
    Patient: {
        patientID: "patientID",
        phoneNumber: "phoneNumber",
        fullName: "fullName",
        address: "address",
        totalAppointment: "totalAppointment",
        abortedAppointment: "abortedAppointment"
    },
    User: {
        username: "username",
        password: "password",
        phoneNumber: "phoneNumber",
        role: "role",
        isActive: "isActive"
    },
    WorkingHours: {
        id: "id",
        clinicUsername: "clinicUsername",
        startWorking: "startWorking",
        endWorking: "endWorking",
        applyDate: "applyDate",
        isDayOff: "isDayOff"
    },
    Block: {
        blockID: "blockID",
        clinicUsername: "clinicUsername",
        phoneNumber: "phoneNumber",
        isBlock: "isBlock"
    }
}