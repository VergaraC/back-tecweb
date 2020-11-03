const mongoose = require('../../database');

/** Modelagem da linguagem default */
const LanguageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    native: {
        type: String,
        required: true
    },
    initials: {
        type: String,
        required: true,
        unique: true
    }
});

const Language = mongoose.model('Language', LanguageSchema);

module.exports = Language;
