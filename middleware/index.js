var Shelter = require('../models/shelter');
var Cyvictim = require('../models/cyvictim');

var middlewareObj = {};

middlewareObj.checkShelterOwnership = function(req, res, next) {
	if (req.isAuthenticated()) {
		Shelter.findById(req.params.id, function(err, foundShelter) {
			if (err) {
				req.flash('error', 'Shelter not found!');
				res.redirect('back');
			} else {
				if (foundShelter.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash('error', "You don't have permission to do that to do that!");
					res.redirect('back');
				}
			}
		});
	} else {
		req.flash('error', 'You need to be logged in to do that!');
		res.redirect('back');
	}
};

middlewareObj.checkCyvictimOwnership = function(req, res, next) {
	if (req.isAuthenticated()) {
		Cyvictim.findById(req.params.cyvictim_id, function(err, foundCyvictim) {
			if (err) {
				res.redirect('back');
			} else {
				if (foundCyvictim.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash('error', "You don't have permission to do that to do that!");
					res.redirect('back');
				}
			}
		});
	} else {
		req.flash('error', 'You need to be logged in to do that!');
		res.redirect('back');
	}
};

middlewareObj.isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('error', 'You need to be logged in to do that!');
	res.redirect('/login');
};

module.exports = middlewareObj;
