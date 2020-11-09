const mongoose = require('mongoose');

// const { MONGO_CONNECTION } = require('../config/constants.json');

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

module.exports = mongoose;
