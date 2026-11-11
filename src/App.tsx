import React, { useState, useEffect } from 'react';
import { VOCAB_LIST, TrackId, VocabItem } from './data/courseData';
import { Tocfl8000StudySection } from './components/Tocfl8000StudySection';
import { TaiwanLifeSection } from './components/TaiwanLifeSection';
import { IntermediateB1Section } from './components/IntermediateB1Section';
import { QuizSection } from './components/QuizSection';
import { TocflImporterSection } from './components/TocflImporterSection';
import { ZhuyinChartSection } from './components/ZhuyinChartSection';
import { SpeakingPracticeSection } from './components/SpeakingPracticeSection';
import { TocflMockExamSection } from './components/TocflMockExamSection';
import { AuthAccountModal } from './components/AuthAccountModal';
import {
  UserAccountData,
  LevelCertificationRecord,
  getCurrentUserAccount,
  updateUserAccountData,
  logoutUserAccount,
  refreshCurrentAccountFromCloud,
  fetchCustomVocabFromCloud,
  saveCustomVocabToCloud,
  saveExamLogToCloud,
} from './utils/userAccountDb';
import {
  GraduationCap,
  MessageCircleHeart,
  CheckCircle2,
  Award,
  Languages,
  Wand2,
  Keyboard,
  Mic,
  FileCheck2,
  Layers,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

type ActiveTab =
  | 'tocfl-8000-study'
  | 'tocfl-import'
  | 'zhuyin-chart'
  | 'b1-reading'
  | 'taiwan-life'
  | 'speaking'
  | 'mock-exam'
  | 'quiz';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tocfl-8000-study');
  const [selectedTrack, setSelectedTrack] = useState<TrackId>('tocfl-a');
  const [showZhuyin, setShowZhuyin] = useState<boolean>(true);
  const [showSimplified, setShowSimplified] = useState<boolean>(true);

  // User account state (Login / Logout / Per-Account Database)
  const [currentUser, setCurrentUser] = useState<UserAccountData | null>(() =>
    getCurrentUserAccount()
  );
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Sync latest account progress & custom vocabulary from Supabase Cloud Database
  useEffect(() => {
    refreshCurrentAccountFromCloud().then((synced) => {
      if (synced) {
        setCurrentUser(synced);
      }
    });
  }, []);

  // Custom imported vocabulary persisted in localStorage & Supabase formosa_custom_vocab
  const [customVocab, setCustomVocab] = useState<VocabItem[]>(() => {
    try {
      const saved = localStorage.getItem('formosa_custom_vocab_8000');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetchCustomVocabFromCloud<VocabItem>(currentUser?.username || 'global').then(
      (cloudWords) => {
        if (cloudWords && cloudWords.length > 0) {
          setCustomVocab((prev) => {
            const map = new Map<string, VocabItem>();
            for (const item of prev) map.set(item.traditional, item);
            for (const item of cloudWords) {
              if (item && item.traditional) map.set(item.traditional, item);
            }
            return Array.from(map.values());
          });
        }
      }
    );
  }, [currentUser?.username]);

  // Guest fallback masteredIds & certifiedLevels when not logged in
  const [guestMasteredIds, setGuestMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('formosa_mastered_vocab');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [guestCertifiedLevels, setGuestCertifiedLevels] = useState<
    Record<string, LevelCertificationRecord>
  >(() => {
    try {
      const saved = localStorage.getItem('formosa_guest_certified_levels');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('formosa_custom_vocab_8000', JSON.stringify(customVocab));
    } catch {
      // ignore storage errors
    }
  }, [customVocab]);

  useEffect(() => {
    try {
      localStorage.setItem('formosa_mastered_vocab', JSON.stringify(guestMasteredIds));
    } catch {
      // ignore storage errors
    }
  }, [guestMasteredIds]);

  useEffect(() => {
    try {
      localStorage.setItem('formosa_guest_certified_levels', JSON.stringify(guestCertifiedLevels));
    } catch {
      // ignore storage errors
    }
  }, [guestCertifiedLevels]);

  // Active user's masteredIds & certifiedLevels (strictly isolated per logged-in user)
  const masteredIds = currentUser ? currentUser.masteredIds : guestMasteredIds;
  const certifiedLevels = currentUser ? currentUser.certifiedLevels || {} : guestCertifiedLevels;

  const updateMasteredIds = (nextIds: string[]) => {
    if (currentUser) {
      const updated = updateUserAccountData(currentUser.userId, (prev) => ({
        ...prev,
        masteredIds: nextIds,
      }));
      if (updated) setCurrentUser(updated);
    } else {
      setGuestMasteredIds(nextIds);
    }
  };

  const handleCertifyLevel = (cert: LevelCertificationRecord, allLevelWordIds: string[]) => {
    const mergedIds = Array.from(new Set([...masteredIds, ...allLevelWordIds]));
    void saveExamLogToCloud({
      username: currentUser?.username || 'guest',
      exam_type: 'level-cert',
      band_or_level: cert.levelLabel,
      score: cert.score,
      total_questions: cert.totalQuestions,
      accuracy: cert.accuracy,
      passed: true,
    });

    if (currentUser) {
      const updated = updateUserAccountData(currentUser.userId, (prev) => ({
        ...prev,
        masteredIds: mergedIds,
        certifiedLevels: {
          ...(prev.certifiedLevels || {}),
          [cert.levelCode]: cert,
        },
        rewardStats: {
          ...prev.rewardStats,
          totalPoints: (prev.rewardStats?.totalPoints || 0) + 200,
        },
      }));
      if (updated) setCurrentUser(updated);
    } else {
      setGuestMasteredIds(mergedIds);
      setGuestCertifiedLevels((prev) => ({
        ...prev,
        [cert.levelCode]: cert,
      }));
    }
  };

  const allVocab = React.useMemo(() => {
    const existingTrad = new Set(VOCAB_LIST.map((v) => v.traditional));
    const dedupedCustom = customVocab.filter((v) => !existingTrad.has(v.traditional));
    return [...VOCAB_LIST, ...dedupedCustom];
  }, [customVocab]);

  const toggleMastered = (id: string) => {
    const next = masteredIds.includes(id)
      ? masteredIds.filter((item) => item !== id)
      : [...masteredIds, id];
    updateMasteredIds(next);
  };

  const handleImportVocab = (newItems: VocabItem[]) => {
    void saveCustomVocabToCloud(currentUser?.username || 'global', newItems);
    setCustomVocab((prev) => {
      const map = new Map<string, VocabItem>();
      for (const item of prev) {
        map.set(item.traditional, item);
      }
      for (const item of newItems) {
        map.set(item.traditional, item);
      }
      return Array.from(map.values());
    });
  };

  const handleClearCustomVocab = () => {
    setCustomVocab([]);
  };

  const handleSelectWordToStudy = (word: VocabItem) => {
    setSelectedTrack(word.track);
    setActiveTab('tocfl-8000-study');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-sm font-tc font-bold text-xl">
              臺
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-900 tracking-tight">
                Formosa Hoa Ngữ
              </h1>
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                TOCFL 8000
              </span>
            </div>
          </div>

          {/* Display Toggles, Progress & User Account Login/Logout */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowZhuyin((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                showZhuyin
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              ㄅㄆㄇㄈ: {showZhuyin ? 'Bật' : 'Tắt'}
            </button>

            <button
              onClick={() => setShowSimplified((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                showSimplified
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              Giản thể: {showSimplified ? 'Bật' : 'Tắt'}
            </button>

            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {masteredIds.length} từ đã học
            </div>

            {Object.keys(certifiedLevels).length > 0 && (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-300 text-amber-900 px-2.5 py-1.5 rounded-xl text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                {Object.keys(certifiedLevels).length} cấp
              </div>
            )}

            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-amber-300 hover:bg-slate-800 text-xs font-bold transition shadow-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{currentUser.displayName}</span>
                </button>
                <button
                  onClick={() => {
                    logoutUserAccount();
                    setCurrentUser(null);
                  }}
                  title="Đăng xuất"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-amber-300" />
                Đăng nhập
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-slate-100 flex overflow-x-auto no-scrollbar gap-1.5 py-2">
          <button
            onClick={() => setActiveTab('tocfl-8000-study')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'tocfl-8000-study'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            Từ vựng TOCFL
          </button>

          <button
            onClick={() => setActiveTab('zhuyin-chart')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'zhuyin-chart'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Bảng Chú âm
          </button>

          <button
            onClick={() => setActiveTab('b1-reading')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'b1-reading'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Đọc & Ngữ pháp
          </button>

          <button
            onClick={() => setActiveTab('taiwan-life')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'taiwan-life'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageCircleHeart className="w-4 h-4" />
            Giao tiếp Đài
          </button>

          <button
            onClick={() => setActiveTab('speaking')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'speaking'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Mic className="w-4 h-4" />
            Luyện nói
          </button>

          <button
            onClick={() => setActiveTab('mock-exam')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'mock-exam'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            Thi thử
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            Ôn tập & Quiz
          </button>

          <button
            onClick={() => setActiveTab('tocfl-import')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'tocfl-import'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 bg-amber-50 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Wand2 className="w-4 h-4 text-amber-500" />
            + Thêm từ
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* TAB 1: FULL 7,517 WORDS TOCFL 8000 STUDY STUDIO (DIVIDED BY LEVEL, CONTEXT & 20-WORD LESSONS) */}
        {activeTab === 'tocfl-8000-study' && (
          <Tocfl8000StudySection
            showZhuyin={showZhuyin}
            showSimplified={showSimplified}
            masteredIds={masteredIds}
            onToggleMastered={toggleMastered}
            onBulkUpdateMastered={updateMasteredIds}
            certifiedLevels={certifiedLevels}
            onCertifyLevel={handleCertifyLevel}
          />
        )}

        {/* TAB 2: SMART VOCAB IMPORTER */}
        {activeTab === 'tocfl-import' && (
          <TocflImporterSection
            allVocab={allVocab}
            customVocab={customVocab}
            onImportVocab={handleImportVocab}
            onClearCustomVocab={handleClearCustomVocab}
            onSelectWordToStudy={handleSelectWordToStudy}
          />
        )}

        {/* TAB 3: ZHUYIN CHART */}
        {activeTab === 'zhuyin-chart' && <ZhuyinChartSection />}

        {/* TAB 4: INTERMEDIATE TOCFL B1 */}
        {activeTab === 'b1-reading' && <IntermediateB1Section showZhuyin={showZhuyin} />}

        {/* TAB 5: TAIWAN REAL-LIFE COMMUNICATION */}
        {activeTab === 'taiwan-life' && <TaiwanLifeSection showZhuyin={showZhuyin} />}

        {/* TAB 6: SPEAKING PRACTICE AI */}
        {activeTab === 'speaking' && <SpeakingPracticeSection showZhuyin={showZhuyin} />}

        {/* TAB 7: TOCFL MOCK EXAM */}
        {activeTab === 'mock-exam' && <TocflMockExamSection />}

        {/* TAB 8: QUIZ */}
        {activeTab === 'quiz' && (
          <QuizSection
            activeTrack={selectedTrack}
            vocabList={allVocab}
            masteredIds={masteredIds}
            onBulkUpdateMastered={updateMasteredIds}
            certifiedLevels={certifiedLevels}
            onCertifyLevel={handleCertifyLevel}
            userRewardStats={currentUser?.rewardStats}
            userReviewStats={currentUser?.reviewStats}
            userDailyPlan={currentUser?.dailyPlan}
            onUpdateQuizAccountStats={(patch) => {
              if (!currentUser) return;
              const updated = updateUserAccountData(currentUser.userId, (prev) => ({
                ...prev,
                rewardStats: patch.rewardStats ?? prev.rewardStats,
                reviewStats: patch.reviewStats ?? prev.reviewStats,
                dailyPlan: patch.dailyPlan ?? prev.dailyPlan,
              }));
              if (updated) setCurrentUser(updated);
            }}
            onGoToStudyTab={() => setActiveTab('tocfl-8000-study')}
          />
        )}
      </main>

      {/* AUTH ACCOUNT MODAL */}
      {showAuthModal && (
        <AuthAccountModal
          currentUser={currentUser}
          onAuthChange={(user) => setCurrentUser(user)}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
export default App;
