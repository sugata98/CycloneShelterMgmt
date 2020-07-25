var mongoose = require('mongoose');

//SCHEMA SETUP
var shelterSchema = new mongoose.Schema({
	name: String,
	image: String,
	imageId: String,
	capacity: Number,
	phno: String,
	altphno: String,
	description: String,
	address: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	},
	cyvictims: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Cyvictim'
		}
	],
	releifs: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Releif'
		}
	],
	likes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	]
});

module.exports = mongoose.model('Shelter', shelterSchema);
