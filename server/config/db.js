const mysql = require('mysql2/promise');
require('dotenv').config();

// Khởi tạo Connection Pool kết nối MySQL
// Connection Pool tối ưu hiệu năng xử lý hàng nghìn kết nối đồng thời
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'formosa_study_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

// Kiểm tra kết nối khi khởi động server
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Đã kết nối thành công tới cơ sở dữ liệu MySQL: ' + (process.env.DB_NAME || 'formosa_study_db'));
    connection.release();
  } catch (err) {
    console.error('❌ Lỗi kết nối MySQL:', err.message);
    console.log('💡 Gợi ý: Hãy kiểm tra file .env xem username, password hoặc database đã tạo chưa.');
  }
}

testConnection();

module.exports = pool;

