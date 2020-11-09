const mongoose = require('../../database');

/** Modelagem da nota default */
const NoteSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
    title: {
        type: String,
        maxlength: 50,
        required: false
    },
    description: {
        type: String,
        maxlength: 420,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Note = mongoose.model('Note', NoteSchema);

module.exports = Note;
