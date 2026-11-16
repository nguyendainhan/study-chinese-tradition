import React, { useState } from 'react';
import {
  CULTIVATION_REALMS,
  getUserCurrentRealm,
  getUserTotalExp,
  getUserStarCoins,
  getUserStreakFreezes,
  buyShopItem,
} from '../utils/cultivationRealm';
import { UserAccountData } from '../utils/userAccountDb';
import {
  X,
  Zap,
  Coins,
  Shield,
  Sparkles,
  Lock,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  Bot,
  Flame,
  Award,
} from 'lucide-react';

interface CultivationRealmModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccountData | null;
  guestMasteredCount: number;
  onUserUpdate: (updated: UserAccountData) => void;
  todayCompletedBatches?: number;
  todayTargetBatches?: number;
}

export function CultivationRealmModal({
  isOpen,
  onClose,
  currentUser,
  guestMasteredCount,
  onUserUpdate,
  todayCompletedBatches = 0,
  todayTargetBatches = 8,
}: CultivationRealmModalProps) {
  const [activeTab, setActiveTab] = useState<'realm' | 'shop' | 'all-ranks'>('realm');
  const [shopMsg, setShopMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  if (!isOpen) return null;

  const realmInfo = getUserCurrentRealm(currentUser, guestMasteredCount);
  const totalExp = getUserTotalExp(currentUser, guestMasteredCount);
  const starCoins = getUserStarCoins(currentUser);
  const streakFreezes = getUserStreakFreezes(currentUser);

  const handleBuyFreeze = () => {
    setShopMsg(null);
    const result = buyShopItem(currentUser, 'freeze-streak', 30);
    if (result.ok && result.updatedUser) {
      onUserUpdate(result.updatedUser);
      setShopMsg({ type: 'ok', text: result.message });
    } else {
      setShopMsg({ type: 'err', text: result.message });
    }
  };

  // Quản gia AI thoại thông minh theo tiến độ thực tế
  const getAiButlerMessage = () => {
    if (todayCompletedBatches >= todayTargetBatches) {
      return `Ký chủ vất vả rồi! Hôm nay người đã hoàn thành ${todayCompletedBatches}/${todayTargetBatches} card bài ôn, Nguyên Lực trong kinh mạch đang sôi trào rất ổn định. Khuyên người nên nghỉ ngơi tĩnh dưỡng hoặc tiến vào phòng Thí Luyện!`;
    }
    if (todayCompletedBatches > 0) {
      return `Nguyên Lực hôm nay đã hấp thu được ${todayCompletedBatches}/${todayTargetBatches} phần. Ký chủ hãy tập trung thần niệm, hoàn thành nốt các card bài ôn còn lại trước nửa đêm để tránh đứt đoạn chuỗi Streak!`;
    }
    return `Cảnh báo hệ thống: Ký chủ hôm nay chưa tiến hành tu luyện từ vựng! Hãy mở ngay 1 Card bài 25 từ để hấp thu 50 điểm Nguyên Lực và 10 Tinh Tệ từ Công hội!`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Hologram Header Bar */}
        <div
          className={`bg-gradient-to-r ${realmInfo.currentRealm.theme.headerGradient} p-5 sm:p-6 text-white relative overflow-hidden border-b border-white/10`}
        >
          {/* Background Grid Pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)',
              backgroundSize: '100px 100px',
            }}
          />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl shadow-inner shrink-0">
              {realmInfo.currentRealm.badge}
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 font-bold">
                  HỆ THỐNG VŨ GIẢ & CẢNH GIỚI
                </span>
                <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  Cấp {realmInfo.currentRealm.rankNumber + 1}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-wide truncate">
                {realmInfo.currentRealm.title}
              </h2>
              <p className="text-xs text-slate-200 font-medium mt-0.5">
                {realmInfo.currentRealm.subTitle}
              </p>
            </div>
          </div>

          {/* Quick HUD Counters */}
          <div className="grid grid-cols-3 gap-2.5 mt-5">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-2.5 border border-cyan-500/20 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                <Zap className="w-4 h-4 fill-cyan-400 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-cyan-200 font-medium">Nguyên Lực (EXP)</div>
                <div className="text-sm font-extrabold text-white truncate">
                  {totalExp.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-2.5 border border-amber-500/20 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-amber-200 font-medium">Tinh Tệ (Credits)</div>
                <div className="text-sm font-extrabold text-white truncate">
                  {starCoins.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-2.5 border border-indigo-500/20 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0">
                <Shield className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-indigo-200 font-medium">Khiên Khóa Thời Gian</div>
                <div className="text-sm font-extrabold text-white truncate">{streakFreezes}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('realm')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'realm'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Cảnh Giới Hiện Tại
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'shop'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Trạm Không Gian (Cửa Hàng)
          </button>
          <button
            onClick={() => setActiveTab('all-ranks')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'all-ranks'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Đồ Bản Cảnh Giới
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-200 flex-1">
          {/* TAB 1: CẢNH GIỚI HIỆN TẠI & TRỢ LÝ AI */}
          {activeTab === 'realm' && (
            <div className="space-y-5">
              {/* AI Butler Dialogue Card */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-cyan-500/30 p-4 relative overflow-hidden shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                    <Bot className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-cyan-300 tracking-wide">
                        QUẢN GIA THÔNG MINH (AI SYSTEM)
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                        Trực tuyến 24/7
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{getAiButlerMessage()}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress to Next Realm */}
              <div className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      Tiến Độ Đột Phá Cảnh Giới
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {realmInfo.nextRealm ? (
                        <>
                          Mục tiêu tiếp theo:{' '}
                          <span className="text-cyan-300 font-bold">
                            {realmInfo.nextRealm.title}
                          </span>
                        </>
                      ) : (
                        'Đã đạt cảnh giới Tối thượng vô song!'
                      )}
                    </p>
                  </div>
                  <span className="text-lg font-black text-cyan-300">
                    {realmInfo.progressPercent}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-500 shadow-sm shadow-cyan-400/50"
                    style={{ width: `${realmInfo.progressPercent}%` }}
                  />
                </div>

                {realmInfo.nextRealm && (
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Nguyên Lực cần thêm:</span>
                      <span className="font-extrabold text-cyan-300 text-sm">
                        +{realmInfo.expNeededForNext.toLocaleString()} EXP
                      </span>
                    </div>
                    <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Từ vựng cần nạp thêm:</span>
                      <span className="font-extrabold text-amber-300 text-sm">
                        +{realmInfo.wordsNeededForNext.toLocaleString()} từ
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Perks of Current Realm */}
              <div className="rounded-2xl bg-slate-800/40 border border-slate-700/60 p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Đặc quyền Cảnh giới hiện tại:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {realmInfo.currentRealm.perks.map((perk, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-slate-900/60 rounded-xl px-3 py-2 border border-slate-800 text-slate-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CỬA HÀNG TRẠM KHÔNG GIAN (ITEM SHOP) */}
          {activeTab === 'shop' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 text-xs text-amber-200">
                <span className="flex items-center gap-2 font-semibold">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Tinh Tệ hiện có của bạn:
                </span>
                <span className="text-base font-extrabold text-amber-300">
                  {starCoins.toLocaleString()} Tinh Tệ
                </span>
              </div>

              {shopMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold ${
                    shopMsg.type === 'ok'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {shopMsg.text}
                </div>
              )}

              {/* Item Card 1: Khiên Khóa Thời Gian */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 text-2xl">
                    🛡️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">Khiên Khóa Thời Gian (Freeze Streak)</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                        Đang có: {streakFreezes}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-md">
                      Bảo vệ toàn vẹn chuỗi ngày học Streak nếu bạn bận rộn trong phòng thí nghiệm, công việc hoặc quên đăng nhập trong ngày.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleBuyFreeze}
                  disabled={!currentUser || starCoins < 30}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 flex items-center gap-1.5 shadow-sm ${
                    !currentUser || starCoins < 30
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  Mua (30 Tinh Tệ)
                </button>
              </div>

              {/* Item Card 2: Thần Hành Đan (Sắp ra mắt) */}
              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-2xl">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-300 text-sm">Thần Hành Đan (Double EXP Potion)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Nhân đôi lượng Nguyên Lực nhận được trong 30 phút ôn bài.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 px-3 py-1 bg-slate-900 rounded-lg">
                  Sắp mở khóa
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: ĐỒ BẢN CẢNH GIỚI (ALL RANKS ROADMAP) */}
          {activeTab === 'all-ranks' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                Lộ trình 6 đại cảnh giới từ Học Đồ Dự Bị đến Hằng Tinh Cấp. Vượt qua bài kiểm tra xác nhận để đột phá cảnh giới mới!
              </p>
              {CULTIVATION_REALMS.map((realm) => {
                const isCurrent = realm.id === realmInfo.currentRealm.id;
                const isUnlocked = realm.rankNumber <= realmInfo.currentRealm.rankNumber;

                return (
                  <div
                    key={realm.id}
                    className={`rounded-2xl p-4 border transition ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-400/80 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/40'
                        : isUnlocked
                        ? 'bg-slate-800/60 border-emerald-500/30'
                        : 'bg-slate-900/50 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{realm.badge}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{realm.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                              {realm.tocflBand}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black">
                                ĐANG Ở CẢNH GIỚI NÀY
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">{realm.description}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Đã mở
                          </span>
                        ) : (
                          <div className="text-xs text-slate-400">
                            <span className="flex items-center gap-1 justify-end font-semibold text-slate-400">
                              <Lock className="w-3.5 h-3.5" /> Khóa
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Yêu cầu: {realm.minMasteredWords} từ / {realm.minExp} EXP
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Hệ thống Thợ Săn TOCFL • Tự động đồng bộ Supabase Cloud
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
