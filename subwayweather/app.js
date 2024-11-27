// 모듈 불러오기
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const sessionConfig = require('./config/sessionConfig');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const mongoose = require('mongoose');
const mongoUri = process.env.MONGO_URI;

// 서버 설정
const app = express();
const port = process.env.PORT || 3000;

// 세션 설정
app.use(session(sessionConfig));

// 동적 파일 ejs 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 경로 설정
app.use(express.static('public'));

// Body-parser 설정
app.use(express.urlencoded({ extended: true }));

// 라우트 등록
app.use(authRoutes);
app.use('/apiData', dataRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.redirect('/login'); // 기본 경로에서 로그인 페이지로 redirect
});

// MongoDB 실행
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// 서버 실행
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});