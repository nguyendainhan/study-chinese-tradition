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

export interface RewardStats {
  totalPoints: number;
  streakDays: number;
  lastCompletedDate: string;
  totalSessionsCompleted: number;
}

export interface UserAccountData {
  userId: string;
  username: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  masteredIds: string[];
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
  };
}

function simpleHash(raw: string): string {
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

export function registerUserAccount(
  username: string,
  displayName: string,
  password: string
): { ok: boolean; error?: string; user?: UserAccountData } {
  const cleanUser = username.trim().toLowerCase();
  if (cleanUser.length < 3) {
    return { ok: false, error: 'Tên đăng nhập phải có ít nhất 3 ký tự.' };
  }
  if (password.length < 4) {
    return { ok: false, error: 'Mật khẩu phải có ít nhất 4 ký tự.' };
  }

  const accounts = loadAllAccounts();
  const existing = Object.values(accounts).find((a) => a.username.toLowerCase() === cleanUser);
  if (existing) {
    return { ok: false, error: 'Tên đăng nhập này đã tồn tại. Vui lòng chọn tên khác hoặc Đăng nhập.' };
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
    certifiedLevels: {},
    reviewStats: {},
    rewardStats: createDefaultRewardStats(),
    dailyPlan: createDefaultDailyPlan(),
  };

  accounts[userId] = newUser;
  saveAllAccounts(accounts);
  setCurrentSessionUserId(userId);
  void syncAccountToSupabaseCloud(newUser);
  return { ok: true, user: newUser };
}

export function loginUserAccount(
  username: string,
  password: string
): { ok: boolean; error?: string; user?: UserAccountData } {
  const cleanUser = username.trim().toLowerCase();
  const accounts = loadAllAccounts();
  const found = Object.values(accounts).find((a) => a.username.toLowerCase() === cleanUser);
  if (!found) {
    return { ok: false, error: 'Không tìm thấy tài khoản này. Bạn hãy kiểm tra lại hoặc bấm Đăng ký mới.' };
  }
  if (found.passwordHash !== simpleHash(password)) {
    return { ok: false, error: 'Mật khẩu không chính xác.' };
  }

  setCurrentSessionUserId(found.userId);
  return { ok: true, user: found };
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

// Cloud Sync Configuration (Supabase REST API) so user can deploy online & sync across devices
export function loadCloudSyncConfig(): CloudSyncConfig {
  const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || '';

  try {
    const saved = localStorage.getItem(CLOUD_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as CloudSyncConfig;
      return {
        supabaseUrl: parsed.supabaseUrl || envUrl,
        supabaseAnonKey: parsed.supabaseAnonKey || envKey,
        enabled: parsed.enabled ?? Boolean(parsed.supabaseUrl || envUrl),
      };
    }
  } catch {
    // ignore
  }

  return {
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey,
    enabled: Boolean(envUrl && envKey),
  };
}

export function saveCloudSyncConfig(config: CloudSyncConfig): void {
  try {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export async function syncAccountToSupabaseCloud(account: UserAccountData): Promise<boolean> {
  const cfg = loadCloudSyncConfig();
  if (!cfg.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return false;

  const baseUrl = cfg.supabaseUrl.replace(/\/+$/, '');
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

export async function pullAccountFromSupabaseCloud(
  username: string,
  password: string
): Promise<{ ok: boolean; user?: UserAccountData; error?: string }> {
  const cfg = loadCloudSyncConfig();
  if (!cfg.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    return { ok: false, error: 'Chưa bật cấu hình Supabase Cloud.' };
  }

  const cleanUser = username.trim().toLowerCase();
  const baseUrl = cfg.supabaseUrl.replace(/\/+$/, '');
  try {
    const res = await fetch(
      `${baseUrl}/rest/v1/formosa_user_accounts?username=eq.${encodeURIComponent(cleanUser)}&select=*`,
      {
        headers: {
          apikey: cfg.supabaseAnonKey,
          Authorization: `Bearer ${cfg.supabaseAnonKey}`,
        },
      }
    );
    if (!res.ok) {
      return { ok: false, error: 'Không thể kết nối tới bảng formosa_user_accounts trên Supabase.' };
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return { ok: false, error: 'Không tìm thấy tài khoản trên Cloud.' };
    }
    const row = rows[0];
    if (row.password_hash !== simpleHash(password)) {
      return { ok: false, error: 'Mật khẩu tài khoản Cloud không đúng.' };
    }
    const cloudAccount: UserAccountData = row.account_json;
    const accounts = loadAllAccounts();
    accounts[cloudAccount.userId] = cloudAccount;
    saveAllAccounts(accounts);
    setCurrentSessionUserId(cloudAccount.userId);
    return { ok: true, user: cloudAccount };
  } catch {
    return { ok: false, error: 'Lỗi mạng khi đồng bộ từ Supabase Cloud.' };
  }
}

