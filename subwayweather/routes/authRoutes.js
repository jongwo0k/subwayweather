const express = require('express');
const { loginUser, signupUser, logoutUser } = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();
const User = require('../models/userModel');

// GET :  로그인, 회원가입, 로그아웃, 메인
router.get('/login', (req, res) => {
  res.render('login', { title: 'SubwayWeather: Login', error: null });
});

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'SubwayWeather: Signup', error: null });
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('로그아웃 실패:', err);
      return res.status(500).send('로그아웃 실패');
    }
  res.redirect('/login')
  });
});

// 로그인한 사용자만 접속
router.get('/main', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }
    res.render('main', {title: 'SubwayWeather: Main', username: user.username, error: null });
  } catch (err) {
    console.error('사용자 조회 오류 : ', err);
    res.status(500).send('server error');
  }
});

// POST : 로그인, 회원가입
router.post('/login', loginUser);
router.post('/signup', signupUser);

module.exports = router;