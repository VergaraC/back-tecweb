const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// id único da aplicação;
// const authConfig = require('../../config/auth');

// modelo de usuário (gabarito de como deve ficar a
// estrutura de um usuário);
const User = require('../models/User');

// router do express para utilizarmos rotas prefixadas (auth) para autenticação
const router = express.Router();

/**
 * Recebe um token e devolve outro válido por mais 24h
 * @param   {object} params objeto utilizado como entrada para validar um token de autenticação.
 * @returns {object}        um token válido por mais 24h.
 */
function generateToken(params = {}) {
    return jwt.sign(params, process.env.secret, {
        expiresIn: 86400
    });
}

// rota que lida com requisições do tipo POST em /auth/register
// exemplo www.<domain>.ext/auth/register
router.post('/register', async (req, res) => {
    // recebe email do corpo da requisição
    //console.log(Starting)
    const { email } = req.body;
    try {
        // verifica se alguém usa esse email no banco de dados
        // significa que o usuário já existe, então deve devolver
        // uma mensagem de erro
        if (await User.findOne({ email })) {
            return res.status(403).json({ error: 'User already exists' });
        }

        // se não existir, tenta criar o usuario com as informações
        // inseridas e guarda em uma constante
        //console.log("Pre User")
        const user = await User.create(req.body);
        //console.log("Post User")

        // remove a propriedade "password" da resposta
        user.password = undefined;
        // devolve a resposta
        return res.send({
            user,
            token: generateToken({ id: user.id, name: user.name})
        });
    } catch (err) {
        // se houver algum erro/imprevisto no processo anterior,
        // devolve um erro qualquer
        return res
            .status(400) // 400: Bad Request
            .send({ error: 'Registration failed' });
    }
});

// rota que lida com requisições do tipo POST em /auth/authenticate
// exemplo www.<domain>.ext/auth/authenticate
router.post('/authenticate', async (req, res) => {
    // recebe email e senha do corpo da requisição
    const { email, password } = req.body;
    // busca no banco de dados um usuário com esse email e
    // traz o password dele junto;
    const user = await User.findOne({ email }).select('+password');

    // se o user não existir, devolve "401 - User not found"
    if (!user) {
        return res
            .status(401) // 401: Unauthorized
            .send({ error: 'User not found' }); // descrição do erro
    }
    // se o password descriptografado for diferente do
    // password recebido, devolve "401 - Invalid password"
    if (!(await bcrypt.compare(password, user.password))) {
        return res
            .status(401) // 401: Unauthorized
            .send({ error: 'Invalid password' }); // descrição do erro
    }
    // remove "password" da resposta
    user.password = undefined;
    console.log("Vai sair")
    console.log(user.description)

    // devolve uma resposta com os dados do "user" e o token gerado
    res.send({ user, token: generateToken({ id: user.id, name: user.name}) });
});

module.exports = (app) => app.use('/auth', router);
