var express = require('express');
var router = express.Router({ mergeParams: true });
var Shelter = require('../models/shelter');
var Releif = require('../models/releif');
var middleware = require('../middleware');

//Cyvictims New
router.get('/new', middleware.isLoggedIn, function(req, res) {
	Shelter.findById(req.params.id, function(err, shelter) {
		if (err) {
			console.log(err);
		} else {
			res.render('shelters/releifnew', { shelter: shelter });
		}
	});
});

//Cyvictims Create
router.post('/', middleware.isLoggedIn, function(req, res) {
	Shelter.findById(req.params.id, function(err, shelter) {
		if (err) {
			console.log(err);
			redirect('/shelters');
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
					shelter.releifs.pop;
					shelter.releifs.push(releif);
					// console.log(shelter);
					shelter.save();
					req.flash('success', 'Successfully added releif');
					res.redirect('/shelters/' + shelter._id + '/releif/');
				}
			});
		}
	});
});

router.delete('/:releif_id', middleware.checkShelterOwnership, function(req, res) {
	Releif.findByIdAndRemove(req.params.releif_id, function(err) {
		if (err) {
			res.redirect('back');
		} else {
			req.flash('success', 'Relief Requirement Deleted!');
			res.redirect('/shelters/' + req.params.id + '/releif/');
		}
	});
});

module.exports = router;
