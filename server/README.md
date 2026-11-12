# 🛡️ Formosa Chinese Web - Backend Node.js & Express API

Hệ thống Backend chuẩn doanh nghiệp phục vụ Đăng ký, Đăng nhập, Quản lý Token JWT và Lưu trữ tiến độ học tập với cơ sở dữ liệu **MySQL**.

---

## 🌟 Các tính năng an ninh đã triển khai

1. **Chống trùng lặp tuyệt đối (Unique Constraint):**
   - Cơ sở dữ liệu MySQL cấu hình `UNIQUE` cho cả `username` và `email`.
   - Engine MySQL tự động từ chối và báo lỗi `ER_DUP_ENTRY (1062)` nếu có bản ghi trùng.
2. **Mã hóa mật khẩu an toàn với bcrypt (Salt rounds = 10):**
   - Mật khẩu trước khi ghi vào Database luôn được băm bằng `bcrypt.hash()`.
   - Quá trình đăng nhập sử dụng `bcrypt.compare()` để xác thực.
3. **Cơ chế xác thực Access Token & Refresh Token:**
   - **Access Token:** Có thời hạn ngắn (**15 phút**), dùng để gọi các API lấy dữ liệu học tập cá nhân.
   - **Refresh Token:** Có thời hạn dài (**7 ngày**), được mã hóa JWT và lưu trữ trong bảng `refresh_tokens` để cấp mới Access Token mà không bắt user đăng nhập lại.
4. **Middleware bảo vệ Endpoint (`authenticateToken`):**
   - Bắt buộc kiểm tra `Authorization: Bearer <accessToken>` trước khi cho phép truy cập các API riêng tư (`/api/user/*`).
5. **Chống Brute-force với `express-rate-limit`:**
   - Endpoint `/api/auth/login` giới hạn tối đa 5 lần thử sai trong 15 phút. Khóa IP tạm thời và trả về HTTP 429 nếu vượt quá.
6. **Chống SQL Injection bằng Parameterized Queries:**
   - Tất cả câu lệnh MySQL đều sử dụng ký hiệu `?` (Prepared Statements) thông qua `mysql2/promise`.
7. **Thông báo lỗi trung lập (Neutral Error Message):**
   - Khi đăng nhập sai, máy chủ luôn trả về đúng 1 câu thông báo: `"Email hoặc mật khẩu không chính xác."` (HTTP 401), ngăn chặn kẻ xấu dò quét xem email nào đã tồn tại trong hệ thống.

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### Bước 1: Khởi tạo Cơ sở dữ liệu MySQL
Mở MySQL Workbench, phpMyAdmin hoặc dòng lệnh MySQL và chạy file:
```sql
SOURCE /duong-dan-toi-thu-muc/server/database_mysql.sql;
```
Lệnh này sẽ tạo Database `formosa_study_db` cùng 4 bảng: `users`, `refresh_tokens`, `user_study_progress`, và `tocfl_exam_history`.

### Bước 2: Cấu hình biến môi trường
Tạo file `.env` từ file `.env.example`:
```bash
cp .env.example .env
```
Mở file `.env` và điền mật khẩu MySQL của bạn:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_mysql_cua_ban
DB_NAME=formosa_study_db

JWT_ACCESS_SECRET=chuoi_bi_mat_ngau_nhien_access_token_123
JWT_REFRESH_SECRET=chuoi_bi_mat_ngau_nhien_refresh_token_456
```

### Bước 3: Cài đặt thư viện và Khởi chạy
Tại thư mục `server`:
```bash
npm install
npm start
```
Server sẽ chạy tại cổng `http://localhost:5000`.

---

## 📡 Danh sách API Endpoints

### 1. Xác thực (Authentication)
| Phương thức | Đường dẫn | Chức năng | Bảo vệ |
|---|---|---|---|
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới | `registerRateLimiter` |
| `POST` | `/api/auth/login` | Đăng nhập nhận cặp Access & Refresh Token | `loginRateLimiter` |
| `POST` | `/api/auth/refresh` | Làm mới Access Token khi hết hạn | Kiểm tra Refresh Token trong DB |
| `POST` | `/api/auth/logout` | Đăng xuất và hủy Refresh Token | Không |

### 2. Dữ liệu người dùng (Protected APIs)
*Yêu cầu Header:* `Authorization: Bearer <accessToken>`

| Phương thức | Đường dẫn | Chức năng |
|---|---|---|
| `GET` | `/api/user/profile` | Lấy thông tin tài khoản |
| `GET` | `/api/user/progress` | Lấy tiến độ học (từ đã thuộc, SRS, streak) |
| `POST` | `/api/user/progress` | Lưu tiến độ học tập vào MySQL |

