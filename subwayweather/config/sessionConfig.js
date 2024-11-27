const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
dotenv.config();

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  // 쿠키
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1일
  },
};

module.exports = sessionConfig;