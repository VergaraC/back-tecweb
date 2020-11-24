const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

/** Modelagem do usuário default
 *  Nosso usuário deverá possuir:
 * - nome (obrigatório);
 * - email (obrigatório);
 * - password (obrigatório);
 * - data de criação (autopreenchido);
 */
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    description: {
        type: String,
        required: false,
    },
    places: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: "Place",
        required: false
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', async function (next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
