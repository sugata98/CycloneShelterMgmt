var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	flash = require('connect-flash'),
	Shelter = require('./models/shelter'),
	Cyvictim = require('./models/cyvictim'),
	methodOverride = require('method-override'),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	User = require('./models/user');

//requiring routes
var releifRoutes = require('./routes/releifs'),
	cyvictimRoutes = require('./routes/cyvictims'),
	shelterRoutes = require('./routes/shelters'),
	indexRoutes = require('./routes/index');

var url = process.env.DATABASEURL || 'mongodb://localhost:27017/cyshelter';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
// seedDB();

app.locals.moment = require('moment');

//PASSPORT CONFIG
app.use(
	require('express-session')({
		secret: 'Once again Rusty eins cutest dog!',
		resave: false,
		saveUninitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

app.use('/', indexRoutes);
app.use('/shelters', shelterRoutes);
app.use('/shelters/:id/cyvictims', cyvictimRoutes);
app.use('/shelters/:id/releif', releifRoutes);

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log('CyShelter Server Has Started!');
});
