const mongoose = require('../../database');

/** Modelagem do continente default */
const ContinentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    initials: {
        type: String,
        required: true,
        unique: true
    }
});

const Continent = mongoose.model('Continent', ContinentSchema);

module.exports = Continent;
