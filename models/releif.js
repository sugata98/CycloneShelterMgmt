var mongoose = require('mongoose');

var releifSchema = new mongoose.Schema({
	water: String,
	kits: String,
	consumables: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	}
});

module.exports = mongoose.model('Releif', releifSchema);
