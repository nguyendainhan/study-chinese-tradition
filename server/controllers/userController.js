const db = require('../config/db');

/**
 * 1. LẤY TIẾN ĐỘ HỌC TẬP (PROTECTED ENDPOINT)
 * - Middleware authenticateToken đã xác thực JWT và gán user vào req.user.userId
 * - Truy vấn an toàn qua Parameterized Query
 */
async function getUserProgress(req, res) {
  try {
    const userId = req.user.userId;

    const [rows] = await db.execute(
      'SELECT * FROM user_study_progress WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        progress: {
          masteredIds: [],
          reviewStats: {},
          rewardStats: { totalPoints: 0, streakDays: 0 },
          dailyPlan: { targetWordsCount: 25 },
          certifiedLevels: {},
        },
      });
    }

    const row = rows[0];
    return res.status(200).json({
      success: true,
      progress: {
        masteredIds: row.mastered_word_ids || [],
        reviewStats: row.review_stats || {},
        rewardStats: row.reward_stats || { totalPoints: 0, streakDays: 0 },
        dailyPlan: row.daily_plan || { targetWordsCount: 25 },
        certifiedLevels: row.certified_levels || {},
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('Lỗi lấy tiến độ học tập:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể truy xuất dữ liệu tiến độ học tập.',
    });
  }
}

/**
 * 2. LƯU TIẾN ĐỘ HỌC TẬP (PROTECTED ENDPOINT)
 * - Cập nhật danh sách từ đã thuộc, điểm thưởng, thống kê SRS
 * - Sử dụng UPSERT (INSERT ... ON DUPLICATE KEY UPDATE) với tham số hóa an toàn
 */
async function saveUserProgress(req, res) {
  try {
    const userId = req.user.userId;
    const { masteredIds, reviewStats, rewardStats, dailyPlan, certifiedLevels } = req.body;

    const upsertSql = `
      INSERT INTO user_study_progress (
        user_id,
        mastered_word_ids,
        review_stats,
        reward_stats,
        daily_plan,
        certified_levels
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        mastered_word_ids = VALUES(mastered_word_ids),
        review_stats = VALUES(review_stats),
        reward_stats = VALUES(reward_stats),
        daily_plan = VALUES(daily_plan),
        certified_levels = VALUES(certified_levels),
        updated_at = NOW()
    `;

    await db.execute(upsertSql, [
      userId,
      JSON.stringify(masteredIds || []),
      JSON.stringify(reviewStats || {}),
      JSON.stringify(rewardStats || { totalPoints: 0, streakDays: 0 }),
      JSON.stringify(dailyPlan || { targetWordsCount: 25 }),
      JSON.stringify(certifiedLevels || {}),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Đã lưu tiến độ học tập thành công vào cơ sở dữ liệu!',
    });
  } catch (error) {
    console.error('Lỗi lưu tiến độ học tập:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật dữ liệu học tập.',
    });
  }
}

/**
 * 3. LẤY HỒ SƠ CÁ NHÂN (GET PROFILE)
 */
async function getUserProfile(req, res) {
  try {
    const userId = req.user.userId;
    const [rows] = await db.execute(
      'SELECT id, username, email, display_name, avatar_url, created_at FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ người dùng.',
      });
    }

    return res.status(200).json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin hồ sơ:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể truy xuất thông tin người dùng.',
    });
  }
}

module.exports = {
  getUserProgress,
  saveUserProgress,
  getUserProfile,
};
