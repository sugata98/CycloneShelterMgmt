var express = require('express');
var router = express.Router();
var Shelter = require('../models/shelter');
var Cyvictim = require('../models/cyvictim');
var middleware = require('../middleware');
var multer = require('multer');
var storage = multer.diskStorage({
	filename: function(req, file, callback) {
		callback(null, Date.now() + file.originalname);
	}
});
var imageFilter = function(req, file, cb) {
	// accept image files only
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

var cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'cyshelter',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

//INDEX - show all shelters
router.get('/', function(req, res) {
	var noMatch = null;
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Shelter.find({ name: regex }, function(err, allShelters) {
			if (err) {
				console.log(err);
			} else {
				if (allShelters.length < 1) {
					noMatch = 'No Shelters matched that query, please try again.';
				}
				res.render('shelters/index', { shelters: allShelters, page: 'shelters', noMatch: noMatch });
			}
		});
	} else {
		Shelter.find({}, function(err, allShelters) {
			if (err) {
				console.log(err);
			} else {
				res.render('shelters/index', { shelters: allShelters, page: 'shelters', noMatch: noMatch });
			}
		});
	}
});

//CREATE - add new shelter to DB
router.post('/', middleware.isLoggedIn, upload.single('image'), function(req, res) {
	cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('back');
		}
		// add cloudinary url for the image to the shelter object under image property
		req.body.shelter.image = result.secure_url;
		// add image's public_id to shelter object
		req.body.shelter.imageId = result.public_id;
		// add author to shelter
		req.body.shelter.author = {
			id: req.user._id,
			username: req.user.username
		};
		Shelter.create(req.body.shelter, function(err, shelter) {
			if (err) {
				req.flash('error', err.message);
				return res.redirect('back');
			}
			res.redirect('/shelters/' + shelter.id);
		});
	});
});

//NEW - show form to create new shelter
router.get('/new', middleware.isLoggedIn, function(req, res) {
	res.render('shelters/new');
});

//SHOW - shows more info about one shelter
router.get('/:id', function(req, res) {
	//find the shelter with provide id
	Shelter.findById(req.params.id).populate('cyvictims likes').exec(function(err, foundShelter) {
		if (err) {
			console.log(err);
		} else {
			//render show template with that shelter
			res.render('shelters/show', { shelter: foundShelter });
		}
	});
});

// EDIT SHELTER ROUTE
router.get('/:id/edit', middleware.checkShelterOwnership, function(req, res) {
	Shelter.findById(req.params.id, function(err, foundShelter) {
		res.render('shelters/edit', { shelter: foundShelter });
	});
});

// Cyclone Victims ROUTE
router.get('/:id/victims', middleware.checkShelterOwnership, function(req, res) {
	var perPage = 3;
	var pageQuery = parseInt(req.query.page);
	var pageNumber = pageQuery ? pageQuery : 1;
	var noMatch = null;
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Shelter.findById(req.params.id).populate('cyvictims likes').exec(function(err, foundShelter) {
			const selectVictims = foundShelter.cyvictims;
			Cyvictim.find({ _id: selectVictims, name: regex })
				.skip(perPage * pageNumber - perPage)
				.limit(perPage)
				.exec(function(err, allCyvictims) {
					Cyvictim.count({ _id: selectVictims, name: regex }).exec(function(err, count) {
						if (err) {
							console.log(err);
							res.redirect('back');
						} else {
							if (allCyvictims.length < 1) {
								noMatch = 'No victims match that query, please try again.';
							}
							res.render('shelters/victims', {
								shelter: foundShelter,
								cyvictims: allCyvictims,
								current: pageNumber,
								pages: Math.ceil(count / perPage),
								noMatch: noMatch,
								search: req.query.search
							});
						}
					});
				});
		});
	} else {
		// get all campgrounds from DB
		Shelter.findById(req.params.id).populate('cyvictims likes').exec(function(err, foundShelter) {
			const selectVictims = foundShelter.cyvictims;
			Cyvictim.find({ _id: selectVictims })
				.skip(perPage * pageNumber - perPage)
				.limit(perPage)
				.exec(function(err, allCyvictims) {
					Cyvictim.count({ _id: selectVictims }).exec(function(err, count) {
						if (err) {
							console.log(err);
						} else {
							res.render('shelters/victims', {
								shelter: foundShelter,
								cyvictims: allCyvictims,
								current: pageNumber,
								pages: Math.ceil(count / perPage),
								noMatch: noMatch,
								search: false
							});
						}
					});
				});
		});
	}
});

router.get('/:id/releif', middleware.checkShelterOwnership, function(req, res) {
	Shelter.findById(req.params.id).populate('releifs').exec(function(err, foundShelter) {
		res.render('shelters/releif', { shelter: foundShelter });
	});
});

router.put('/:id', middleware.checkShelterOwnership, upload.single('image'), function(req, res) {
	Shelter.findById(req.params.id, async function(err, shelter) {
		if (err) {
			req.flash('error', err.message);
			res.redirect('back');
		} else {
			if (req.file) {
				try {
					await cloudinary.v2.uploader.destroy(shelter.imageId);
					var result = await cloudinary.v2.uploader.upload(req.file.path);
					shelter.imageId = result.public_id;
					shelter.image = result.secure_url;
				} catch (err) {
					req.flash('error', err.message);
					res.redirect('back');
				}
			}
			shelter.name = req.body.shelter.name;
			shelter.description = req.body.shelter.description;
			shelter.capacity = req.body.shelter.capacity;
			shelter.address = req.body.shelter.address;
			shelter.phno = req.body.shelter.phno;
			shelter.altphno = req.body.shelter.altphno;
			shelter.save();
			req.flash('success', 'Successfully Updated!');
			res.redirect('/shelters/' + req.params.id);
		}
	});
});

//DESTROY SHELTER
router.delete('/:id', middleware.checkShelterOwnership, function(req, res) {
	Shelter.findById(req.params.id, async function(err, shelter) {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('back');
		}
		try {
			await cloudinary.v2.uploader.destroy(shelter.imageId);
			shelter.remove();
			req.flash('success', 'Shelter deleted successfully!');
			res.redirect('/shelters');
		} catch (error) {
			req.flash('error', err.message);
			return res.redirect('back');
		}
	});
});

// Shelter Like Route
router.post('/:id/like', middleware.isLoggedIn, function(req, res) {
	Shelter.findById(req.params.id, function(err, foundShelter) {
		if (err) {
			console.log(err);
			return res.redirect('/shelters');
		}

		// check if req.user._id exists in foundShelter.likes
		var foundUserLike = foundShelter.likes.some(function(like) {
			return like.equals(req.user._id);
		});

		if (foundUserLike) {
			// user already liked, removing like
			foundShelter.likes.pull(req.user._id);
		} else {
			// adding the new user like
			foundShelter.likes.push(req.user);
		}

		foundShelter.save(function(err) {
			if (err) {
				console.log(err);
				return res.redirect('/shelters');
			}
			return res.redirect('/shelters/' + foundShelter._id);
		});
	});
});

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;
