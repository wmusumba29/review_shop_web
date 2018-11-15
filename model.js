var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var signupSchema = new Schema({
	name: String,
	age: Number,
	gender: String,
        email : String,
        password : String,
        address : String
});

module.exports = mongoose.model('users', signupSchema);
