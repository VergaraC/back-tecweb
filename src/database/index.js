const mongoose = require('mongoose');

const { MONGO_CONNECTION } = require('../config/constants.json');

mongoose.Promise = global.Promise;

mongoose.connect(MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

module.exports = mongoose;
