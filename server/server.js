const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Bảo mật HTTP Headers với Helmet
app.use(helmet());

// 2. Cấu hình CORS
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép request không có origin (ví dụ curl, Postman hoặc mobile app)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Trong dev có thể mở rộng linh hoạt
      }
    },
    credentials: true,
  })
);

// 3. Parser JSON Body
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Áp dụng Rate Limit chung cho các API
app.use('/api/', apiLimiter);

// 5. Đăng ký các Route
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Route kiểm tra trạng thái sức khỏe máy chủ
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    serverTime: new Date().toISOString(),
    message: 'Formosa Study Backend đang hoạt động ổn định.',
  });
});

// Xử lý Route không tồn tại (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint API không tồn tại.',
  });
});

// Xử lý lỗi toàn cục (Global Error Handler)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: 'Đã xảy ra lỗi nội bộ trên máy chủ.',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Formosa Backend Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`🔒 Hệ thống xác thực JWT & MySQL Parameterized Queries đã sẵn sàng.`);
});
