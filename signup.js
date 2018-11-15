var express = require('express');
var app = express();

app.use(express.static("public"));

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

app.get("/signup", function(req,res){
res.render("signup.ejs");
});

var mongoose = require('mongoose');
var signupModel = require('./model.js');
var db = 'mongodb://localhost/tomatoDB'
mongoose.connect(db);

var dbtest = mongoose.connection;
dbtest.on('error', console.error.bind(console, 'connection error:'));
dbtest.once('open', function(){
console.log("Connection to database");
});

app.post("/register", function(req,res){

	var iname = req.body.name;
	var iage = req.body.age;
	var igender = req.body.gender;
	var iemail = req.body.email;
	var ipassword = req.body.password;
	var iaddress = req.body.address;


	var newSignup = new signupModel({
		name: iname,
		age: iage,
		gender: igender,
		email: iemail,
		password: ipassword,
		address: iaddress
	});

	signupModel.findOne({email: iemail}).exec(function(fail,emailData){
		if (fail) {
			console.log("Something went wrong");

		} else if (emailData) {
		   console.log("already exists");
		}
		else {
			newSignup.save(function(err,acc){
				if(err){
					console.log("Something went wrong")}
				else{
					console.log("Registered new account to the db");
					console.log(acc);
				}
			});

		}
	});
});

app.listen(3000);
