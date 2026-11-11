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

// Cloud-first Registration: checks Supabase first so usernames are unique across all devices
export async function registerUserAccountAsync(
  username: string,
  displayName: string,
  password: string
): Promise<{ ok: boolean; error?: string; user?: UserAccountData }> {
  const cleanUser = username.trim().toLowerCase();
  if (cleanUser.length < 3) {
    return { ok: false, error: 'Tên đăng nhập phải có ít nhất 3 ký tự.' };
  }
  if (password.length < 4) {
    return { ok: false, error: 'Mật khẩu phải có ít nhất 4 ký tự.' };
  }

  const cfg = loadCloudSyncConfig();
  if (cfg.enabled && cfg.supabaseUrl && cfg.supabaseAnonKey) {
    const baseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
    try {
      const checkRes = await fetch(
        `${baseUrl}/rest/v1/formosa_user_accounts?username=eq.${encodeURIComponent(
          cleanUser
        )}&select=username`,
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
          return {
            ok: false,
            error: 'Tên đăng nhập này đã tồn tại trên hệ thống Cloud. Vui lòng chọn tên khác hoặc chuyển sang Đăng nhập!',
          };
        }
      }
    } catch {
      // continue if offline
    }
  }

  const accounts = loadAllAccounts();
  const existingLocal = Object.values(accounts).find(
    (a) => a.username.toLowerCase() === cleanUser
  );
  if (existingLocal) {
    return {
      ok: false,
      error: 'Tên đăng nhập này đã tồn tại. Vui lòng chọn tên khác hoặc Đăng nhập.',
    };
  }

  const now = new Date().toISOString();
  const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const newUser: UserAccountData = {
    userId,
    username: cleanUser,
    displayName: displayName.trim() || cleanUser,
    passwordHash: simpleHash(password),
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

// Cloud-first Login: queries Supabase PostgreSQL first so you can log in from any phone or computer
export async function loginUserAccountAsync(
  username: string,
  password: string
): Promise<{ ok: boolean; error?: string; user?: UserAccountData }> {
  const cleanUser = username.trim().toLowerCase();
  const passHash = simpleHash(password);
  const accounts = loadAllAccounts();
  const localMatch = Object.values(accounts).find((a) => a.username.toLowerCase() === cleanUser);

  const cfg = loadCloudSyncConfig();
  if (cfg.enabled && cfg.supabaseUrl && cfg.supabaseAnonKey) {
    const baseUrl = normalizeSupabaseUrl(cfg.supabaseUrl);
    try {
      const res = await fetch(
        `${baseUrl}/rest/v1/formosa_user_accounts?username=eq.${encodeURIComponent(
          cleanUser
        )}&select=*`,
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
          if (row.password_hash !== passHash) {
            return { ok: false, error: 'Mật khẩu không chính xác.' };
          }
          const cloudAcc = row.account_json as UserAccountData;
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

  // Fallback to local if not on cloud yet
  if (!localMatch) {
    return {
      ok: false,
      error: 'Không tìm thấy tài khoản này trên Cloud Database. Bạn hãy kiểm tra lại tên đăng nhập hoặc bấm Đăng ký mới!',
    };
  }
  if (localMatch.passwordHash !== passHash) {
    return { ok: false, error: 'Mật khẩu không chính xác.' };
  }

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

