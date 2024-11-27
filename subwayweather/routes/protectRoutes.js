const express = require('express');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();

// 즐겨찾기
router.get('/favorites', isAuthenticated, (req, res) => {
  
});

module.exports = router;