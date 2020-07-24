var express = require('express');
var router = express.Router({ mergeParams: true });
var Campground = require('../models/campground');
var Releif = require('../models/releif');
var middleware = require('../middleware');

//Comments New
router.get('/new', middleware.isLoggedIn, function(req, res) {
	Campground.findById(req.params.id, function(err, campground) {
		if (err) {
			console.log(err);
		} else {
			res.render('campgrounds/releifnew', { campground: campground });
		}
	});
});

//Comments Create
router.post('/', middleware.isLoggedIn, function(req, res) {
	Campground.findById(req.params.id, function(err, campground) {
		if (err) {
			console.log(err);
			redirect('/campgrounds');
		} else {
			Releif.create(req.body.releif, function(err, releif) {
				if (err) {
					req.flash('error', 'Something went wrong');
					console.log(err);
				} else {
					// console.log(releif);
					releif.author.id = req.user._id;
					releif.author.username = req.user.username;
					releif.save();
					campground.releifs.pop;
					campground.releifs.push(releif);
					// console.log(campground);
					campground.save();
					req.flash('success', 'Successfully added releif');
					res.redirect('/campgrounds/' + campground._id + '/releif/');
				}
			});
		}
	});
});

module.exports = router;
