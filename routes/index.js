var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

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
	var newUser = new User({ username: req.body.username });
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
				req.flash('success', 'Successfully Signed Up to YelpCamp! ' + user.username + ", You're an Admin!");
			} else {
				console.log(user.username);
				req.flash('success', 'Successfully Signed Up to YelpCamp! ' + user.username);
			}
			res.redirect('/campgrounds');
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
		successRedirect: '/campgrounds',
		failureRedirect: '/login',
		failureFlash: true,
		successFlash: 'Welcome to YelpCamp, ' + req.body.username + '!'
	})(req, res);
});

//LOGOUT ROUTE
router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'Logged you out!');
	res.redirect('/campgrounds');
});

module.exports = router;
