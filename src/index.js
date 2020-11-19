require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser'); // ler o corpo das requisições
const morgan = require('morgan'); // logs
const helmet = require('helmet'); // segurança básica
const cors = require('cors'); // cross-origin resource sharing google pesquisar

// const { PORT } = require('./config/constants');

const app = express();

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));

require('./app/controllers/')(app);

app.listen(process.env.PORT || 3333);


