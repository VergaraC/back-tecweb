const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('../../database');

// id único da aplicação;
const authConfig = require('../../config/auth');
// middleware de autenticação
const authMiddleware = require('../middlewares/auth');
// router do express para utilizarmos rotas prefixadas (auth) para autenticação
const router = express.Router();
router.use(authMiddleware);

// modelo de usuário (gabarito de como deve ficar a
// estrutura de um usuário);
const User = require('../models/User');
const Language = require('../models/Language');
const Continent = require('../models/Continent');
const Country = require('../models/Country');
const Place = require('../models/Place');
const City = require('../models/City');
const ObjectId = mongoose.Types.ObjectId;

/**
 * Recebe um token e devolve outro válido por mais 24h
 * @param   {object} params objeto utilizado como entrada para validar um token de autenticação.
 * @returns {object}        um token válido por mais 24h.
 */
function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 24 * 3600 // 1 dia
    });
}

// rota que lida com requisições do tipo GET em /places
// exemplo www.<domain>.ext/places/
router.get('/:_id', async (req, res) => {
    try {
        const { _id } = req.params;
        const { userId, userName } = req;

        if (!_id) {
            return res.status(400).send({ error: 'Missing _id' });
        }

        const opt = '-_id -__v';
        const city = await City.findOne({ _id })
            .select('-__v')
            .populate({
                path: 'country',
                populate: [
                    { path: 'languages', select: opt },
                    { path: 'continent', select: opt }
                ],
                select: opt
            })
            .lean();

        let likes = city.likes || [];
        let likedByMe = likes.some((like) => {
            return like.equals(userId);
        });
        city.likes = likes.length;
        city.likedByMe = likedByMe;

        res.send({
            city,
            token: generateToken({ id: userId, name: userName })
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: 'Problema na requisição' });
    }
});

// requisição responsável por "dar like" em uma cidade
router.put('/:_id', async (req, res) => {
    try {
        const { _id } = req.params;
        const { userId, userName } = req;

        if (!_id) {
            return res.status(400).send({ error: 'Missing _id' });
        } 
        // buscamos informações do usuário e da cidade no banco de dados
        const user = await User.findById(userId).populate('places').lean();
        const city = await City.findById(_id).lean();

        // verificamos se o usuário já existe no array de likes da cidade
        const alreadyLikedByMe = city.likes.some((like) => {
            return like.equals(userId);
        });
        /**
         * Se o usuário já tiver dado like nessa cidade, consideramos uma ação de deslike:
         * - removemos o usuário de city.likes;
         * - removemos o place dos likes do usuário;
         * - deletamos o place;
         * - salvamos as alterações em city e user;
         */ 
        if (alreadyLikedByMe) {
            const cityLikes = city.likes.filter((like) => {
                return !like.equals(userId);
            });
            const userPlaces = user.places.filter((place) => {
                return !place.city.equals(city._id);
            });

            await City.findByIdAndUpdate(city._id, { likes: cityLikes });
            await User.findByIdAndUpdate(userId, { places: userPlaces });
            await Place.findOneAndDelete({ owner: userId, city: city._id });

            return res.send({
                placeIsLiked: false,
                token: generateToken({ id: userId, name: userName })
            });
        }

        /**
         * Se o usuário não tiver dado like, consideramos uma ação de like:
         * - adicionamos o usuário no array de likes da cidade;
         * - criamos um novo place vinculado ao usuário e à cidade;
         * -
         */

        const place = new Place({
            city: city._id,
            owner: userId
        });

        const cityLikes = city.likes;
        cityLikes.push(userId);

        const userPlaces = user.places;
        userPlaces.push(place._id);

        await place.save();
        await User.findByIdAndUpdate(userId, {
            places: userPlaces
        });
        await City.findByIdAndUpdate(city._id, {
            likes: cityLikes
        });

        return res.send({
            placeIsLiked: true,
            token: generateToken({ id: userId, name: userName })
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: 'Problema na requisição' });
    }
});

module.exports = (app) => app.use('/places', router);
