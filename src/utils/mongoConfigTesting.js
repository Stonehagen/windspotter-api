const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const mongoServer = new MongoMemoryServer();

const startServer = async () => {
  await mongoServer.start();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);

  mongoose.connection.on('error', (e) => {
    if (e.message.code === 'ETIMEDOUT') {
      console.log(e);
      mongoose.connect(mongoUri);
    }
    console.log(e);
  });

  mongoose.connection.once('open', () => {
    console.log(`MongoDB successfully connected to ${mongoUri}`);
  });
};

const stopServer = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

module.exports = {
  startServer,
  stopServer,
};
