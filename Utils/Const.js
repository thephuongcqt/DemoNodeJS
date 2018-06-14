module.exports = {
    ROLE_ADMIN: 0,
    ROLE_CLINIC: 1,
    ACTIVATION: 1,
    DEACTIVATION: 0,
    FullSlot: "Hôm nay phòng khám đã nhận đủ lịch khám, xin quý khách quay lại vào hôm sau",
    
    testNumbers: ["+18327795475", "+84976666375", "+84932107960", "+841655594954"],
    randomNumbers: ["+18326735555", "+18326435678", "+18326435984", "+18325435434", "+18327643045", "+18328949640", "+18325394579", "+18375674567", 
    "+18335465473", "+18389345356", "+18375485649", "+18356385339", "+18321235679", "+18346972342", "+18397342345", "+18326743377", "+18327575475", 
    "+18327257904", "+18324567640", "+18322678787", "+18388945889", "+18323568034", "+18325480337", "+18325679044", "+18325437843", "+18346688075", 
    "+18324679053", "+18325657890", "+18327426885"],

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
    }
}