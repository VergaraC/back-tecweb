const mongoose = require('mongoose');

// const { MONGO_CONNECTION } = require('../config/constants.json');

mongoose.Promise = global.Promise;

mongoose.connect("mongodb+srv://rogue2:rogue1@cluster0.nslkg.mongodb.net", { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});
const connection = mongoose.connection;
connection.once('open', () => {
	console.log("MongoDB database connection established successfully");
});

module.exports = mongoose;

