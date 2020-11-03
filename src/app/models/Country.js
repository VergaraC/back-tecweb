const mongoose = require('../../database');

/** Modelagem do país default */
const CountrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    native: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    continent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Continent',
        required: true
    },
    capital: {
        required: false,
        type: String
    },
    currency: [
        {
            type: String,
            required: true,
            uppercase: true
        }
    ],
    languages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Language',
            required: true
        }
    ],
    initials: {
        type: String,
        required: true
    }
});

const Country = mongoose.model('Country', CountrySchema);

module.exports = Country;
