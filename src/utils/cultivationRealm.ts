import { UserAccountData, updateUserAccountData } from './userAccountDb';

export interface CultivationRealm {
  id: string;
  rankNumber: number;
  title: string;
  subTitle: string;
  tocflBand: string;
  badge: string;
  description: string;
  minMasteredWords: number;
  minExp: number;
  perks: string[];
  theme: {
    badgeBg: string;
    badgeText: string;
    border: string;
    glow: string;
    textColor: string;
    headerGradient: string;
  };
}

export const CULTIVATION_REALMS: CultivationRealm[] = [
  {
    id: 'novice',
    rankNumber: 0,
    title: 'Học Đồ Dự Bị',
    subTitle: 'TOCFL Novice - Khởi Nguyên Chú Âm',
    tocflBand: 'Novice',
    badge: '🥋',
    description: 'Bắt đầu tích lũy Nguyên Lực (EXP) từ các nét chữ và Chú âm ㄅㄆㄇㄈ cơ bản.',
    minMasteredWords: 0,
    minExp: 0,
    perks: ['Truy cập bảng Chú Âm', 'Học từ vựng cơ bản', 'Mở khóa Bảng nhiệm vụ F'],
    theme: {
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-800',
      border: 'border-slate-300',
      glow: 'shadow-slate-300/40',
      textColor: 'text-slate-700',
      headerGradient: 'from-slate-700 to-slate-900',
    },
  },
  {
    id: 'a',
    rankNumber: 1,
    title: 'Vũ Giả - Luyện Khí Kỳ',
    subTitle: 'TOCFL Band A (A1 - A2) - Nhiệm Vụ Công Hội',
    tocflBand: 'Band A',
    badge: '⚡',
    description: 'Chính thức nhận nhiệm vụ từ Công hội. Đủ sức giao tiếp sinh tồn và đi lại cơ bản tại Đài Loan.',
    minMasteredWords: 500,
    minExp: 1500,
    perks: ['Nhận nhiệm vụ săn thưởng Quest E', 'Gõ chữ Hán Phồn thể', 'Tích lũy Tinh Tệ nhanh hơn'],
    theme: {
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-900',
      border: 'border-emerald-400',
      glow: 'shadow-emerald-400/40',
      textColor: 'text-emerald-700',
      headerGradient: 'from-emerald-700 to-teal-900',
    },
  },
  {
    id: 'b1',
    rankNumber: 2,
    title: 'Chiến Tướng - Trúc Cơ Kỳ',
    subTitle: 'TOCFL Band B1 (Cấp 3) - Sinh Tồn Độc Lập',
    tocflBand: 'Band B1',
    badge: '⚔️',
    description: 'Đủ sức mạnh để sinh tồn độc lập, làm việc tại văn phòng/công xưởng và giao tiếp hàng ngày tại Đài Loan.',
    minMasteredWords: 1500,
    minExp: 5000,
    perks: ['Mở khóa Đọc hiểu B1', 'Nhiệm vụ săn thưởng cấp D', 'Đặc quyền Khiên Khóa Thời Gian'],
    theme: {
      badgeBg: 'bg-cyan-100',
      badgeText: 'text-cyan-900',
      border: 'border-cyan-400',
      glow: 'shadow-cyan-400/40',
      textColor: 'text-cyan-700',
      headerGradient: 'from-cyan-700 to-blue-950',
    },
  },
  {
    id: 'b2',
    rankNumber: 3,
    title: 'Chiến Thần - Kết Đan Kỳ',
    subTitle: 'TOCFL Band B2 (Cấp 4) - Đột Phá Bão Hòa',
    tocflBand: 'Band B2',
    badge: '🔥',
    description: 'Làm chủ các bài đọc hiểu và ngữ pháp phức tạp. Trụ cột kỹ thuật chuyên môn cao tại Đài Loan.',
    minMasteredWords: 3000,
    minExp: 12000,
    perks: ['Mở khóa Mô Phỏng Đột Phá B2', 'Nhiệm vụ cấp C', 'Huy hiệu Chiến Thần Vàng'],
    theme: {
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-900',
      border: 'border-amber-400',
      glow: 'shadow-amber-400/40',
      textColor: 'text-amber-700',
      headerGradient: 'from-amber-600 to-orange-950',
    },
  },
  {
    id: 'c1',
    rankNumber: 4,
    title: 'Hành Tinh Cấp - Chưởng Sinh',
    subTitle: 'TOCFL Band C1 (Cấp 5) - Thông Tuệ Đa Lĩnh Vực',
    tocflBand: 'Band C1',
    badge: '🪐',
    description: 'Thông thạo từ vựng báo chí, chính trị xã hội và thuật ngữ chuyên ngành chuyên sâu.',
    minMasteredWords: 5500,
    minExp: 22000,
    perks: ['Quyền năng Đột Phá C1', 'Danh hiệu Tinh Hệ Thợ Săn', 'Tỷ lệ rơi Tinh Tệ +50%'],
    theme: {
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-900',
      border: 'border-purple-400',
      glow: 'shadow-purple-400/40',
      textColor: 'text-purple-700',
      headerGradient: 'from-purple-700 to-indigo-950',
    },
  },
  {
    id: 'c2',
    rankNumber: 5,
    title: 'Hằng Tinh Cấp - Hóa Đạo',
    subTitle: 'TOCFL Band C2 (Cấp 6) - Cực Hạn Ngôn Ngữ',
    tocflBand: 'Band C2',
    badge: '☀️',
    description: 'Đỉnh cao lưu loát, thông thạo mọi bí thuật ngôn ngữ và văn hóa Đài Loan.',
    minMasteredWords: 8000,
    minExp: 35000,
    perks: ['Vô Thượng Cảnh Giới', 'Thần Tượng Công Hội', 'Hoàn tất 8.000 Hán Tự Phồn Thể'],
    theme: {
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-900',
      border: 'border-rose-400',
      glow: 'shadow-rose-400/40',
      textColor: 'text-rose-700',
      headerGradient: 'from-red-600 to-rose-950',
    },
  },
];

/**
 * Tính tổng Nguyên Lực (EXP) của người học.
 * Đảm bảo mức EXP chuẩn xác, không bị lạm phát vượt quá thực lực từ vựng.
 */
export function getUserTotalExp(
  account: UserAccountData | null,
  fallbackMasteredCount: number = 0
): number {
  const masteredWords = account?.masteredIds ? account.masteredIds.length : fallbackMasteredCount;
  const certLevels = Object.keys(account?.certifiedLevels || {}).length;

  if (account) {
    if (typeof account.rewardStats?.exp === 'number' && account.rewardStats.exp > 0) {
      // Giới hạn trần EXP hợp lý theo số từ đã học và cấp độ để không nhảy cóc cảnh giới
      const maxAllowedExp = Math.max(1500, masteredWords * 15 + certLevels * 500);
      return Math.min(account.rewardStats.exp, maxAllowedExp);
    }
    // Fallback chuẩn: mỗi từ đã học đóng góp 5 EXP + điểm quiz tương xứng (tối đa bằng số từ * 5) + mỗi cấp đạt 300 EXP
    const points = account.rewardStats?.totalPoints || 0;
    const pointsExp = Math.min(points, masteredWords * 5);
    return masteredWords * 5 + pointsExp + certLevels * 300;
  }

  // Khách (Guest)
  return fallbackMasteredCount * 5;
}

/**
 * Tính tổng Tinh Tệ (Star Coins / Credits) của người học.
 */
export function getUserStarCoins(
  account: UserAccountData | null,
  fallbackPoints: number = 0
): number {
  if (account) {
    if (typeof account.rewardStats?.starCoins === 'number' && account.rewardStats.starCoins > 0) {
      return account.rewardStats.starCoins;
    }
    const points = account.rewardStats?.totalPoints || fallbackPoints;
    const certLevels = Object.keys(account.certifiedLevels || {}).length;
    return Math.max(10, Math.floor(points / 10) + certLevels * 25);
  }

  return Math.max(10, Math.floor(fallbackPoints / 10));
}

/**
 * Lấy số lượng Khiên Khóa Thời Gian (Streak Freeze) hiện có
 */
export function getUserStreakFreezes(account: UserAccountData | null): number {
  if (account?.rewardStats?.freezeStreakInventory !== undefined) {
    return account.rewardStats.freezeStreakInventory;
  }
  // Mặc định tặng 1 khiên cho người mới để bảo vệ chuỗi
  return 1;
}

export interface UserRealmProgress {
  currentRealm: CultivationRealm;
  nextRealm: CultivationRealm | null;
  currentExp: number;
  wordsMastered: number;
  progressPercent: number; // 0 - 100%
  expNeededForNext: number;
  wordsNeededForNext: number;
  isMaxRealm: boolean;
}

/**
 * Xác định Cảnh Giới hiện tại và tiến độ đột phá lên cảnh giới kế tiếp.
 * Cảnh Giới được KHÓA CỨNG theo Cột Mốc Từ Vựng (Bottleneck) & Chứng chỉ TOCFL thực tế:
 * - Học Đồ Dự Bị: TOCFL Novice (< 500 từ)
 * - Vũ Giả - Luyện Khí Kỳ: TOCFL Band A (A1 - A2) (500 - 1.499 từ hoặc có chứng chỉ A1/A2)
 * - Chiến Tướng - Trúc Cơ Kỳ: TOCFL Band B1 (1.500 - 2.999 từ hoặc có chứng chỉ B1)
 * - Chiến Thần - Kết Đan Kỳ: TOCFL Band B2 (3.000 - 5.499 từ hoặc có chứng chỉ B2)
 * - Hành Tinh Cấp - Chưởng Sinh: TOCFL Band C1 (5.500 - 7.999 từ hoặc có chứng chỉ C1)
 * - Hằng Tinh Cấp - Hóa Đạo: TOCFL Band C2 (8.000 từ Phồn thể)
 */
export function getUserCurrentRealm(
  account: UserAccountData | null,
  fallbackMasteredCount: number = 0
): UserRealmProgress {
  const wordsMastered = account?.masteredIds ? account.masteredIds.length : fallbackMasteredCount;
  const certified = account?.certifiedLevels || {};

  // Điều kiện Cảnh Giới bắt buộc phải đạt mốc từ vựng hoặc bài thi chứng nhận
  const hasC2 = wordsMastered >= 8000;
  const hasC1 = hasC2 || Boolean(certified['level5']) || wordsMastered >= 5500;
  const hasB2 = hasC1 || Boolean(certified['level4']) || wordsMastered >= 3000;
  const hasB1 = hasB2 || Boolean(certified['level3']) || wordsMastered >= 1500;
  const hasA = hasB1 || Boolean(certified['level1'] || certified['level2']) || wordsMastered >= 500;

  let currentIndex = 0; // Novice: Học Đồ Dự Bị
  if (hasC2) {
    currentIndex = 5; // Hằng Tinh Cấp (C2)
  } else if (hasC1) {
    currentIndex = 4; // Hành Tinh Cấp (C1)
  } else if (hasB2) {
    currentIndex = 3; // Chiến Thần (B2)
  } else if (hasB1) {
    currentIndex = 2; // Chiến Tướng (B1)
  } else if (hasA) {
    currentIndex = 1; // Vũ Giả - Luyện Khí Kỳ (A1 - A2)
  } else {
    currentIndex = 0; // Học Đồ Dự Bị (Novice)
  }

  const currentRealm = CULTIVATION_REALMS[currentIndex];
  const nextRealm =
    currentIndex < CULTIVATION_REALMS.length - 1 ? CULTIVATION_REALMS[currentIndex + 1] : null;

  const currentExp = getUserTotalExp(account, fallbackMasteredCount);

  if (!nextRealm) {
    return {
      currentRealm,
      nextRealm: null,
      currentExp,
      wordsMastered,
      progressPercent: 100,
      expNeededForNext: 0,
      wordsNeededForNext: 0,
      isMaxRealm: true,
    };
  }

  // Tính tiến độ từ vựng trong cảnh giới hiện tại
  const prevWordsFloor = currentRealm.minMasteredWords;
  const targetWords = nextRealm.minMasteredWords;
  const wordsRange = Math.max(1, targetWords - prevWordsFloor);
  const wordsEarnedInRange = Math.max(0, wordsMastered - prevWordsFloor);
  const wordsPct = Math.min(100, Math.round((wordsEarnedInRange / wordsRange) * 100));

  // Tính tiến độ Nguyên Lực (EXP) trong cảnh giới hiện tại
  const prevExpFloor = currentRealm.minExp;
  const targetExp = nextRealm.minExp;
  const expRange = Math.max(1, targetExp - prevExpFloor);
  const expEarnedInRange = Math.max(0, currentExp - prevExpFloor);
  const expPct = Math.min(100, Math.round((expEarnedInRange / expRange) * 100));

  // Tiến độ cảnh giới kết hợp cả từ vựng và EXP
  const progressPercent = Math.min(100, Math.round(wordsPct * 0.6 + expPct * 0.4));

  return {
    currentRealm,
    nextRealm,
    currentExp,
    wordsMastered,
    progressPercent,
    expNeededForNext: Math.max(0, targetExp - currentExp),
    wordsNeededForNext: Math.max(0, targetWords - wordsMastered),
    isMaxRealm: false,
  };
}

/**
 * Cộng thêm Nguyên Lực (EXP) và Tinh Tệ (Star Coins) cho người dùng
 */
export function awardUserCultivationResources(
  account: UserAccountData | null,
  expToAdd: number,
  coinsToAdd: number
): UserAccountData | null {
  if (!account) return null;

  const currentExp = getUserTotalExp(account);
  const currentCoins = getUserStarCoins(account);

  const nextExp = currentExp + Math.max(0, expToAdd);
  const nextCoins = currentCoins + Math.max(0, coinsToAdd);

  return updateUserAccountData(account.userId, (prev) => ({
    ...prev,
    rewardStats: {
      ...prev.rewardStats,
      totalPoints: (prev.rewardStats?.totalPoints || 0) + Math.round(expToAdd / 5),
      exp: nextExp,
      starCoins: nextCoins,
    },
  }));
}

/**
 * Mua vật phẩm trong Cửa Hàng Trạm Không Gian
 */
export function buyShopItem(
  account: UserAccountData | null,
  itemType: 'freeze-streak',
  price: number
): { ok: boolean; updatedUser?: UserAccountData; message: string } {
  if (!account) {
    return { ok: false, message: 'Vui lòng đăng nhập để sử dụng Cửa Hàng Trạm Không Gian!' };
  }

  const currentCoins = getUserStarCoins(account);
  if (currentCoins < price) {
    return {
      ok: false,
      message: `Tinh Tệ không đủ! Bạn cần ${price} Tinh Tệ (hiện có ${currentCoins} Tinh Tệ). Hãy hoàn thành bài ôn để nhận thêm!`,
    };
  }

  const currentFreezes = getUserStreakFreezes(account);

  const updated = updateUserAccountData(account.userId, (prev) => ({
    ...prev,
    rewardStats: {
      ...prev.rewardStats,
      starCoins: currentCoins - price,
      freezeStreakInventory: currentFreezes + 1,
    },
  }));

  if (!updated) {
    return { ok: false, message: 'Lỗi cập nhật tài nguyên. Vui lòng thử lại!' };
  }

  return {
    ok: true,
    updatedUser: updated,
    message: `Giao dịch thành công! Đã trang bị thêm 1 "Khiên Khóa Thời Gian". Chuỗi ngày học của bạn đã được bảo vệ an toàn!`,
  };
}
