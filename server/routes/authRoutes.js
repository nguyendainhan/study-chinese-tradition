const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginRateLimiter, registerRateLimiter } = require('../middleware/rateLimiter');

// 1. Đăng ký tài khoản (Bảo vệ bởi registerRateLimiter)
router.post('/register', registerRateLimiter, authController.register);

// 2. Đăng nhập (Bảo vệ bởi loginRateLimiter chống Brute-force)
router.post('/login', loginRateLimiter, authController.login);

// 3. Làm mới Access Token bằng Refresh Token
router.post('/refresh', authController.refreshToken);

// 4. Đăng xuất (Vô hiệu hóa Refresh Token)
router.post('/logout', authController.logout);

module.exports = router;
