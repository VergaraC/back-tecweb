const mongoose = require('../../database');

/** Modelagem da cidade default */
const CitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    country: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Country'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectID,
        required: false
    }],
    lat: {
        type: String,
        required: false
    },
    lng: {
        type: String,
        required: false
    }
});

const City = mongoose.model('City', CitySchema);

module.exports = City;
