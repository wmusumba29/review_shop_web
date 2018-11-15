 //packages
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var mongoose = require('mongoose');
var path = require('path');
var logger = require('morgan');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');

//schemas
var reviewModel = require('./review.model.js');
var signupModel = require('./model.js');

//db connection
var db = 'mongodb://localhost/tomatoDB';
mongoose.connect(db);
var dbtest = mongoose.connection;
dbtest.on("error", console.error.bind(console,"connection error:"));
dbtest.once("open", function(){
console.log("connected to database");
});


//router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


//variable
var userEmail;
var userName;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(express.static("public/stylesheets"));

var schema = mongoose.Schema;

var loginschema = new schema({
    email: String,
    password: String
});

var user = mongoose.model('user', loginschema, 'users');

//package usage
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());

//login ******************************
app.get('/login', function(req, res) {
    res.render('login2.ejs', { title: 'Hello world' });
});

app.post('/new', function (req, res) {

    user.findOne({ email: req.body.email}, function (err, user) {
        if (user == null) {
            res.end("Login invalid");
        } else if (user.email === req.body.email && user.password === req.body.password) {
            res.redirect('/reviews');

	userEmail = req.body.email;
	console.log("User Email: " +userEmail);
	
        } else {
            console.log("Credentials wrong");
            res.end("Login Invalid");
        }
    });
	
	signupModel.findOne({email: req.body.email}).exec(function(err, userData){
		if(err){
			console.log('Error');	
		} else {
			userName = userData.name;
			console.log(userName);
		}
	});
});

// catch 404 and forward to error handler

//home ********************************
app.get('/home',function(req,res){
	 reviewModel.find({}).exec(function(err, reviewData){
                if(err){
                        console.log("Error: " + err);
                } else{
                        //console.log(reviewData[0]['_id']);
                        res.render("home.ejs", {reviews: reviewData});
                }
        });
})

//Sign up **************************************
//app.get("/searchbar", function(req,res){
//	res.render('search.ejs');
//});

app.get("/signup", function(req,res){
	res.render("signup.ejs");
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
		 //console.log("already exists");
		}
		else {
			newSignup.save(function(err,acc){
				if(err){
					console.log("Something went wrong")}
				else{
					console.log("Registered new account to the db");
					console.log(acc);
					res.render('login2.ejs')
				}
			});

		}
	});
});

//********************************

//reviews*******************************
//view all reviews
app.get("/reviews", function(req,res){
	reviewModel.find({}).exec(function(err, reviewData){
		if(err){
                        console.log("Error: " + err);
                } else{
			//console.log(reviewData[0]['_id']);
			res.render("reviews.ejs", {reviews: reviewData});
                }
        });
	
});

//view single review
app.get("/reviews/:id", function(req,res){
	reviewModel.find({_id: req.params.id}).exec(function(err, reviewData){
		if(err){
			console.log("Error: " + err);
		} else {
			//console.log(reviewData);
			res.render("full-review.ejs", {review: reviewData});
		}		
	});
});


//search reviews
app.post("/search", function(req,res){
	reviewModel.find({restaurant:req.body.search}).exec(function(err, reviewData){
		if(err){
			console.log("Error: " + err)
		} else {
			console.log(reviewData);
			res.render("reviews.ejs", {reviews: reviewData});
		}
	});
});

app.post("/searchhome", function(req,res){
        reviewModel.find({restaurant:req.body.search}).exec(function(err, reviewData){
                if(err){
                        console.log("Error: " + err)
                } else {
                        console.log(reviewData);
                        res.render("home.ejs", {reviews: reviewData});
                }
        });
});

//view reviews via name
app.get('/yourreviews/:name', function(req,res){
	reviewModel.find({author:req.param.name}).exec(function(err, reviewData){
                if(err){
                        console.log("Error: " + err)
                } else {
                        console.log(reviewData);
                        res.render("reviews.ejs", {reviews: reviewData});
                }
        });
});

// edit my reviews via id
app.get("/myReviews/:id", function(req, res){
reviewModel.findOne({_id:req.params.id}).exec(function(err, reviews){
        if(err){
           console.log("Something went wrong");
        }
        else {
	var imagePath = "/home/fullstack/william/project/public/"+reviews.image;
        var myReview =[reviews.restaurant,reviews.score, reviews.description, reviews._id, imagePath]
         res.render("form.ejs", {myReview:myReview});
        }
});
});


//update review change to db
app.post("/myReviews", function(req, res){

if(req.files.image != null){
var imagePath = "/home/fullstack/william/project/public/"+req.files.image.name;
var imageDB = req.files.image.name;
 // change directory to your public folder
var fileName = req.files.image;
if(!req.files){
        res.status(400).send("oops");
}
fileName.mv(imagePath, function(err){
if(err){
        console.log(err);
}else {
console.log("moved");
}});

	reviewModel.findOneAndUpdate({
		_id:req.body._id},
	{$set:{restaurant: req.body.restaurant, score: req.body.score, description: req.body.description, image:imageDB}},
	{new:true},
	function(err, reviews){
        if(err){
        	console.log("something is wrong");
        }
        else{
        	res.redirect("/myReviews");
	}	
	}
	);
} else {
	 reviewModel.findOneAndUpdate({
                _id:req.body._id},
        {$set:{restaurant: req.body.restaurant, score: req.body.score, description: req.body.description}},
        {new:true},
        function(err, reviews){
        if(err){
                console.log("something is wrong");
        }
        else{
                res.redirect("/myReviews");
        }
        }
        );

}
});


//find and remove review
app.post("/myReviewDelete", function(req, res){
reviewModel.findOneAndRemove(
{_id:req.body._id},
function(err, reviews){
        if(err){
        console.log("something is wrong");
        }
        else{
        res.redirect("/myReviews");
        }
}
);
});

//create new review
app.get("/writeReviews",function(req, res){
        res.render("post-review.ejs");
})

//send review to db
app.post("/test", function(req, res){
var imagePath = "/home/fullstack/william/project/public/"+req.files.image.name;
var imageDB = req.files.image.name;
 // change directory to your public folder
var fileName = req.files.image;
if(!req.files){
        res.status(400).send("oops");
}
fileName.mv(imagePath, function(err){
if(err){
        console.log(err);
}else {
console.log("moved");
}});


        var restuarant= req.body.restuarant;
        var score = req.body.score;
        var description = req.body.description;

        var newReview = new reviewModel({
		restaurant: restuarant,
        	score: score,
        	description: description,
		image: imageDB,
		author: userName,
		email: userEmail
        });

        newReview.save(function(err, review){
                 if(err){
                         console.log("something went wrong")
                 }else{
                       console.log("Saved a new review to the review DB");
                       console.log(review);
                 }
        });


        res.redirect("/myReviews");


});


//view all of my reviews (via email)
app.get("/myReviews", function(req,res){
if(userName != null){
        reviewModel.find({email: userEmail }).exec(function(err, reviewData){
                	if(err){
                        	console.log("Error: " + err);
                	} else{
                        	//console.log(reviewData[0]['_id']);
                        	res.render("your-reviews.ejs", {reviews: reviewData});
                	}
        	});
	} else {
		res.render('no-reviews.ejs');
	}
});



app.listen(3000);
