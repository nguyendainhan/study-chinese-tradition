const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Toàn bộ các route trong /api/user đều bắt buộc phải đi qua middleware authenticateToken
router.use(authenticateToken);

// Lấy hồ sơ người dùng
router.get('/profile', userController.getUserProfile);

// Lấy tiến độ học tập (từ vựng đã học, thống kê SRS, điểm thưởng)
router.get('/progress', userController.getUserProgress);

// Lưu tiến độ học tập
router.post('/progress', userController.saveUserProgress);

module.exports = router;
