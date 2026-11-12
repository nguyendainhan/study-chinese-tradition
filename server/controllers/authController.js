const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'formosa_jwt_access_super_secret_key_2026_xyz!';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'formosa_jwt_refresh_super_secret_key_long_term_2026_abc!';

// Hàm sinh Access Token (thời hạn ngắn 15 phút)
function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
}

// Hàm sinh Refresh Token (thời hạn dài 7 ngày)
function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

/**
 * 1. ĐĂNG KÝ TÀI KHOẢN (REGISTER)
 * - Chống SQL Injection: Sử dụng Parameterized Queries (? placeholders)
 * - Chống trùng lặp: Bắt lỗi ER_DUP_ENTRY (mã 1062) từ UNIQUE constraint của MySQL
 * - Băm mật khẩu (Hashing): bcrypt.hash với 10 vòng muối (salt rounds)
 */
async function register(req, res) {
  try {
    const { username, email, password, displayName } = req.body;

    // Validate dữ liệu đầu vào cơ bản
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ tên đăng nhập, email và mật khẩu.',
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = String(email).trim().toLowerCase();

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập phải có ít nhất 3 ký tự.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ email không đúng định dạng.',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có độ dài từ 6 ký tự trở lên để đảm bảo an toàn.',
      });
    }

    // 1. Kiểm tra trước bằng Parameterized Query
    const checkSql = 'SELECT id, username, email FROM users WHERE username = ? OR email = ? LIMIT 1';
    const [existingUsers] = await db.execute(checkSql, [cleanUsername, cleanEmail]);

    if (existingUsers.length > 0) {
      const match = existingUsers[0];
      const conflictField = match.username.toLowerCase() === cleanUsername ? 'Tên đăng nhập' : 'Email';
      return res.status(409).json({
        success: false,
        message: `${conflictField} này đã được sử dụng. Vui lòng chọn giá trị khác hoặc chuyển sang Đăng nhập!`,
      });
    }

    // 2. Băm mật khẩu bằng bcrypt (Salt rounds = 10)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Thực thi INSERT bằng Parameterized Query
    const insertSql = `
      INSERT INTO users (username, email, password_hash, display_name)
      VALUES (?, ?, ?, ?)
    `;
    const cleanDisplay = displayName ? String(displayName).trim() : cleanUsername;

    const [result] = await db.execute(insertSql, [
      cleanUsername,
      cleanEmail,
      passwordHash,
      cleanDisplay,
    ]);

    const newUserId = result.insertId;

    // Khởi tạo bản ghi tiến độ học tập rỗng cho người dùng mới
    await db.execute(
      'INSERT INTO user_study_progress (user_id, mastered_word_ids, review_stats, reward_stats, daily_plan, certified_levels) VALUES (?, ?, ?, ?, ?, ?)',
      [newUserId, JSON.stringify([]), JSON.stringify({}), JSON.stringify({ totalPoints: 0, streakDays: 0 }), JSON.stringify({ targetWordsCount: 25 }), JSON.stringify({})]
    );

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.',
      user: {
        id: newUserId,
        username: cleanUsername,
        email: cleanEmail,
        displayName: cleanDisplay,
      },
    });
  } catch (error) {
    // Tự động bắt lỗi ER_DUP_ENTRY của MySQL (Chống trùng lặp tuyệt đối tại tầng Database)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Tài khoản (email hoặc tên đăng nhập) đã tồn tại trong cơ sở dữ liệu.',
      });
    }

    console.error('Lỗi đăng ký:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi máy chủ trong quá trình xử lý đăng ký.',
    });
  }
}

/**
 * 2. ĐĂNG NHẬP (LOGIN)
 * - Chống SQL Injection: Parameterized Query (? placeholder)
 * - Thông báo lỗi trung lập (Neutral Error Message): Tuyệt đối không phân biệt email tồn tại hay sai pass,
 *   luôn trả về "Email hoặc mật khẩu không chính xác" để chống kỹ thuật Username Enumeration.
 * - So sánh mật khẩu bằng bcrypt.compare
 * - Cấp cặp Token: Access Token (15m) + Refresh Token (7d)
 * - Lưu Refresh Token vào database MySQL
 */
async function login(req, res) {
  try {
    const { loginIdentifier, password } = req.body; // loginIdentifier có thể là email hoặc username

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email / tên đăng nhập và mật khẩu.',
      });
    }

    const cleanIdentifier = String(loginIdentifier).trim().toLowerCase();

    // 1. Truy vấn tham số hóa (Parameterized Query) an toàn 100%
    const querySql = 'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1';
    const [rows] = await db.execute(querySql, [cleanIdentifier, cleanIdentifier]);

    // LỖI TRUNG LẬP CHUẨN AN NINH:
    // Dù người dùng không tồn tại hay nhập sai mật khẩu, đều dùng chung 1 thông báo
    const NEUTRAL_ERROR_MSG = 'Email hoặc mật khẩu không chính xác.';

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: NEUTRAL_ERROR_MSG,
      });
    }

    const user = rows[0];

    // 2. So sánh mật khẩu băm với bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: NEUTRAL_ERROR_MSG,
      });
    }

    // 3. Khởi tạo Payload và sinh Access Token + Refresh Token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // 4. Lưu Refresh Token vào Database MySQL (Hết hạn sau 7 ngày)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, expiresAt]
    );

    // 5. Trả về thông tin đăng nhập thành công
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi máy chủ trong quá trình đăng nhập.',
    });
  }
}

/**
 * 3. LÀM MỚI ACCESS TOKEN (REFRESH TOKEN ENDPOINT)
 * - Nhận Refresh Token từ client
 * - Xác thực chữ ký JWT_REFRESH_SECRET và kiểm tra xem token có trong database không
 * - Cấp Access Token mới (15 phút) mà không yêu cầu user phải đăng nhập lại
 */
async function refreshToken(req, res) {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu Refresh Token trong request.',
      });
    }

    // Kiểm tra token có tồn tại và còn hạn trong Database MySQL không
    const checkSql = 'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW() LIMIT 1';
    const [rows] = await db.execute(checkSql, [token]);

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Refresh Token không hợp lệ hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
      });
    }

    // Xác thực chữ ký token
    jwt.verify(token, REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Refresh Token không hợp lệ hoặc đã bị thay đổi.',
        });
      }

      // Cấp Access Token mới
      const newAccessToken = generateAccessToken({
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email,
      });

      return res.status(200).json({
        success: true,
        accessToken: newAccessToken,
      });
    });
  } catch (error) {
    console.error('Lỗi làm mới token:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi máy chủ khi làm mới token.',
    });
  }
}

/**
 * 4. ĐĂNG XUẤT (LOGOUT)
 * - Xóa Refresh Token tương ứng trong Database MySQL
 */
async function logout(req, res) {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await db.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
    }
    return res.status(200).json({
      success: true,
      message: 'Đã đăng xuất thành công và vô hiệu hóa phiên làm việc.',
    });
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đăng xuất.',
    });
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
