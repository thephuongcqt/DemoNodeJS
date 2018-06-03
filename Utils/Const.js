module.exports = {
    ROLE_ADMIN: 0,
    ROLE_CLINIC: 1,

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