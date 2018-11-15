var mongoose = require('mongoose');
var schema = mongoose.Schema;

var loginschema = new schema({
    email: String,
    password: String
});

module.exports = mongoose.model('user', loginschema, 'users');
