const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
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

  const currentUserId = user._id.toString();
  const db = mongoose.connection.db;
  const sessionCollection = db.collection('sessions');

  await sessionCollection.deleteMany({ 
    session: { $regex: new RegExp(`"userId":"${currentUserId}"`) } 
  });
  /*
  const allSessions = await sessionCollection.find({}).toArray();
  for (let sess of allSessions) {
    try {
      const data = JSON.parse(sess.session);
      if (data.userId === user._id.toString()) {
        await sessionCollection.deleteOne({ _id: sess._id });
      }
    } catch (err) {
      console.error('세션 파싱 실패:', err);
    }
  }
  */

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

// 회원정보 수정
const updateUser = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  try {
    const user = await User.findById(req.session.userId);


    // 비밀번호 변경
    if (currentPassword || newPassword || confirmNewPassword) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ error: '모든 비밀번호 필드를 입력해주세요.' });
      }

      // 일치 확인
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: '현재 비밀번호가 일치하지 않습니다.' });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ error: '새 비밀번호가 확인 비밀번호와 일치하지 않습니다.' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.status(200).json({ message: '비밀 번호가 성공적으로 변경되었습니다.' });
  } catch (error) {
    console.error('회원 정보 수정 오류:', error);
    res.status(500).json({ error: '비밀 변호 변경 중 오류가 발생했습니다.' });
  }
};

// 회원탈퇴
const deleteUser = async (req, res) => {
  const userId = req.session.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).send('사용자를 찾을 수 없습니다.');
    }

    req.session.destroy();
    res.clearCookie('connect.sid');
    res.status(200).send('회원 탈퇴가 완료되었습니다.');
  } catch (error) {
    console.error('회원 탈퇴 오류:', error);
    res.status(500).send('회원 탈퇴 중 오류가 발생했습니다.');
  }
}

module.exports = { loginUser, signupUser, logoutUser, updateUser, deleteUser };
