const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
require('dotenv/config');
require('./config/passport');

const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

const app = express();
const httpServer = http.createServer(app);

const routes = require('./routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/spot', routes.spot);
app.use('/map', routes.map);
app.use('/user', routes.user);
app.use('/session', routes.session);

httpServer.listen(process.env.PORT, () => {
  return console.log(`api listening on port ${process.env.PORT}!`);
});
