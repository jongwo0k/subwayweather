const bcrypt = require('bcrypt');
const User = require('../models/userModel');

// 로그인
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).render('login', { error: '등록되지 않은 사용자입니다.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).render('login', { error: '잘못된 비밀번호입니다.' });
  }

  req.session.userId = user._id;
  res.redirect('/main');
};

// 회원가입
const signupUser = async (req, res) => {
  const { username, password, confirmPassword, email } = req.body;
  const existingUser = await User.findOne({ username });

  if (password !== confirmPassword) {
    return res.status(400).render('signup', { error: '비밀번호가 일치하지 않습니다.' });
  }

  if (existingUser) {
    return res.status(400).render('signup', { error: '이미 존재하는 아이디입니다.' });
  }

  // 비밀번호 암호화
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword, email });

  await newUser.save();
  res.redirect('/login');
};

// 로그아웃
const logoutUser = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('로그아웃 중 오류 발생:', err);
      return res.status(500).send('로그아웃 실패');
    }
  res.clearCookie('connect.sid');
  res.redirect('/login');
  });
};

module.exports = { loginUser, signupUser, logoutUser };