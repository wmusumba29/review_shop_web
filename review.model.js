var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reviewSchema = new Schema({
	restaurant: String, 
	score: String, 
	description: String,
	image: String,
	author: String,
	email: String
});

module.exports = mongoose.model('Review', reviewSchema, 'reviews');

