const knex = require('knex')({
  client: 'mysql',
  connection: {
    // host: 'capstone.cgxwlwzclurt.us-east-1.rds.amazonaws.com',
    // user: 'thephuongcqt',
    // password: 'Callcenterpass1',
    host: '27.74.245.84',
    // host: '203.205.29.13',
    // host: 'localhost',
    port: '3306',
    user: 'root',
    password: '123456',
    // password: '',
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
    tokens: function(){
      return this.hasMany(db.Token, "username", "username");
    },
    twilio: function(){
      return this.hasOne(db.Twilio, "phoneNumber", "phoneNumber");
    }
  }),

  Appointment: bookshelf.Model.extend({
    tableName: 'tbl_appointment',
    patient: function(){
      return this.hasOne(db.Patient, 'patientID', 'patientID');
    },

    clinic: function(){
      return this.hasOne(db.Clinic, 'clinicUsername', 'username');
    },
  }),

  Bill: bookshelf.Model.extend({
    tableName: 'tbl_bill',
    license: function(){
      return this.belongsTo(db.License, "licenseID", "licenseID");
    }
  }),

  Clinic: bookshelf.Model.extend({
    tableName: 'tbl_clinic',
    user: function () {
      return this.belongsTo(db.User, 'username', "username");
    },
    workingHours: function(){
      return this.hasMany(db.WorkingHours, 'clinicUsername', 'username');
    },
    appointments: function(){
      return this.hasMany(db.Appointment, 'clinicUsername', 'username');
    },

  }),

  License: bookshelf.Model.extend({
    tableName: 'tbl_license',
    bills: function(){
      return this.hasMany(db.Bill, "licenseID", "licenseID");
    }
  }),

  WorkingHours: bookshelf.Model.extend({
    tableName: 'tbl_working_hours',
    clinic: function(){
      return this.belongsTo(db.Clinic, 'clinicUsername', 'username');
    }
  }),

  Patient: bookshelf.Model.extend({
    tableName: 'tbl_patient'
  }),

  Token: bookshelf.Model.extend({
    tableName: 'tbl_token',
    user: function(){
      return this.belongsTo(db.User, 'username', 'username');
    }
  }),

  Twilio: bookshelf.Model.extend({
    tableName: 'tbl_twilio',
    user: function(){
      return this.belongsTo(db.User, 'phoneNumber', 'phoneNumber');
    }
  }),

  Block: bookshelf.Model.extend({
    tableName: 'tbl_block'
  }),

  MedicalRecord: bookshelf.Model.extend({
    tableName: 'tbl_medical_record'
  }),

  MedicalMedicine: bookshelf.Model.extend({
    tableName: 'tbl_medical_medicine'
  }),

  Medicine: bookshelf.Model.extend({
    tableName: 'tbl_medicine'
  }),

  MedicalDiseases: bookshelf.Model.extend({
    tableName: 'tbl_medical_deseases'
  }),

  DiseasesName: bookshelf.Model.extend({
    tableName: 'tbl_diseases_name'
  })
};
module.exports = db;