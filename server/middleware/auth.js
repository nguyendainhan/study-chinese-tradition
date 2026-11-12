const jwt = require('jsonwebtoken');

/**
 * Middleware bảo vệ Endpoint riêng tư (Authenticate Token):
 * - Đọc token từ header: Authorization: Bearer <accessToken>
 * - Kiểm tra chữ ký mật JWT_ACCESS_SECRET và thời hạn hiệu lực (15-30 phút)
 * - Nếu token không hợp lệ hoặc đã hết hạn, trả về mã 401 hoặc 403
 * - Nếu hợp lệ, giải mã payload và gán vào req.user = { userId, username, email }
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Định dạng chuẩn: "Bearer <token>"
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không tìm thấy Access Token xác thực. Vui lòng đăng nhập để tiếp tục!',
      code: 'AUTH_TOKEN_MISSING',
    });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'formosa_jwt_access_super_secret_key_2026_xyz!', (err, decodedUser) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access Token đã hết hạn. Vui lòng gửi Refresh Token để làm mới phiên!',
          code: 'TOKEN_EXPIRED',
        });
      }
      return res.status(403).json({
        success: false,
        message: 'Token xác thực không hợp lệ.',
        code: 'TOKEN_INVALID',
      });
    }

    // Gán dữ liệu người dùng vào request để các route kế tiếp sử dụng
    req.user = decodedUser;
    next();
  });
}

module.exports = {
  authenticateToken,
};
