-- ====================================================================
-- Formosa Chinese Web - Hệ Thống Cơ Sở Dữ Liệu MySQL Chuẩn Doanh Nghiệp
-- Thiết kế chống trùng lặp (UNIQUE), bảo mật khóa ngoại, lưu trữ tiến độ học tập
-- ====================================================================

CREATE DATABASE IF NOT EXISTS formosa_study_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE formosa_study_db;

-- 1. BẢNG NGƯỜI DÙNG (USERS)
-- Chống trùng lặp tuyệt đối tại tầng Database với UNIQUE INDEX cho cả username và email
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) DEFAULT NULL,
  avatar_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Ràng buộc chống trùng lặp cấp cơ sở dữ liệu:
  -- Nếu có lệnh INSERT email hoặc username đã tồn tại, MySQL sẽ tự động reject với lỗi ER_DUP_ENTRY (mã 1062)
  CONSTRAINT uq_users_username UNIQUE (username),
  CONSTRAINT uq_users_email UNIQUE (email),

  INDEX idx_users_username (username),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG REFRESH TOKENS (Quản lý phiên đăng nhập dài hạn)
-- Lưu trữ Refresh Token (thời hạn 7 - 30 ngày) để cấp mới Access Token khi hết hạn
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_refresh_token (token),
  INDEX idx_refresh_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG TIẾN ĐỘ HỌC TẬP (USER STUDY PROGRESS)
-- Lưu trữ từ vựng đã học, thống kê SRS, điểm thưởng, ngày streak
CREATE TABLE IF NOT EXISTS user_study_progress (
  user_id INT PRIMARY KEY,
  mastered_word_ids JSON DEFAULT NULL COMMENT 'Mảng ID các từ đã thuộc',
  review_stats JSON DEFAULT NULL COMMENT 'Dữ liệu SRS ôn tập (correctCount, wrongCount, lastReviewed)',
  reward_stats JSON DEFAULT NULL COMMENT 'Điểm thưởng, chuỗi ngày streak',
  daily_plan JSON DEFAULT NULL COMMENT 'Mục tiêu ngày, bài đã hoàn thành',
  certified_levels JSON DEFAULT NULL COMMENT 'Chứng nhận cấp độ TOCFL đã thi đỗ',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_study_progress_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG LỊCH SỬ THI TOCFL MOCK EXAM
CREATE TABLE IF NOT EXISTS tocfl_exam_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exam_type VARCHAR(50) NOT NULL DEFAULT 'mock-tocfl-cbt',
  band_or_level VARCHAR(50) NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  accuracy INT NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_exam_history_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_exam_user (user_id),
  INDEX idx_exam_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
