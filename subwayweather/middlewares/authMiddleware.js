const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) { // 로그인한 사용자
    return next();
  } else { // 비로그인
    res.redirect('/login');
  }
};

module.exports = { isAuthenticated };
