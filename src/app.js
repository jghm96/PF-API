require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const routes = require('./routes/index.js');
const passport = require('passport');
const session = require('express-session')
const {SECRET_SESSION,} = process.env;
const cors = require('cors')
const cron = require('node-cron')
require('./db.js');
require('./Passport/index.js');


const server = express();

server.name = 'API';
console.log(process.env.CLIENT_URL)
server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
server.use(bodyParser.json({ limit: '50mb' }));
server.use(cookieParser());
server.use(cors())
server.use(morgan('dev'));
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

server.use(session({
  secret: SECRET_SESSION,
  resave:true,
  saveUninitialized:true
}))
server.use(passport.initialize());
server.use(passport.session());

server.use('/', routes);

require(`./Temporizador`)

// Error catching endware.
server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});


module.exports = server;
