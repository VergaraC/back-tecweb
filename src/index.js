const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const { PORT } = require('./config/constants');

const app = express();

app.use(cors());
app.use(helmet())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
// app.use(helmet());

require('./app/controllers/')(app);

app.listen(process.env.PORT || PORT);
