var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Shelter = require('../models/shelter');

//root route
router.get('/', function(req, res) {
	res.render('landing');
});

//show register form
router.get('/register', function(req, res) {
	res.render('register', { page: 'register' });
});

//handle sign up logic
router.post('/register', function(req, res) {
	var newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		avatar: req.body.avatar,
		bio: req.body.bio,
		phone: req.body.phone
	});
	if (req.body.adminCode === 'secretcode123') {
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user) {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('/register');
		}
		passport.authenticate('local')(req, res, function() {
			if (newUser.isAdmin) {
				console.log(user.username);
				req.flash('success', 'Successfully Signed Up to CyShelter! ' + user.username + ", You're an Admin!");
			} else {
				console.log(user.username);
				req.flash('success', 'Successfully Signed Up to CyShelter! ' + user.username);
			}
			res.redirect('/shelters');
		});
	});
});

//show login from
router.get('/login', function(req, res) {
	res.render('login', { page: 'login' });
});

//handle login form logic

router.post('/login', function(req, res, next) {
	passport.authenticate('local', {
		successRedirect: '/shelters',
		failureRedirect: '/login',
		failureFlash: true,
		successFlash: 'Welcome to CyShelter, ' + req.body.username + '!'
	})(req, res);
});

//LOGOUT ROUTE
router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'Logged you out!');
	res.redirect('/shelters');
});

//TRACK Cyclone Location Route
router.get('/track', function(req, res) {
	res.render('track');
});

//USER Profile Route
router.get('/users/:id', function(req, res) {
	User.findById(req.params.id, function(err, foundUser) {
		if (err) {
			req.flash('error', 'Something went wrong');
			return res.redirect('/');
		}
		Shelter.find().where('author.id').equals(foundUser._id).exec(function(err, shelters) {
			if (err) {
				req.flash('error', 'Something went wrong');
				return res.redirect('/');
			}
			res.render('users/show', { user: foundUser, shelters: shelters });
		});
	});
});

//EDIT ROUTE
router.get('/users/:id/edit', function(req, res) {
	User.findById(req.params.id, function(err, foundUser) {
		if (err) {
			res.redirect('back');
		} else {
			res.render('users/edit', { user: foundUser });
		}
	});
});

//Update ROUTE
router.put('/users/:id', function(req, res) {
	var newData = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		avatar: req.body.avatar,
		bio: req.body.bio,
		phone: req.body.phone
	};
	User.findByIdAndUpdate(req.params.id, { $set: newData }, function(err, user) {
		if (err) {
			res.redirect('back');
		} else {
			req.flash('success', 'Profile Updated!');
			res.redirect('/users/' + user._id);
		}
	});
});

module.exports = router;
