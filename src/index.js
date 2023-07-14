const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
require('dotenv/config');

// eslint-disable-next-line operator-linebreak
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
// eslint-disable-next-line no-console
db.on('error', console.error.bind(console, 'mongo connection error'));

const app = express();
const httpServer = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// eslint-disable-next-line arrow-body-style
httpServer.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  return console.log(`api listening on port ${process.env.PORT}!`);
});
