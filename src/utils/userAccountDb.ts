export interface LevelCertificationRecord {
  levelCode: string;
  levelLabel: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  passedAt: string;
}

export interface WordReviewStat {
  lastReviewed: number;
  correctCount: number;
  wrongCount: number;
}

export interface DailyProgressState {
  dateStr: string;
  targetWordsCount: number;
  batchSize: number;
  completedBatchIndices: number[];
  dailyBonusClaimed: boolean;
  wordsReviewedToday: number;
  tomorrowTargetWordsCount?: number;
}

export interface DailyDiligenceRecord {
  completedBatches: number;
  totalBatches: number;
  rate: number; // 0 - 100%
}

export interface RewardStats {
  totalPoints: number;
  streakDays: number;
  lastCompletedDate: string;
  totalSessionsCompleted: number;
  diligenceHistory?: Record<string, DailyDiligenceRecord>; // key: 'YYYY-MM-DD'
}

export interface UserAccountData {
  userId: string;
  username: string;
  email?: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  masteredIds: string[];
  masteredAt?: Record<string, string>; // wordId -> 'YYYY-MM-DD' date string when learned
  certifiedLevels: Record<string, LevelCertificationRecord>;
  reviewStats: Record<string, WordReviewStat>;
  rewardStats: RewardStats;
  dailyPlan: DailyProgressState;
}

export interface CloudSyncConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  enabled: boolean;
}

// Built-in Production Supabase Cloud Database Configuration
export const DEFAULT_SUPABASE_URL = 'https://bdrrvegnmykeqjzfihzl.supabase.co';
export const DEFAULT_SUPABASE_PUBLIC_KEY = 'sb_publishable_3I8H0E5dE11UZC2EEbDR8w_rsNN63Tc';

const ACCOUNTS_DB_KEY = 'formosa_accounts_db_v1';
const CURRENT_SESSION_USER_ID_KEY = 'formosa_current_user_id_v1';
const CLOUD_CONFIG_KEY = 'formosa_supabase_cloud_config_v1';

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function createDefaultDailyPlan(): DailyProgressState {
  return {
    dateStr: getTodayDateString(),
    targetWordsCount: 200,
    batchSize: 25,
    completedBatchIndices: [],
    dailyBonusClaimed: false,
    wordsReviewedToday: 0,
    tomorrowTargetWordsCount: 200,
  };
}

export function createDefaultRewardStats(): RewardStats {
  return {
    totalPoints: 0,
    streakDays: 0,
    lastCompletedDate: '',
    totalSessionsCompleted: 0,
    diligenceHistory: {},
  };
}

export interface DayDiligenceView {
  label: string; // 'T2', 'T3', etc.
  dateStr: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  rate: number; // 0 - 100
  hasStudied: boolean;
}

export function getCurrentWeekDates(): { label: string; dateStr: string }[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  // Distance from Monday (if Sunday (0), distance is 6; otherwise dayOfWeek - 1)
  const distToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(now);
  monday.setDate(now.getDate() - distToMonday);

  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const res: { label: string; dateStr: string }[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    res.push({
      label: labels[i],
      dateStr,
    });
  }
  return res;
}

export function computeWeeklyDiligence(
  history: Record<string, DailyDiligenceRecord> = {},
  todayDateStr: string,
  todayCompletedBatches: number,
  todayTotalBatches: number
): {
  weeklyRate: number;
  days: DayDiligenceView[];
  activeDaysCount: number;
} {
  const week = getCurrentWeekDates();
  const todayRate =
    todayTotalBatches > 0
      ? Math.min(100, Math.round((todayCompletedBatches / todayTotalBatches) * 100))
      : 0;

  let totalRatesSum = 0;
  let elapsedDaysCount = 0;
  let activeDaysCount = 0;

  const days: DayDiligenceView[] = week.map((w) => {
    const isToday = w.dateStr === todayDateStr;
    const isPast = w.dateStr < todayDateStr;
    const isFuture = w.dateStr > todayDateStr;

    let rate = 0;
    let hasStudied = false;

    if (isToday) {
      rate = todayRate;
      hasStudied = todayCompletedBatches > 0;
      totalRatesSum += rate;
      elapsedDaysCount++;
      if (hasStudied) activeDaysCount++;
    } else if (isPast) {
      elapsedDaysCount++;
      if (history[w.dateStr]) {
        rate = history[w.dateStr].rate;
        hasStudied = history[w.dateStr].completedBatches > 0;
        if (hasStudied) activeDaysCount++;
      }
      totalRatesSum += rate;
    }

    return {
      label: w.label,
      dateStr: w.dateStr,
      isToday,
      isPast,
      isFuture,
      rate,
      hasStudied,
    };
  });

  const weeklyRate =
    elapsedDaysCount > 0 ? Math.round(totalRatesSum / elapsedDaysCount) : 0;

  return {
    weeklyRate,
    days,
    activeDaysCount,
  };
}

export function simpleHash(raw: string): string {
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

/**
 * Băm mật khẩu chuẩn mã hóa bảo mật cao bằng PBKDF2 (SHA-256, 100.000 vòng lặp + 16 byte salt ngẫu nhiên)
 * Lưu trữ dạng: pbkdf2:100000:<salt_hex>:<hash_hex>
 */
export async function hashPasswordSecure(password: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');
    const hashHex = Array.from(new Uint8Array(derivedKey)).map((b) => b.toString(16).padStart(2, '0')).join('');
    return `pbkdf2:100000:${saltHex}:${hashHex}`;
  } catch {
    // Fallback nếu trình duyệt cũ không hỗ trợ Web Crypto
    return simpleHash(password);
  }
}

/**
 * Xác thực mật khẩu:
 * - So khớp bằng thuật toán PBKDF2
 * - Tự động tương thích ngược cho các tài khoản cũ đã lưu bằng simpleHash
 */
export async function verifyPasswordHash(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;

  // Nếu là hash chuẩn PBKDF2
  if (storedHash.startsWith('pbkdf2:')) {
    try {
      const parts = storedHash.split(':');
      if (parts.length !== 4) return false;
      const iterations = parseInt(parts[1], 10);
      const saltHex = parts[2];
      const originalHashHex = parts[3];

      const salt = new Uint8Array(saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      const derivedKey = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt,
          iterations,
          hash: 'SHA-256',
        },
        keyMaterial,
        256
      );
      const derivedHex = Array.from(new Uint8Array(derivedKey)).map((b) => b.toString(16).padStart(2, '0')).join('');
      return derivedHex === originalHashHex;
    } catch {
      return false;
    }
  }

  // Tương thích ngược: kiểm tra hash cũ
  return simpleHash(password) === storedHash;
}

// ============================================================================
// CHỐNG BRUTE-FORCE RATE LIMITER (Tối đa 5 lần thử sai / 15 phút)
// ============================================================================
const LOGIN_ATTEMPTS_KEY = 'formosa_login_attempts_v1';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 phút

export interface LoginRateLimitStatus {
  isLocked: boolean;
  remainingMinutes?: number;
  remainingSeconds?: number;
  attemptsCount: number;
}

export function checkLoginRateLimit(): LoginRateLimitStatus {
  try {
    const raw = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    if (!raw) return { isLocked: false, attemptsCount: 0 };
    const data = JSON.parse(raw);
    const now = Date.now();

    if (data.lockedUntil && data.lockedUntil > now) {
      const remainingMs = data.lockedUntil - now;
      const remainingMinutes = Math.floor(remainingMs / 60000);
      const remainingSeconds = Math.ceil((remainingMs % 60000) / 1000);
      return {
        isLocked: true,
        remainingMinutes,
        remainingSeconds,
        attemptsCount: data.attempts || MAX_FAILED_ATTEMPTS,
      };
    }

    // Nếu thời gian khóa đã hết thì reset
    if (data.lockedUntil && data.lockedUntil <= now) {
      resetLoginRateLimit();
      return { isLocked: false, attemptsCount: 0 };
    }

    return { isLocked: false, attemptsCount: data.attempts || 0 };
  } catch {
    return { isLocked: false, attemptsCount: 0 };
  }
}

export function recordFailedLoginAttempt(): LoginRateLimitStatus {
  try {
    const current = checkLoginRateLimit();
    const attempts = current.attemptsCount + 1;
    const now = Date.now();
    let lockedUntil = 0;

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      lockedUntil = now + LOCKOUT_DURATION_MS;
    }

    const record = {
      attempts,
      lockedUntil,
      lastAttempt: now,
    };
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(record));
    return checkLoginRateLimit();
  } catch {
    return { isLocked: false, attemptsCount: 1 };
  }
}

export function resetLoginRateLimit(): void {
  try {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
  } catch {
    // ignore
  }
}

export function loadAllAccounts(): Record<string, UserAccountData> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_DB_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveAllAccounts(accounts: Record<string, UserAccountData>): void {
  try {
    localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(accounts));
  } catch {
    // ignore quota errors
  }
}

export function getCurrentSessionUserId(): string | null {
  try {
    return localStorage.getItem(CURRENT_SESSION_USER_ID_KEY);
  } catch {
    return null;
  }
}

export function setCurrentSessionUserId(userId: string | null): void {
  try {
    if (userId) {
      localStorage.setItem(CURRENT_SESSION_USER_ID_KEY, userId);
    } else {
      localStorage.removeItem(CURRENT_SESSION_USER_ID_KEY);
    }
  } catch {
    // ignore
  }
}

export function getCurrentUserAccount(): UserAccountData | null {
  const userId = getCurrentSessionUserId();
  if (!userId) return null;
  const accounts = loadAllAccounts();
  return accounts[userId] || null;
}

export function logoutUserAccount(): void {
  setCurrentSessionUserId(null);
}

export function updateUserAccountData(
  userId: string,
  updater: (prev: UserAccountData) => UserAccountData
): UserAccountData | null {
  const accounts = loadAllAccounts();
  const current = accounts[userId];
  if (!current) return null;

  const updated: UserAccountData = {
    ...updater(current),
    updatedAt: new Date().toISOString(),
  };
  accounts[userId] = updated;
  saveAllAccounts(accounts);
  void syncAccountToSupabaseCloud(updated);
  return updated;
}

function normalizeSupabaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  // Convert dashboard URL https://supabase.com/dashboard/project/<id> to https://<id>.supabase.co automatically
  const match = trimmed.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (match && match[1]) {
    return `https://${match[1]}.supabase.co`;
  }
  return trimmed;
}

export function loadCloudSyncConfig(): CloudSyncConfig {
  const envUrl =
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;
  const envKey =
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_PUBLIC_KEY;

  try {
    const saved = localStorage.getItem(CLOUD_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as CloudSyncConfig;
      const url = normalizeSupabaseUrl(parsed.supabaseUrl || envUrl);
      const key = (parsed.supabaseAnonKey || envKey).trim();
      return {
        supabaseUrl: url,
        supabaseAnonKey: key,
        enabled: parsed.enabled ?? true,
      };
    }
  } catch {
    // ignore
  }

  return {
    supabaseUrl: normalizeSupabaseUrl(envUrl),
    supabaseAnonKey: envKey,
    enabled: true,
  };
}

export function saveCloudSyncConfig(config: CloudSyncConfig): void {
  try {
    localStorage.setItem(
      CLOUD_CONFIG_KEY,
      JSON.stringify({
        ...config,
        supabaseUrl: normalizeSupabaseUrl(config.supabaseUrl),
      })
    );
  } catch {
    // ignore
  }
}

export async function syncAccountToSupabaseCloud(account: UserAccountData): Promise<boolean> {
  const cfg = loadCloudSyncConfig();
  if (!cfg.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return false;

  const baseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
  try {
    const res = await fetch(`${baseUrl}/rest/v1/formosa_user_accounts?on_conflict=username`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cfg.supabaseAnonKey,
        Authorization: `Bearer ${cfg.supabaseAnonKey}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        username: account.username,
        email: account.email || null,
        display_name: account.displayName,
        password_hash: account.passwordHash,
        account_json: account,
        updated_at: account.updatedAt,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Merge two versions of the same user account so learned words & certifications are never lost across devices
function mergeUserAccountVersions(localAcc: UserAccountData, cloudAcc: UserAccountData): UserAccountData {
  const mergedMastered = Array.from(
    new Set([...(cloudAcc.masteredIds || []), ...(localAcc.masteredIds || [])])
  );
  const mergedMasteredAt: Record<string, string> = {
    ...(localAcc.masteredAt || {}),
    ...(cloudAcc.masteredAt || {}),
  };
  const mergedCerts: Record<string, LevelCertificationRecord> = {
    ...(localAcc.certifiedLevels || {}),
    ...(cloudAcc.certifiedLevels || {}),
  };
  const mergedReviewStats: Record<string, WordReviewStat> = {
    ...(localAcc.reviewStats || {}),
    ...(cloudAcc.reviewStats || {}),
  };
  const maxPoints = Math.max(
    localAcc.rewardStats?.totalPoints || 0,
    cloudAcc.rewardStats?.totalPoints || 0
  );
  const maxStreak = Math.max(
    localAcc.rewardStats?.streakDays || 0,
    cloudAcc.rewardStats?.streakDays || 0
  );

  const newer =
    new Date(cloudAcc.updatedAt || 0).getTime() >= new Date(localAcc.updatedAt || 0).getTime()
      ? cloudAcc
      : localAcc;

  return {
    ...newer,
    email: cloudAcc.email || localAcc.email,
    masteredIds: mergedMastered,
    masteredAt: mergedMasteredAt,
    certifiedLevels: mergedCerts,
    reviewStats: mergedReviewStats,
    rewardStats: {
      ...(newer.rewardStats || createDefaultRewardStats()),
      totalPoints: maxPoints,
      streakDays: maxStreak,
    },
    updatedAt: new Date().toISOString(),
  };
}

// Cloud-first Registration: checks Supabase first so usernames and emails are unique across all devices
export async function registerUserAccountAsync(
  username: string,
  emailOrDisplayName: string,
  displayNameOrPassword?: string,
  optionalPassword?: string
): Promise<{ ok: boolean; error?: string; user?: UserAccountData }> {
  let cleanEmail = '';
  let cleanDisplayName = '';
  let cleanPassword = '';

  if (optionalPassword !== undefined) {
    cleanEmail = (emailOrDisplayName || '').trim().toLowerCase();
    cleanDisplayName = (displayNameOrPassword || '').trim();
    cleanPassword = optionalPassword;
  } else {
    cleanDisplayName = (emailOrDisplayName || '').trim();
    cleanPassword = displayNameOrPassword || '';
  }

  const cleanUser = username.trim().toLowerCase();
  if (cleanUser.length < 3) {
    return { ok: false, error: 'Tên đăng nhập phải có ít nhất 3 ký tự.' };
  }

  if (cleanEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { ok: false, error: 'Địa chỉ email không đúng định dạng.' };
    }
  }

  if (cleanPassword.length < 4) {
    return { ok: false, error: 'Mật khẩu phải có ít nhất 4 ký tự.' };
  }

  const cfg = loadCloudSyncConfig();
  if (cfg.enabled && cfg.supabaseUrl && cfg.supabaseAnonKey) {
    const baseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
    try {
      const filter = cleanEmail
        ? `or=(username.eq.${encodeURIComponent(cleanUser)},email.eq.${encodeURIComponent(cleanEmail)})`
        : `username=eq.${encodeURIComponent(cleanUser)}`;

      const checkRes = await fetch(
        `${baseUrl}/rest/v1/formosa_user_accounts?${filter}&select=username,email`,
        {
          headers: {
            apikey: cfg.supabaseAnonKey,
            Authorization: `Bearer ${cfg.supabaseAnonKey}`,
          },
        }
      );
      if (checkRes.ok) {
        const existingRows = await checkRes.json();
        if (Array.isArray(existingRows) && existingRows.length > 0) {
          const match = existingRows[0];
          const isUserMatch = match.username?.toLowerCase() === cleanUser;
          return {
            ok: false,
            error: isUserMatch
              ? 'Tên đăng nhập này đã tồn tại trên hệ thống Cloud. Vui lòng chọn tên khác hoặc chuyển sang Đăng nhập!'
              : 'Địa chỉ email này đã được sử dụng. Vui lòng chọn email khác hoặc Đăng nhập!',
          };
        }
      }
    } catch {
      // continue if offline
    }
  }

  const accounts = loadAllAccounts();
  const existingLocal = Object.values(accounts).find(
    (a) => a.username.toLowerCase() === cleanUser || (cleanEmail && a.email?.toLowerCase() === cleanEmail)
  );
  if (existingLocal) {
    return {
      ok: false,
      error: 'Tài khoản này (tên đăng nhập hoặc email) đã tồn tại. Vui lòng chọn tên khác hoặc Đăng nhập.',
    };
  }

  const now = new Date().toISOString();
  const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const passwordHash = await hashPasswordSecure(cleanPassword);

  const newUser: UserAccountData = {
    userId,
    username: cleanUser,
    email: cleanEmail || undefined,
    displayName: cleanDisplayName || cleanUser,
    passwordHash,
    createdAt: now,
    updatedAt: now,
    masteredIds: [],
    masteredAt: {},
    certifiedLevels: {},
    reviewStats: {},
    rewardStats: createDefaultRewardStats(),
    dailyPlan: createDefaultDailyPlan(),
  };

  accounts[userId] = newUser;
  saveAllAccounts(accounts);
  setCurrentSessionUserId(userId);
  await syncAccountToSupabaseCloud(newUser);
  return { ok: true, user: newUser };
}

// Cloud-first Login: queries Supabase PostgreSQL first with Brute-force Rate Limiting & Neutral Error Message
export async function loginUserAccountAsync(
  loginIdentifier: string,
  password: string
): Promise<{ ok: boolean; error?: string; user?: UserAccountData }> {
  // 1. Chống Brute-force: Kiểm tra nếu thiết bị đã bị khóa do thử sai quá 5 lần
  const rateLimit = checkLoginRateLimit();
  if (rateLimit.isLocked) {
    return {
      ok: false,
      error: `Bạn đã thử đăng nhập sai ${MAX_FAILED_ATTEMPTS} lần liên tiếp. Vui lòng chờ ${rateLimit.remainingMinutes} phút ${rateLimit.remainingSeconds} giây trước khi thử lại để bảo vệ an toàn tài khoản!`,
    };
  }

  const cleanId = loginIdentifier.trim().toLowerCase();
  // Thông báo lỗi trung lập chuẩn an ninh bảo mật:
  // Tuyệt đối không phân biệt tài khoản không tồn tại hay sai mật khẩu để chống kỹ thuật dò quét (Username Enumeration)
  const NEUTRAL_ERROR = 'Tên đăng nhập / Email hoặc mật khẩu không chính xác.';

  const accounts = loadAllAccounts();
  const localMatch = Object.values(accounts).find(
    (a) => a.username.toLowerCase() === cleanId || a.email?.toLowerCase() === cleanId
  );

  const cfg = loadCloudSyncConfig();
  if (cfg.enabled && cfg.supabaseUrl && cfg.supabaseAnonKey) {
    const baseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
    try {
      // Cho phép đăng nhập bằng cả username HOẶC email trên Supabase
      const filter = `or=(username.eq.${encodeURIComponent(cleanId)},email.eq.${encodeURIComponent(cleanId)})`;
      const res = await fetch(
        `${baseUrl}/rest/v1/formosa_user_accounts?${filter}&select=*`,
        {
          headers: {
            apikey: cfg.supabaseAnonKey,
            Authorization: `Bearer ${cfg.supabaseAnonKey}`,
          },
        }
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const row = rows[0];
          const isValid = await verifyPasswordHash(password, row.password_hash);
          if (!isValid) {
            recordFailedLoginAttempt();
            return { ok: false, error: NEUTRAL_ERROR };
          }

          // Thành công: reset bộ đếm thất bại
          resetLoginRateLimit();

          let cloudAcc = row.account_json as UserAccountData;
          if (row.email && !cloudAcc.email) {
            cloudAcc.email = row.email;
          }

          // Tự động nâng cấp thuật toán băm lên PBKDF2 nếu tài khoản trước đó dùng hash cũ
          if (!row.password_hash.startsWith('pbkdf2:')) {
            const upgradedHash = await hashPasswordSecure(password);
            cloudAcc.passwordHash = upgradedHash;
          }

          const finalAcc = localMatch
            ? mergeUserAccountVersions(localMatch, cloudAcc)
            : cloudAcc;

          accounts[finalAcc.userId] = finalAcc;
          saveAllAccounts(accounts);
          setCurrentSessionUserId(finalAcc.userId);
          void syncAccountToSupabaseCloud(finalAcc);
          return { ok: true, user: finalAcc };
        }
      }
    } catch {
      // fallback to local if offline
    }
  }

  // Fallback to local if not on cloud yet or offline
  if (!localMatch) {
    recordFailedLoginAttempt();
    return { ok: false, error: NEUTRAL_ERROR };
  }

  const isLocalValid = await verifyPasswordHash(password, localMatch.passwordHash);
  if (!isLocalValid) {
    recordFailedLoginAttempt();
    return { ok: false, error: NEUTRAL_ERROR };
  }

  resetLoginRateLimit();
  setCurrentSessionUserId(localMatch.userId);
  void syncAccountToSupabaseCloud(localMatch);
  return { ok: true, user: localMatch };
}

// Refresh currently logged-in user's latest progress from Supabase Cloud on page load
export async function refreshCurrentAccountFromCloud(): Promise<UserAccountData | null> {
  const current = getCurrentUserAccount();
  if (!current) return null;

  const cfg = loadCloudSyncConfig();
  if (!cfg.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return current;

  const baseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
  try {
    const res = await fetch(
      `${baseUrl}/rest/v1/formosa_user_accounts?username=eq.${encodeURIComponent(
        current.username
      )}&select=*`,
      {
        headers: {
          apikey: cfg.supabaseAnonKey,
          Authorization: `Bearer ${cfg.supabaseAnonKey}`,
        },
      }
    );
    if (!res.ok) return current;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      // Account exists locally but wasn't pushed to cloud yet -> push it now!
      await syncAccountToSupabaseCloud(current);
      return current;
    }
    const cloudAcc = rows[0].account_json as UserAccountData;
    const merged = mergeUserAccountVersions(current, cloudAcc);
    const accounts = loadAllAccounts();
    accounts[merged.userId] = merged;
    saveAllAccounts(accounts);
    setCurrentSessionUserId(merged.userId);
    return merged;
  } catch {
    return current;
  }
}

// ============================================================================
// TABLE 2: formosa_custom_vocab (Kho Từ Mới Tự Nhập / Excel Trên Cloud)
// ============================================================================
export async function fetchCustomVocabFromCloud<T>(username = 'global'): Promise<T[]> {
  const cfg = loadCloudSyncConfig();
  if (!cfg.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return [];
  const baseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
  try {
    const res = await fetch(
      `${baseUrl}/rest/v1/formosa_custom_vocab?or=(username.eq.${encodeURIComponent(
        username
      )},username.eq.global)&select=vocab_json&order=created_at.desc`,
      {
        headers: {
          apikey: cfg.supabaseAnonKey,
          Authorization: `Bearer ${cfg.supabaseAnonKey}`,
        },
      }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => r.vocab_json as T);
  } catch {
    return [];
  }
}

export async function saveCustomVocabToCloud(
  username = 'global',
  items: Array<{
    id: string;
    traditional: string;
    simplified?: string;
    pinyin?: string;
    zhuyin?: string;
    hanViet?: string;
    vietnamese?: string;
    english?: string;
    level?: string;
  }>
): Promise<boolean> {
  const cfg = loadCloudSyncConfig();
  if (!cfg.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey || items.length === 0) {
    return false;
  }
  const baseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
  const payload = items.map((item) => ({
    id: `${username}_${item.traditional}`,
    username,
    traditional: item.traditional,
    simplified: item.simplified || item.traditional,
    pinyin: item.pinyin || '',
    zhuyin: item.zhuyin || '',
    han_viet: item.hanViet || '',
    vietnamese: item.vietnamese || '',
    english: item.english || '',
    level: item.level || 'TOCFL',
    vocab_json: item,
  }));

  try {
    const res = await fetch(`${baseUrl}/rest/v1/formosa_custom_vocab?on_conflict=id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cfg.supabaseAnonKey,
        Authorization: `Bearer ${cfg.supabaseAnonKey}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ============================================================================
// TABLE 3: formosa_vi_translations (Kho Nghĩa Tiếng Việt Đã Dịch Của 8000 Từ)
// ============================================================================
export async function fetchViTranslationsFromCloud(): Promise<Record<string, string>> {
  const cfg = loadCloudSyncConfig();
  if (!cfg.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return {};
  const baseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
  try {
    const res = await fetch(
      `${baseUrl}/rest/v1/formosa_vi_translations?select=traditional,vietnamese&limit=10000`,
      {
        headers: {
          apikey: cfg.supabaseAnonKey,
          Authorization: `Bearer ${cfg.supabaseAnonKey}`,
        },
      }
    );
    if (!res.ok) return {};
    const rows = await res.json();
    const map: Record<string, string> = {};
    if (Array.isArray(rows)) {
      for (const r of rows) {
        if (r.traditional && r.vietnamese) {
          map[r.traditional] = r.vietnamese;
        }
      }
    }
    return map;
  } catch {
    return {};
  }
}

export async function saveViTranslationsToCloud(
  entries: Array<{ traditional: string; vietnamese: string }>
): Promise<boolean> {
  const cfg = loadCloudSyncConfig();
  if (!cfg.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey || entries.length === 0) {
    return false;
  }
  const baseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
  const payload = entries.map((e) => ({
    traditional: e.traditional,
    vietnamese: e.vietnamese,
    updated_at: new Date().toISOString(),
  }));

  try {
    const res = await fetch(
      `${baseUrl}/rest/v1/formosa_vi_translations?on_conflict=traditional`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: cfg.supabaseAnonKey,
          Authorization: `Bearer ${cfg.supabaseAnonKey}`,
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(payload),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ============================================================================
// TABLE 4: formosa_exam_logs (Lịch Sử Thi Thử TOCFL & Thi Xác Nhận Cấp Bậc)
// ============================================================================
export interface CloudExamLog {
  id: string;
  username: string;
  exam_type: 'mock-tocfl' | 'level-cert';
  band_or_level: string;
  score: number;
  total_questions: number;
  accuracy: number;
  passed: boolean;
  created_at: string;
}

export async function fetchExamLogsFromCloud(username = 'guest'): Promise<CloudExamLog[]> {
  const cfg = loadCloudSyncConfig();
  if (!cfg.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return [];
  const baseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
  try {
    const res = await fetch(
      `${baseUrl}/rest/v1/formosa_exam_logs?username=eq.${encodeURIComponent(
        username
      )}&select=*&order=created_at.desc&limit=50`,
      {
        headers: {
          apikey: cfg.supabaseAnonKey,
          Authorization: `Bearer ${cfg.supabaseAnonKey}`,
        },
      }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    return Array.isArray(rows) ? (rows as CloudExamLog[]) : [];
  } catch {
    return [];
  }
}

export async function saveExamLogToCloud(log: Omit<CloudExamLog, 'id' | 'created_at'>): Promise<boolean> {
  const cfg = loadCloudSyncConfig();
  if (!cfg.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return false;
  const baseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
  const fullLog: CloudExamLog = {
    ...log,
    id: `exam_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${baseUrl}/rest/v1/formosa_exam_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cfg.supabaseAnonKey,
        Authorization: `Bearer ${cfg.supabaseAnonKey}`,
      },
      body: JSON.stringify(fullLog),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ============================================================================
// TABLE 5: formosa_saved_texts (Sổ Tay Đoạn Văn Đọc Hiểu & Ghi Chú Cá Nhân)
// ============================================================================
export interface CloudSavedText {
  id: string;
  username: string;
  title: string;
  content: string;
  note: string;
  created_at: string;
}

export async function fetchSavedTextsFromCloud(username = 'guest'): Promise<CloudSavedText[]> {
  const cfg = loadCloudSyncConfig();
  if (!cfg.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return [];
  const baseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
  try {
    const res = await fetch(
      `${baseUrl}/rest/v1/formosa_saved_texts?username=eq.${encodeURIComponent(
        username
      )}&select=*&order=created_at.desc`,
      {
        headers: {
          apikey: cfg.supabaseAnonKey,
          Authorization: `Bearer ${cfg.supabaseAnonKey}`,
        },
      }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    return Array.isArray(rows) ? (rows as CloudSavedText[]) : [];
  } catch {
    return [];
  }
}

export async function saveTextNoteToCloud(
  username: string,
  title: string,
  content: string,
  note = ''
): Promise<CloudSavedText | null> {
  const cfg = loadCloudSyncConfig();
  const item: CloudSavedText = {
    id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    username: username || 'guest',
    title: title.trim() || 'Đoạn văn Phồn thể',
    content: content.trim(),
    note: note.trim(),
    created_at: new Date().toISOString(),
  };

  if (!cfg.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return item;
  const baseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
  try {
    await fetch(`${baseUrl}/rest/v1/formosa_saved_texts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cfg.supabaseAnonKey,
        Authorization: `Bearer ${cfg.supabaseAnonKey}`,
      },
      body: JSON.stringify(item),
    });
    return item;
  } catch {
    return item;
  }
}

