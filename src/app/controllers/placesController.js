const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// id único da aplicação;
const authConfig = require('../../config/auth');

// modelo de usuário (gabarito de como deve ficar a
// estrutura de um usuário);
const User = require('../models/User');
const Language = require('../models/Language');
const Continent = require('../models/Continent');
const Country = require('../models/Country');
const City = require('../models/City');
const { Router } = require('express');

// router do express para utilizarmos rotas prefixadas (auth) para autenticação
const router = express.Router();

/**
 * Recebe um token e devolve outro válido por mais 24h
 * @param   {object} params objeto utilizado como entrada para validar um token de autenticação.
 * @returns {object}        um token válido por mais 24h.
 */
function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    });
}

// rota que lida com requisições do tipo GET em /places
// exemplo www.<domain>.ext/places/
router.get('/', async (req, res) => {
    return res.send({ msg: 'ok' });
});

module.exports = (app) => app.use('/places', router);
