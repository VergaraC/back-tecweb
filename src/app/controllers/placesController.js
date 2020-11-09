const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('../../database');

// id único da aplicação;
// const authConfig = require('../../config/auth');
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
const Note = require('../models/Note');
const ObjectId = mongoose.Types.ObjectId;

/**
 * Recebe um token e devolve outro válido por mais 24h
 * @param   {object} params objeto utilizado como entrada para validar um token de autenticação.
 * @returns {object}        um token válido por mais 24h.
 */
function generateToken(params = {}) {
    return jwt.sign(params, process.env.secret, {
        expiresIn: 24 * 3600 // 1 dia
    });
}

// rota que lida com requisições do tipo GET em /places
// exemplo www.<domain>.ext/places/cities/5fa8226ff3453622b00feaf8
router.get('/cities/:_id', async (req, res) => {
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

// Requisição responsável por listar as cidades "likadas" pelo usuário
router.get('/likes', async (req, res) => {
    try {
        const { userId, userName } = req;

        const opt = '-_id -__v';
        const places = await Place.find({ owner: userId })
            .select('-__v')
            .populate([
                {
                    path: 'city',
                    select: '-__v',
                    populate: {
                        path: 'country',
                        populate: [
                            { path: 'languages', select: opt },
                            { path: 'continent', select: opt }
                        ],
                        select: opt
                    }
                },
                {
                    path: 'annotations',
                    select: '-__v'
                }
            ])
            .lean();

        places.forEach(({ city }, index) => {
            places[index].city.likes = city.likes?.length || 0;
            places[index].city.likedByMe = true;
        });

        res.send({
            places,
            token: generateToken({ id: userId, name: userName })
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: 'Problema na requisição' });
    }
});

// requisição responsável por "dar like" em uma cidade
router.put('/likes/:_id', async (req, res) => {
    try {
        const { _id } = req.params;
        const { userId, userName } = req;

        if (!_id) {
            return res.status(400).send({ error: 'Missing _id' });
        }
        // buscamos informações do usuário e da cidade no banco de dados
        const user = await User.findById(userId)
            .populate({ path: 'places', select: '_id city' })
            .lean();
        const city = await City.findById(_id).lean();

        // verificamos se o usuário já existe no array de likes da cidade
        let likes = city.likes || [];
        const alreadyLikedByMe = likes.some((like) => {
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

        const cityLikes = city.likes || [];
        cityLikes.push(userId);

        const userPlaces = user.places || [];
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
        res.status(400).send({ error: 'Problema ao atualizar likes' });
    }
});

// criar uma nota sobre um lugar (salvo)
router.post('/notes/:place_id', async (req, res) => {
    try {
        const { place_id } = req.params;
        const { userId, userName } = req;
        const { description, title } = req.body;

        const place = await Place.findOne({ _id: place_id, owner: userId });

        const note = new Note({
            description,
            title,
            owner: userId,
            place: place._id
        });

        place.annotations.push(note._id);

        await Promise.all([note.save(), place.save()]);

        res.send({
            noteId: note._id,
            token: generateToken({ id: userId, name: userName })
        });
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .send({ error: 'Não foi possível atualizar nota' });
    }
});

// atualizar uma nota
router.put('/notes/:note_id', async (req, res) => {
    try {
        const { note_id } = req.params;
        const { userId, userName } = req;
        const { description, title } = req.body;

        const note = await Note.findByIdAndUpdate(note_id, {
            description,
            title
        });

        res.send({
            noteId: note._id,
            token: generateToken({ id: userId, name: userName })
        });
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .send({ error: 'Não foi possível atualizar nota' });
    }
});

// deletar uma nota
router.delete('/notes/:note_id', async (req, res) => {
    try {
        const { note_id } = req.params;
        const { userId, userName } = req;

        const note = await Note.findByIdAndDelete(note_id);

        if (!note) {
            return res.status(404).send({ error: 'Nota não encontrada' });
        }

        res.send({
            noteId: note._id,
            token: generateToken({ id: userId, name: userName })
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send({ error: 'Não foi possível remover nota' });
    }
});

module.exports = (app) => app.use('/places', router);
