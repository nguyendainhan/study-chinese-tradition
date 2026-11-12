import React, { useState } from 'react';
import {
  UserAccountData,
  registerUserAccountAsync,
  loginUserAccountAsync,
  logoutUserAccount,
  loadAllAccounts,
  saveAllAccounts,
  setCurrentSessionUserId,
  loadCloudSyncConfig,
  saveCloudSyncConfig,
  syncAccountToSupabaseCloud,
  computeWeeklyDiligence,
  getTodayDateString,
} from '../utils/userAccountDb';
import {
  User,
  LogIn,
  UserPlus,
  LogOut,
  X,
  ShieldCheck,
  Cloud,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Trophy,
} from 'lucide-react';

interface AuthAccountModalProps {
  currentUser: UserAccountData | null;
  onAuthChange: (user: UserAccountData | null) => void;
  onClose: () => void;
}

export const AuthAccountModal: React.FC<AuthAccountModalProps> = ({
  currentUser,
  onAuthChange,
  onClose,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'profile' | 'cloud'>(
    currentUser ? 'profile' : 'login'
  );
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Cloud config state (for Vercel / Netlify cross-device sync)
  const initialCloud = loadCloudSyncConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCloud.supabaseUrl);
  const [supabaseKey, setSupabaseKey] = useState(initialCloud.supabaseAnonKey);
  const [cloudEnabled, setCloudEnabled] = useState(initialCloud.enabled);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const existingAccounts = Object.values(loadAllAccounts());

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSyncingCloud(true);
    const res = await loginUserAccountAsync(username, password);
    setIsSyncingCloud(false);

    if (res.ok && res.user) {
      onAuthChange(res.user);
      setTab('profile');
      setMessage({
        type: 'ok',
        text: `Đăng nhập thành công! Đã đồng bộ tài khoản "${res.user.displayName}" (${res.user.masteredIds.length} từ đã học) từ Supabase Cloud Database.`,
      });
      return;
    }

    setMessage({ type: 'err', text: res.error || 'Đăng nhập thất bại.' });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSyncingCloud(true);
    const res = await registerUserAccountAsync(username, email, displayName, password);
    setIsSyncingCloud(false);

    if (!res.ok || !res.user) {
      setMessage({ type: 'err', text: res.error || 'Không thể tạo tài khoản.' });
      return;
    }
    onAuthChange(res.user);
    setTab('profile');
    setMessage({
      type: 'ok',
      text: `Đã tạo tài khoản "${res.user.displayName}" trên Supabase Cloud Database! Bạn có thể đăng nhập tài khoản này trên bất kỳ điện thoại hay máy tính nào.`,
    });
  };

  const handleLogout = () => {
    logoutUserAccount();
    onAuthChange(null);
    setTab('login');
    setMessage({ type: 'ok', text: 'Đã đăng xuất tài khoản.' });
  };

  const handleExportAccountJson = () => {
    if (!currentUser) return;
    const blob = new Blob([JSON.stringify(currentUser, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formosa_account_${currentUser.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportAccountJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result)) as UserAccountData;
        if (!imported.userId || !imported.username) {
          setMessage({ type: 'err', text: 'File tài khoản không hợp lệ.' });
          return;
        }
        const accounts = loadAllAccounts();
        accounts[imported.userId] = imported;
        saveAllAccounts(accounts);
        setCurrentSessionUserId(imported.userId);
        onAuthChange(imported);
        setTab('profile');
        setMessage({
          type: 'ok',
          text: `Đã khôi phục tài khoản "${imported.displayName}" (${imported.masteredIds.length} từ đã học)!`,
        });
      } catch {
        setMessage({ type: 'err', text: 'Không thể đọc file JSON tài khoản.' });
      }
    };
    reader.readAsText(file);
  };

  const handleSaveCloudSettings = async () => {
    saveCloudSyncConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseKey.trim(),
      enabled: cloudEnabled,
    });
    if (currentUser && cloudEnabled && supabaseUrl && supabaseKey) {
      setIsSyncingCloud(true);
      const ok = await syncAccountToSupabaseCloud(currentUser);
      setIsSyncingCloud(false);
      setMessage({
        type: ok ? 'ok' : 'err',
        text: ok
          ? 'Đã lưu cấu hình Cloud và đồng bộ tài khoản lên Supabase thành công!'
          : 'Đã lưu cấu hình (hãy đảm bảo bảng formosa_user_accounts đã được tạo trên Supabase).',
      });
    } else {
      setMessage({ type: 'ok', text: 'Đã lưu cấu hình đồng bộ Cloud.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 md:p-7 space-y-5 my-8">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-amber-300 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Tài Khoản Học Tập & Lưu Tiến Độ Từ Đã Học
              </h3>
              <p className="text-xs text-slate-500">
                Ghi nhớ chính xác số từ đã học và các cấp bậc đã thi đạt của riêng bạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl">
          {currentUser && (
            <button
              onClick={() => {
                setTab('profile');
                setMessage(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
                tab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Hồ sơ của tôi ({currentUser.displayName})
            </button>
          )}
          <button
            onClick={() => {
              setTab('login');
              setMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
              tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => {
              setTab('register');
              setMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
              tab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Đăng ký mới
          </button>
          <button
            onClick={() => {
              setTab('cloud');
              setMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
              tab === 'cloud' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Đồng bộ Online
          </button>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              message.type === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {message.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* TAB: PROFILE */}
        {tab === 'profile' && currentUser && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-amber-300">
                    Đang đăng nhập
                  </span>
                  <h4 className="text-xl font-bold">{currentUser.displayName}</h4>
                  <p className="text-xs text-slate-400">@{currentUser.username}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-xl font-extrabold text-emerald-300">
                    {currentUser.masteredIds.length}
                  </div>
                  <div className="text-[11px] text-slate-300">Từ đã thuộc</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-xl font-extrabold text-amber-300">
                    {Object.keys(currentUser.certifiedLevels || {}).length}
                  </div>
                  <div className="text-[11px] text-slate-300">Cấp đã thi đạt</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-xl font-extrabold text-sky-300">
                    {(() => {
                      const diligence = computeWeeklyDiligence(
                        currentUser.rewardStats?.diligenceHistory || {},
                        getTodayDateString(),
                        currentUser.dailyPlan?.completedBatchIndices?.length || 0,
                        Math.max(1, Math.ceil((currentUser.dailyPlan?.targetWordsCount || 200) / (currentUser.dailyPlan?.batchSize || 25)))
                      );
                      return `${diligence.weeklyRate}%`;
                    })()}
                  </div>
                  <div className="text-[11px] text-slate-300">Chăm chỉ tuần</div>
                </div>
              </div>
            </div>

            {/* Certified Levels List */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
              <div className="text-xs font-bold uppercase text-slate-600 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-600" />
                Các cấp bậc đã vượt qua Bài Kiểm Tra Xác Nhận:
              </div>
              {Object.values(currentUser.certifiedLevels || {}).length === 0 ? (
                <p className="text-xs text-slate-500">
                  Chưa có cấp bậc nào được xác nhận. Khi học xong một cấp (ví dụ{' '}
                  <strong>準備級一級 Novice 1</strong>), hãy bấm nút{' '}
                  <strong>"Thi xác nhận đạt cấp này"</strong> để kiểm tra và mở khóa chứng nhận!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Object.values(currentUser.certifiedLevels).map((cert) => (
                    <div
                      key={cert.levelCode}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Đã đạt {cert.levelLabel}</span>
                      <span className="text-emerald-700">
                        ({cert.score}/{cert.totalQuestions} · {cert.accuracy}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export / Import Backup File for multi-device on Vercel/Netlify */}
            <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-4 space-y-2.5">
              <div className="text-xs font-bold text-amber-950">
                Sao lưu / Chuyển tài khoản sang Điện thoại hoặc Máy tính khác (Khi chạy trên Vercel / Netlify):
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExportAccountJson}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Tải file sao lưu tài khoản (.json)
                </button>
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-100 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" /> Khôi phục từ file (.json)
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportAccountJson}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB: LOGIN */}
        {tab === 'login' && (
          <div className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên đăng nhập hoặc Email
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ví dụ: minh_tocfl hoặc user@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={isSyncingCloud}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {isSyncingCloud ? 'Đang kiểm tra & đồng bộ...' : 'Đăng nhập vào tài khoản'}
              </button>
            </form>

            {existingAccounts.length > 0 && (
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="text-xs font-bold text-slate-500">
                  Tài khoản đã lưu trên thiết bị này (bấm để điền nhanh):
                </div>
                <div className="flex flex-wrap gap-2">
                  {existingAccounts.map((acc) => (
                    <button
                      key={acc.userId}
                      type="button"
                      onClick={() => setUsername(acc.username)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800"
                    >
                      {acc.displayName} (@{acc.username} {acc.email ? `· ${acc.email}` : ''} · {acc.masteredIds.length} từ)
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: REGISTER */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên đăng nhập (viết liền, không dấu)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: hocvien_b1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Địa chỉ Email (chống trùng lặp & bảo mật)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ví dụ: hocvien@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên hiển thị của bạn
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ví dụ: Minh Đài Loan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mật khẩu (tối thiểu 6 ký tự, mã hóa bảo mật PBKDF2)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Tạo tài khoản mới
            </button>
          </form>
        )}

        {/* TAB: CLOUD SYNC (FOR VERCEL / NETLIFY DEPLOYMENT) */}
        {tab === 'cloud' && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Cloud className="w-4 h-4 text-indigo-600" />
                Đồng bộ đám mây tự động khi chạy trên Vercel / Netlify
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mặc định tài khoản của bạn đã lưu ngay trên trình duyệt kèm chức năng xuất/nhập file JSON. Nếu muốn tự động đồng bộ giữa điện thoại và máy tính qua Supabase Cloud, bạn có thể nhập <code>Project URL</code> và <code>Anon Key</code> tại đây:
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cloudEnabled}
                  onChange={(e) => setCloudEnabled(e.target.checked)}
                  className="rounded"
                />
                Bật tự động đồng bộ tài khoản lên Supabase Cloud
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xxxx.supabase.co"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Anon Public Key
                </label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveCloudSettings}
                disabled={isSyncingCloud}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
              >
                {isSyncingCloud ? 'Đang đồng bộ...' : 'Lưu cấu hình & Đồng bộ ngay'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

