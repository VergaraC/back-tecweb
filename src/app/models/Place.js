const mongoose = require('../../database');

/** Modelagem do lugar default */
const PlaceSchema = new mongoose.Schema({
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    annotations: [
        {
            type: String,
            required: false
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Place = mongoose.model('Place', PlaceSchema);

module.exports = Place;
