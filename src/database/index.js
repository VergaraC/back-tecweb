const mongoose = require('mongoose');

const { MONGO_CONNECTION, DATABASE_NAME } = require('../config/constants.json');

mongoose.Promise = global.Promise;

mongoose.connect(MONGO_CONNECTION + DATABASE_NAME, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

module.exports = mongoose;
