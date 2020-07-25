var mongoose = require('mongoose');

var cyvictimSchema = new mongoose.Schema({
	userID: String,
	name: String,
	gender: String,
	age: Number,
	address: String,
	occupation: String,
	count: Number,
	compensate: String,
	isCompensated: Boolean,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	}
});

module.exports = mongoose.model('Cyvictim', cyvictimSchema);
