const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: '203.205.29.13',
    port: '3306',
    user: 'root',
    password: '123456',
    database: 'callcenter',
    charset: 'utf8'
  }
});
const bookshelf = require('bookshelf')(knex);

var db = {
  knex: knex,

  bookshelf: bookshelf,

  User: bookshelf.Model.extend({
    tableName: 'tbl_user'
  }),

  Appointment: bookshelf.Model.extend({
    tableName: 'tbl_appointment'
  }),

  Bill: bookshelf.Model.extend({
    tableName: 'tbl_bill'
  }),

  Clinic: bookshelf.Model.extend({
    tableName: 'tbl_clinic'
  }),

  License: bookshelf.Model.extend({
    tableName: 'tbl_license'
  }),

  WorkingHours: bookshelf.Model.extend({
    tableName: 'tbl_working_hours'
  }),

  Patient: bookshelf.Model.extend({
    tableName: 'tbl_patient'
  }),
};
module.exports = db;