var express = require('express');
var router = express.Router({ mergeParams: true });
var Shelter = require('../models/shelter');
var Cyvictim = require('../models/cyvictim');
var middleware = require('../middleware');

//Cyvictims New
router.get('/new', middleware.isLoggedIn, function(req, res) {
	Shelter.findById(req.params.id, function(err, shelter) {
		if (err) {
			console.log(err);
		} else {
			res.render('cyvictims/new', { shelter: shelter });
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
			Cyvictim.create(req.body.cyvictim, function(err, cyvictim) {
				if (err) {
					req.flash('error', 'Something went wrong');
					console.log(err);
				} else {
					cyvictim.author.id = req.user._id;
					cyvictim.author.username = req.user.username;
					cyvictim.save();
					shelter.cyvictims.push(cyvictim);
					shelter.save();
					req.flash('success', 'Successfully added cyvictim');
					res.redirect('/shelters/' + shelter._id + '/victims/');
				}
			});
		}
	});
});

router.get('/:cyvictim_id/edit', middleware.checkCyvictimOwnership, function(req, res) {
	Cyvictim.findById(req.params.cyvictim_id, function(err, foundCyvictim) {
		if (err) {
			res.redirect('back');
		} else {
			res.render('cyvictims/edit', { shelter_id: req.params.id, cyvictim: foundCyvictim });
		}
	});
});

//Add Compensation Info
router.get('/:cyvictim_id/compensate', middleware.checkCyvictimOwnership, function(req, res) {
	Cyvictim.findById(req.params.cyvictim_id, function(err, foundCyvictim) {
		if (err) {
			res.redirect('back');
		} else {
			res.render('cyvictims/compensate', { shelter_id: req.params.id, cyvictim: foundCyvictim });
		}
	});
});

router.put('/:cyvictim_id', middleware.checkCyvictimOwnership, function(req, res) {
	Cyvictim.findByIdAndUpdate(req.params.cyvictim_id, req.body.cyvictim, function(err, updatedCyvictim) {
		if (err) {
			res.redirect('back');
		} else {
			res.redirect('/shelters/' + req.params.id + '/victims/');
		}
	});
});

//DELETE ROUTE
router.delete('/:cyvictim_id', middleware.checkCyvictimOwnership, function(req, res) {
	Cyvictim.findByIdAndRemove(req.params.cyvictim_id, function(err) {
		if (err) {
			res.redirect('back');
		} else {
			req.flash('success', 'Cyvictim Deleted!');
			res.redirect('/shelters/' + req.params.id + '/victims/');
		}
	});
});

module.exports = router;
