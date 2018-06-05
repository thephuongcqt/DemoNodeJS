const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: '27.74.245.84',
    // host: '203.205.29.13',
    port: '3306',
    user: 'root',
    password: '123456',
    database: 'callcenter',
    charset: 'utf8'
  }
});
const bookshelf = require('bookshelf')(knex);
bookshelf.plugin(require('bookshelf-relationships'));

var db = {
  knex: knex,

  bookshelf: bookshelf,

  User: bookshelf.Model.extend({
    tableName: 'tbl_user',
    clinic: function () {
      return this.hasOne(db.Clinic, 'username', "username");
    }
  }),

  Appointment: bookshelf.Model.extend({
    tableName: 'tbl_appointment',
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
    }    
  }),

  License: bookshelf.Model.extend({
    tableName: 'tbl_license',
    bills: function(){
      return this.hasMany(db.Bill, "licenseID", "licenseID");
    }
  }),

  WorkingHours: bookshelf.Model.extend({
    tableName: 'tbl_working_hours'
  }),

  Patient: bookshelf.Model.extend({
    tableName: 'tbl_patient'
  }),
};
module.exports = db;