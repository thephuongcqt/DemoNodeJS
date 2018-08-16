const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: '115.78.4.37',
    // host: 'capstone.cgxwlwzclurt.us-east-1.rds.amazonaws.com',
    // user: 'thephuongcqt',
    // password: 'Callcenterpass1',    
    // host: '203.205.29.13',
    // host: 'localhost',
    // host: '27.74.245.84',
    user: 'root',
    password: '123456',
    // password: '',
    port: '3306',
    database: 'callcenter',
    charset: 'utf8'
  }
});
const bookshelf = require('bookshelf')(knex);

var db = {
  knex: knex,

  bookshelf: bookshelf,

  User: bookshelf.Model.extend({
    tableName: 'tbl_user',
    clinic: function () {
      return this.hasOne(db.Clinic, 'username', "username");
    },
    tokens: function () {
      return this.hasMany(db.Token, "username", "username");
    },
    twilio: function () {
      return this.hasOne(db.Twilio, "phoneNumber", "phoneNumber");
    }
  }),

  Appointment: bookshelf.Model.extend({
    tableName: 'tbl_appointment',
    patient: function () {
      return this.hasOne(db.Patient, 'patientID', 'patientID');
    },

    clinic: function () {
      return this.hasOne(db.Clinic, 'clinicUsername', 'username');
    },

    medicalRecord: function(){
      return this.hasOne(db.MedicalRecord, 'appointmentID', 'appointmentID');
    },

    block: function(){
      return this.hasMany(db.Block, 'clinicUsername', 'clinicUsername');
    }
  }),

  Bill: bookshelf.Model.extend({
    tableName: 'tbl_bill',
    license: function () {
      return this.belongsTo(db.License, "licenseID", "licenseID");
    }
  }),

  Clinic: bookshelf.Model.extend({
    tableName: 'tbl_clinic',
    user: function () {
      return this.belongsTo(db.User, 'username', "username");
    },
    workingHours: function () {
      return this.hasMany(db.WorkingHours, 'clinicUsername', 'username');
    },
    appointments: function () {
      return this.hasMany(db.Appointment, 'clinicUsername', 'username');
    },

  }),

  License: bookshelf.Model.extend({
    tableName: 'tbl_license',
    bills: function () {
      return this.hasMany(db.Bill, "licenseID", "licenseID");
    }
  }),

  WorkingHours: bookshelf.Model.extend({
    tableName: 'tbl_working_hours',
    clinic: function () {
      return this.belongsTo(db.Clinic, 'clinicUsername', 'username');
    }
  }),

  Patient: bookshelf.Model.extend({
    tableName: 'tbl_patient',
    appointments: function(){
      return this.hasMany(db.Appointment, "patientID", "patientID")
    }
  }),

  Token: bookshelf.Model.extend({
    tableName: 'tbl_token',
    user: function () {
      return this.belongsTo(db.User, 'username', 'username');
    }
  }),

  Twilio: bookshelf.Model.extend({
    tableName: 'tbl_twilio',
    user: function () {
      return this.belongsTo(db.User, 'phoneNumber', 'phoneNumber');
    }
  }),

  Block: bookshelf.Model.extend({
    tableName: 'tbl_block'
  }),

  MedicalRecord: bookshelf.Model.extend({
    tableName: 'tbl_medical_record',
    medicalDisease: function () {
      return this.hasMany(db.MedicalDiseases, 'appointmentID', "appointmentID");
    },
    medicalMedicines: function () {
      return this.hasMany(db.MedicalMedicine, 'appointmentID', 'appointmentID');
    }
  }),

  MedicalMedicine: bookshelf.Model.extend({
    tableName: 'tbl_medical_medicines'
  }),

  Medicine: bookshelf.Model.extend({
    tableName: 'tbl_medicine'
  }),

  MedicalDiseases: bookshelf.Model.extend({
    tableName: 'tbl_medical_diseases'
  }),

  Disease: bookshelf.Model.extend({
    tableName: 'tbl_disease'
  }),

  Symptom: bookshelf.Model.extend({
    tableName: 'tbl_clinical_symptom'
  }),

  MedicalSymptom: bookshelf.Model.extend({
    tableName: "tbl_medical_symptom",
    clinicalSymptom: function(){
      return this.hasOne(db.Symptom, "symptomID", "symptomID");
    }
  }),

  Regimen: bookshelf.Model.extend({
    tableName: "tbl_regimen"
  }),

  RegimenMedicine: bookshelf.Model.extend({
    tableName: "tbl_regimen_medicine",
    medicine: function(){
      return this.hasOne(db.Medicine, "medicineID", "medicineID");
    }
  }),

  Role: bookshelf.Model.extend({
    tableName: "tbl_role"
  })
};
module.exports = db;