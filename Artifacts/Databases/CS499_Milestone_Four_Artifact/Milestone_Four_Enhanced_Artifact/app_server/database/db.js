const mongoose = require('mongoose');
require('dotenv').config();

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travlr';
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10
});

mongoose.connection.on('connected', () => console.log('Mongoose connected.'));
mongoose.connection.on('error', error => console.error('Mongoose connection error:', error.message));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected.'));

const gracefulShutdown = async (message, callback) => {
  await mongoose.connection.close();
  console.log(`Mongoose disconnected through ${message}`);
  callback();
};
process.once('SIGUSR2', () => gracefulShutdown('nodemon restart', () => process.kill(process.pid, 'SIGUSR2')));
process.on('SIGINT', () => gracefulShutdown('app termination', () => process.exit(0)));
process.on('SIGTERM', () => gracefulShutdown('application shutdown', () => process.exit(0)));

require('./models/trips');
require('./models/user');
