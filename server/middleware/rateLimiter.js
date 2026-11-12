const rateLimit = require('express-rate-limit');

/**
 * 1. Login Rate Limiter (Chống tấn công Brute-force mật khẩu):
 * - Giới hạn tối đa 5 lần thử đăng nhập sai / 15 phút trên mỗi địa chỉ IP.
 * - Khóa IP tạm thời nếu vượt quá giới hạn và trả về mã lỗi HTTP 429 Too Many Requests.
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lần request
  standardHeaders: true, // Trả về thông tin RateLimit-* trong header
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút để bảo vệ an toàn tài khoản!',
    retryAfterMinutes: 15,
  },
  skipSuccessfulRequests: true, // Nếu đăng nhập thành công thì reset bộ đếm!
});

/**
 * 2. Register Rate Limiter (Chống Spam tạo tài khoản rác):
 * - Giới hạn tối đa 5 tài khoản đăng ký mới / 1 giờ trên mỗi địa chỉ IP.
 */
const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều tài khoản được đăng ký từ thiết bị của bạn trong thời gian ngắn. Vui lòng chờ 1 giờ!',
  },
});

/**
 * 3. General API Limiter (Bảo vệ API chung):
 * - Giới hạn 120 requests / phút
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Hệ thống đang tiếp nhận quá nhiều yêu cầu từ bạn. Vui lòng chậm lại một chút!',
  },
});

module.exports = {
  loginRateLimiter,
  registerRateLimiter,
  apiLimiter,
};
