import React, { useState, useEffect, useMemo } from 'react';
import { VocabItem, TrackId } from '../data/courseData';
import { Tocfl8000Word, TocflLevelMeta } from './Tocfl8000StudySection';
import { LevelCertificationModal } from './LevelCertificationModal';
import { LevelCertificationRecord } from '../utils/userAccountDb';
import { speakTaiwanMandarin } from '../utils/speech';
import {
  Trophy,
  Volume2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Headphones,
  BookOpen,
  Languages,
  Flame,
  Sparkles,
  CalendarCheck2,
  Zap,
  Star,
  CheckSquare,
  Play,
  Gift,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface QuizSectionProps {
  activeTrack: TrackId | 'all';
  vocabList: VocabItem[];
  masteredIds?: string[];
  onBulkUpdateMastered?: (ids: string[]) => void;
  certifiedLevels?: Record<string, LevelCertificationRecord>;
  onCertifyLevel?: (cert: LevelCertificationRecord, allLevelWordIds: string[]) => void;
  onGoToStudyTab?: () => void;
}

type QuizMode = 'hanzi-to-meaning' | 'audio-to-hanzi' | 'meaning-to-hanzi';

interface WordReviewStat {
  lastReviewed: number; // timestamp
  correctCount: number;
  wrongCount: number;
}

interface DailyProgressState {
  dateStr: string;
  targetWordsCount: number;
  batchSize: number;
  completedBatchIndices: number[];
  dailyBonusClaimed: boolean;
  wordsReviewedToday: number;
}

interface RewardStats {
  totalPoints: number;
  streakDays: number;
  lastCompletedDate: string;
  totalSessionsCompleted: number;
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function getRankTitle(points: number): { title: string; badge: string; nextPoints: number } {
  if (points >= 10000) {
    return { title: 'Đại Sư Bát Thiên Từ (TOCFL Master)', badge: '👑', nextPoints: 20000 };
  }
  if (points >= 5000) {
    return { title: 'Học Giả Tinh Thông (Band B2–C1)', badge: '💎', nextPoints: 10000 };
  }
  if (points >= 2000) {
    return { title: 'Chuyên Gia Tiến Giai (TOCFL B1)', badge: '🔥', nextPoints: 5000 };
  }
  if (points >= 500) {
    return { title: 'Chiến Binh Cơ Bản (TOCFL A1–A2)', badge: '⭐', nextPoints: 2000 };
  }
  return { title: 'Tân Binh Đảo Ngọc (準備級)', badge: '🌱', nextPoints: 500 };
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  masteredIds = [],
  onBulkUpdateMastered,
  certifiedLevels = {},
  onCertifyLevel,
  onGoToStudyTab,
}) => {
  const [words, setWords] = useState<Tocfl8000Word[]>([]);
  const [levels, setLevels] = useState<TocflLevelMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [certifyingLevelCode, setCertifyingLevelCode] = useState<string | null>(null);

  // SRS word review stats persisted in localStorage
  const [reviewStats, setReviewStats] = useState<Record<string, WordReviewStat>>(() => {
    try {
      const saved = localStorage.getItem('formosa_srs_word_stats');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Positive Points & Streak persisted in localStorage
  const [rewardStats, setRewardStats] = useState<RewardStats>(() => {
    try {
      const saved = localStorage.getItem('formosa_reward_stats');
      return saved
        ? JSON.parse(saved)
        : {
            totalPoints: 120,
            streakDays: 1,
            lastCompletedDate: '',
            totalSessionsCompleted: 0,
          };
    } catch {
      return {
        totalPoints: 120,
        streakDays: 1,
        lastCompletedDate: '',
        totalSessionsCompleted: 0,
      };
    }
  });

  // Daily Review Plan state
  const todayStr = getTodayStr();
  const [dailyPlan, setDailyPlan] = useState<DailyProgressState>(() => {
    try {
      const saved = localStorage.getItem('formosa_daily_review_plan');
      if (saved) {
        const parsed: DailyProgressState = JSON.parse(saved);
        if (parsed.dateStr === getTodayStr()) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return {
      dateStr: getTodayStr(),
      targetWordsCount: 200,
      batchSize: 25,
      completedBatchIndices: [],
      dailyBonusClaimed: false,
      wordsReviewedToday: 0,
    };
  });

  // Active Lesson Quiz State
  const [activeBatchIdx, setActiveBatchIdx] = useState<number>(0);
  const [isPlayingQuiz, setIsPlayingQuiz] = useState<boolean>(false);
  const [quizMode, setQuizMode] = useState<QuizMode>('hanzi-to-meaning');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [sessionPointsEarned, setSessionPointsEarned] = useState<number>(0);
  const [finishedBatch, setFinishedBatch] = useState<boolean>(false);

  useEffect(() => {
    fetch('/tocfl_8000_full.json')
      .then((r) => r.json())
      .then((data) => {
        setWords(data.words || []);
        setLevels(data.levels || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('formosa_srs_word_stats', JSON.stringify(reviewStats));
    } catch {
      // ignore
    }
  }, [reviewStats]);

  useEffect(() => {
    try {
      localStorage.setItem('formosa_reward_stats', JSON.stringify(rewardStats));
    } catch {
      // ignore
    }
  }, [rewardStats]);

  useEffect(() => {
    try {
      localStorage.setItem('formosa_daily_review_plan', JSON.stringify(dailyPlan));
    } catch {
      // ignore
    }
  }, [dailyPlan]);

  // STRICT Pool of "Learned Words" (Chỉ lấy đúng các từ tài khoản này đã học / đã thi đạt, tuyệt đối không trộn từ chưa học)
  const masteredSet = useMemo(() => new Set(masteredIds), [masteredIds]);
  const learnedWordsPool = useMemo(() => {
    return words.filter((w) => masteredSet.has(w.id));
  }, [words, masteredSet]);

  // Sort learned words by SRS priority:
  // 1. Words with wrongCount > correctCount (hay sai)
  // 2. Words never reviewed or reviewed longest ago
  const prioritizedDailyWords = useMemo(() => {
    const sorted = [...learnedWordsPool].sort((a, b) => {
      const statA = reviewStats[a.id];
      const statB = reviewStats[b.id];
      const wrongDiffA = statA ? statA.wrongCount * 2 - statA.correctCount : 1;
      const wrongDiffB = statB ? statB.wrongCount * 2 - statB.correctCount : 1;
      if (wrongDiffA !== wrongDiffB) return wrongDiffB - wrongDiffA;

      const timeA = statA ? statA.lastReviewed : 0;
      const timeB = statB ? statB.lastReviewed : 0;
      return timeA - timeB;
    });

    return sorted.slice(0, Math.min(dailyPlan.targetWordsCount, sorted.length));
  }, [learnedWordsPool, reviewStats, dailyPlan.targetWordsCount]);

  // Split today's target words into structured Review Lessons (Bài Ôn Tập 1, 2, 3...)
  const reviewBatches = useMemo(() => {
    const bSize = dailyPlan.batchSize || 25;
    const result: Tocfl8000Word[][] = [];
    for (let i = 0; i < prioritizedDailyWords.length; i += bSize) {
      result.push(prioritizedDailyWords.slice(i, i + bSize));
    }
    return result;
  }, [prioritizedDailyWords, dailyPlan.batchSize]);

  const safeBatchIdx = Math.max(0, Math.min(activeBatchIdx, reviewBatches.length - 1));
  const currentBatchQuestions = reviewBatches[safeBatchIdx] || [];
  const currentQuestion = currentBatchQuestions[currentIdx] || currentBatchQuestions[0];

  const allBatchesCompletedToday =
    reviewBatches.length > 0 &&
    reviewBatches.every((_, idx) => dailyPlan.completedBatchIndices.includes(idx));

  // Generate 4 options for current question (prioritizing learnedWordsPool so unlearned words don't distract)
  const options = useMemo(() => {
    if (!currentQuestion || words.length === 0) return [];
    const pool = learnedWordsPool.length >= 4 ? learnedWordsPool : words;
    const others = pool.filter((w) => w.id !== currentQuestion.id);
    const distractors: Tocfl8000Word[] = [];
    for (let i = 0; i < 3 && i < others.length; i++) {
      const idx = (currentIdx * 19 + safeBatchIdx * 37 + i * 53) % others.length;
      distractors.push(others[idx]);
    }
    return [currentQuestion, ...distractors].sort((a, b) => a.id.localeCompare(b.id));
  }, [currentQuestion, learnedWordsPool, words, currentIdx, safeBatchIdx]);

  const getDisplayMeaning = (w: Tocfl8000Word) => {
    if (w.vietnamese && w.english) {
      return `${w.vietnamese} (${w.english.split(';')[0]})`;
    }
    return w.vietnamese || w.english || `Hán Việt: ${w.hanViet.toUpperCase()}`;
  };

  useEffect(() => {
    if (isPlayingQuiz && quizMode === 'audio-to-hanzi' && currentQuestion && !finishedBatch) {
      speakTaiwanMandarin(currentQuestion.traditional, 0.88);
    }
  }, [isPlayingQuiz, quizMode, currentQuestion, finishedBatch]);

  // Open Level Certification Exam when user clicks a level to confirm they mastered it
  const handleClickCertifyLevel = (levelCode: string) => {
    setCertifyingLevelCode(levelCode);
  };

  const handleSetDailyTarget = (targetCount: number, bSize: number) => {
    setDailyPlan((prev) => ({
      ...prev,
      targetWordsCount: targetCount,
      batchSize: bSize,
      completedBatchIndices: [],
      dailyBonusClaimed: false,
    }));
    setActiveBatchIdx(0);
    setIsPlayingQuiz(false);
  };

  const handleStartBatch = (batchIdx: number) => {
    setActiveBatchIdx(batchIdx);
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setScore(0);
    setCombo(0);
    setSessionPointsEarned(0);
    setFinishedBatch(false);
    setIsPlayingQuiz(true);
  };

  const handleSelectOption = (optId: string) => {
    if (selectedOptionId || !currentQuestion) return;
    setSelectedOptionId(optId);
    const isCorrect = optId === currentQuestion.id;

    // Update SRS history for this word
    setReviewStats((prev) => {
      const existing = prev[currentQuestion.id] || {
        lastReviewed: 0,
        correctCount: 0,
        wrongCount: 0,
      };
      return {
        ...prev,
        [currentQuestion.id]: {
          lastReviewed: Date.now(),
          correctCount: isCorrect ? existing.correctCount + 1 : existing.correctCount,
          wrongCount: isCorrect ? existing.wrongCount : existing.wrongCount + 1,
        },
      };
    });

    if (isCorrect) {
      const newCombo = combo + 1;
      const comboBonus = newCombo >= 3 ? 5 : 0;
      const gained = 10 + comboBonus;
      setScore((prev) => prev + 1);
      setCombo(newCombo);
      setSessionPointsEarned((prev) => prev + gained);
      setRewardStats((prev) => ({
        ...prev,
        totalPoints: prev.totalPoints + gained,
      }));
      speakTaiwanMandarin(currentQuestion.traditional, 0.9);
    } else {
      setCombo(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < currentBatchQuestions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionId(null);
    } else {
      // Completed this batch!
      const batchCompletionBonus = 50;
      const newCompleted = Array.from(
        new Set([...dailyPlan.completedBatchIndices, safeBatchIdx])
      );
      const isAllDoneNow = reviewBatches.every((_, idx) => newCompleted.includes(idx));
      const dailyGrandBonus = isAllDoneNow && !dailyPlan.dailyBonusClaimed ? 300 : 0;

      setSessionPointsEarned((prev) => prev + batchCompletionBonus + dailyGrandBonus);

      setDailyPlan((prev) => ({
        ...prev,
        completedBatchIndices: newCompleted,
        dailyBonusClaimed: prev.dailyBonusClaimed || isAllDoneNow,
        wordsReviewedToday: prev.wordsReviewedToday + currentBatchQuestions.length,
      }));

      setRewardStats((prev) => {
        const isNewStreakDay = isAllDoneNow && prev.lastCompletedDate !== todayStr;
        return {
          totalPoints: prev.totalPoints + batchCompletionBonus + dailyGrandBonus,
          streakDays: isNewStreakDay ? prev.streakDays + 1 : prev.streakDays,
          lastCompletedDate: isAllDoneNow ? todayStr : prev.lastCompletedDate,
          totalSessionsCompleted: prev.totalSessionsCompleted + 1,
        };
      });

      setFinishedBatch(true);
    }
  };

  const rankInfo = getRankTitle(rewardStats.totalPoints);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
        Đang tải hệ thống Ôn tập Thông minh (SRS 8000 từ)...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* GAMIFICATION & POSITIVE REWARDS BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-3 py-1 rounded-full">
                {rankInfo.badge} {rankInfo.title}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/15 px-3 py-1 rounded-full text-amber-300">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Chuỗi chăm chỉ: {rewardStats.streakDays} ngày
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold pt-1">
              Lộ Trình Ôn Tập Từ Đã Học & Điểm Tích Cực Mỗi Ngày
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Hệ thống tự động rút từ trong <strong>{learnedWordsPool.length} từ bạn đã học</strong> (ưu tiên từ lâu chưa ôn & từ từng làm sai), chia thành các bài nhỏ vừa sức. Hoàn thành hết các bài gợi ý hôm nay để nhận <strong>+300 Điểm Tích Cực</strong>!
            </p>
          </div>

          {/* Positive Points & Daily Progress Meter */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-300 text-xs font-bold uppercase">
                <Zap className="w-4 h-4" /> Điểm Tích Cực
              </div>
              <div className="text-3xl font-extrabold mt-1 text-white">
                {rewardStats.totalPoints.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-200 mt-0.5">
                Mốc tiếp theo: {rankInfo.nextPoints.toLocaleString()} điểm
              </div>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-300 text-xs font-bold uppercase">
                <CalendarCheck2 className="w-4 h-4" /> Tiến Độ Hôm Nay
              </div>
              <div className="text-3xl font-extrabold mt-1 text-white">
                {dailyPlan.completedBatchIndices.length} / {reviewBatches.length}
              </div>
              <div className="text-[11px] text-emerald-200 mt-0.5">
                Bài đã xong ({dailyPlan.wordsReviewedToday} lượt từ)
              </div>
            </div>
          </div>
        </div>

        {/* Daily Grand Completion Celebration Banner */}
        {allBatchesCompletedToday && (
          <div className="mt-6 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-950 text-amber-300 flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base">
                  🎉 Xuất sắc! Bạn đã hoàn thành 100% kế hoạch ôn tập hôm nay!
                </h4>
                <p className="text-xs font-semibold text-slate-800">
                  Đã cộng +300 Điểm Tích Cực thưởng mục tiêu ngày & duy trì chuỗi {rewardStats.streakDays} ngày liên tiếp!
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold uppercase bg-slate-950 text-amber-300 px-3 py-1.5 rounded-xl">
              +300 XP Đã nhận ✓
            </span>
          </div>
        )}
      </div>

      {/* DASHBOARD VIEW (WHEN NOT IN AN ACTIVE QUIZ SESSION) */}
      {!isPlayingQuiz && (
        <div className="space-y-6">
          {/* STEP 1: CONFIGURE LEARNED POOL VIA LEVEL CERTIFICATION EXAM & DAILY VOLUME */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Level Certification Exam to Unlock Levels into Learned Pool */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    Kho Từ Đã Học Của Tài Khoản: {learnedWordsPool.length} / {words.length} từ
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    1. Thi Xác Nhận Đạt Cấp Bậc (Chống lẫn từ chưa học vào bài ôn tập)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bấm vào cấp bậc bạn đã học (ví dụ <strong>準備級一級 Novice 1</strong>) để làm bài kiểm tra xác nhận 20 câu. Đạt ≥ 80% sẽ hiển thị <strong>🏆 Đã đạt</strong> và đưa toàn bộ từ cấp đó vào Kho Ôn Tập Hàng Ngày!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {levels.map((lvl) => {
                  const levelWordIds = words
                    .filter((w) => w.levelCode === lvl.code)
                    .map((w) => w.id);
                  const learnedCountInLvl = levelWordIds.filter((id) =>
                    masteredSet.has(id)
                  ).length;
                  const cert = certifiedLevels[lvl.code];

                  return (
                    <button
                      key={lvl.code}
                      onClick={() => handleClickCertifyLevel(lvl.code)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                        cert
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : learnedCountInLvl > 0
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      {cert ? (
                        <Award className="w-3.5 h-3.5 text-amber-300" />
                      ) : (
                        <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>{cert ? `🏆 Đã đạt ${lvl.label}` : `Thi xác nhận ${lvl.label}`}</span>
                      <span className="opacity-80">
                        ({learnedCountInLvl}/{lvl.count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Choose Today's Review Volume (50 -> 200 -> 500 -> 1000 words) */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Linh hoạt theo thời gian của bạn hôm nay
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  2. Hôm nay bạn muốn ôn tập bao nhiêu từ trong kho đã học?
                </h3>
                <p className="text-xs text-slate-500">
                  Có hôm bận ôn 100–200 từ, hôm rảnh ôn 500–1.000 từ. Hệ thống sẽ tự chia thành các bài nhỏ!
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { count: 100, batch: 20, label: '🌱 Nhẹ nhàng', desc: '100 từ (5 bài × 20 từ)' },
                  { count: 200, batch: 25, label: '⭐ Đều đặn', desc: '200 từ (8 bài × 25 từ)' },
                  { count: 350, batch: 35, label: '🔥 Chăm chỉ', desc: '350 từ (10 bài × 35 từ)' },
                  { count: 500, batch: 50, label: '⚡ Tăng tốc', desc: '500 từ (10 bài × 50 từ)' },
                  { count: 1000, batch: 50, label: '🚀 Cao điểm 1000', desc: '1.000 từ (20 bài × 50 từ)' },
                  {
                    count: learnedWordsPool.length,
                    batch: 50,
                    label: '👑 Tổng duyệt',
                    desc: `Tất cả (${learnedWordsPool.length} từ)`,
                  },
                ].map((preset, idx) => {
                  const isSelected = dailyPlan.targetWordsCount === preset.count;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSetDailyTarget(preset.count, preset.batch)}
                      className={`p-3 rounded-2xl border text-left transition ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      <div className="font-bold text-xs">{preset.label}</div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          isSelected ? 'text-amber-100' : 'text-slate-500'
                        }`}
                      >
                        {preset.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 2: TODAY'S SUGGESTED REVIEW LESSONS GRID */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Danh Sách Bài Ôn Tập Gợi Ý Hôm Nay ({reviewBatches.length} bài · Tổng{' '}
                  {prioritizedDailyWords.length} từ cần ôn)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mỗi bài hoàn thành cộng <strong>+50 Điểm Tích Cực</strong>. Hoàn thành tất cả các bài hôm nay nhận thưởng lớn <strong>+300 Điểm</strong>!
                </p>
              </div>

              {/* Quiz Mode Selector */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setQuizMode('hanzi-to-meaning')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    quizMode === 'hanzi-to-meaning'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Nhìn chữ → Chọn nghĩa
                </button>

                <button
                  onClick={() => setQuizMode('audio-to-hanzi')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    quizMode === 'audio-to-hanzi'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" /> Nghe âm → Chọn chữ
                </button>

                <button
                  onClick={() => setQuizMode('meaning-to-hanzi')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    quizMode === 'meaning-to-hanzi'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" /> Nhìn nghĩa → Chọn chữ
                </button>
              </div>
            </div>

            {reviewBatches.length === 0 ? (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Kho Từ Đã Học của tài khoản hiện chưa có từ nào (0 từ)
                </h4>
                <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Để đảm bảo <strong>tuyệt đối không có từ chưa học bị lạc vào bài ôn tập hàng ngày</strong>, hệ thống chỉ tạo bài ôn tập từ những từ bạn đã đánh dấu Đã thuộc hoặc những cấp bậc bạn đã vượt qua Bài Kiểm Tra Xác Nhận.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    onClick={() => setCertifyingLevelCode('novice1')}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" /> Thi xác nhận đạt 準備級一級(Novice 1) ngay
                  </button>
                  {onGoToStudyTab && (
                    <button
                      onClick={onGoToStudyTab}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <BookOpen className="w-4 h-4" /> Sang mục Học 8000 Từ để học Bài 1
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 max-h-[480px] overflow-y-auto p-1">
                {reviewBatches.map((batch, idx) => {
                  const isDone = dailyPlan.completedBatchIndices.includes(idx);
                  const startNum = idx * dailyPlan.batchSize + 1;
                  const endNum = startNum + batch.length - 1;
                  const sampleWords = batch
                    .slice(0, 5)
                    .map((w) => w.traditional)
                    .join('、');

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border p-4 flex flex-col justify-between transition ${
                        isDone
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-emerald-400'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            Bài Ôn Tập {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            Từ {startNum}–{endNum} ({batch.length} từ)
                          </span>
                        </div>

                        <p className="font-tc text-sm font-bold text-slate-800 truncate">
                          {sampleWords}...
                        </p>

                        <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          Thưởng hoàn thành: +50 Điểm tích cực
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartBatch(idx)}
                        className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isDone
                            ? 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        {isDone ? 'Đã hoàn thành ✓ (Ôn lại)' : 'Bắt đầu ôn bài này →'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ SESSION VIEW */}
      {isPlayingQuiz && currentQuestion && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 max-w-2xl mx-auto">
          {finishedBatch ? (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Hoàn thành Bài Ôn Tập {safeBatchIdx + 1}! 🎉
              </h3>
              <p className="text-slate-600">
                Bạn trả lời đúng{' '}
                <strong className="text-emerald-600 text-2xl">{score}</strong> /{' '}
                <strong>{currentBatchQuestions.length}</strong> từ.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 max-w-md mx-auto space-y-1">
                <div className="text-xs font-bold uppercase text-amber-800">
                  Điểm Tích Cực nhận được trong bài này
                </div>
                <div className="text-3xl font-extrabold text-amber-600">
                  +{sessionPointsEarned} XP ⚡
                </div>
                <div className="text-xs text-slate-600">
                  (Bao gồm +50 điểm thưởng hoàn thành bài
                  {allBatchesCompletedToday ? ' & +300 điểm thưởng hoàn thành mục tiêu ngày!' : ')'}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {safeBatchIdx + 1 < reviewBatches.length && (
                  <button
                    onClick={() => handleStartBatch(safeBatchIdx + 1)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition shadow-sm"
                  >
                    Sang Bài Ôn Tập {safeBatchIdx + 2} →
                  </button>
                )}

                <button
                  onClick={() => handleStartBatch(safeBatchIdx)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
                >
                  <RotateCcw className="w-4 h-4" /> Làm lại bài này
                </button>

                <button
                  onClick={() => setIsPlayingQuiz(false)}
                  className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition"
                >
                  Về Bảng Lộ Trình Hôm Nay
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlayingQuiz(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline"
                  >
                    ← Danh sách bài
                  </button>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Bài Ôn {safeBatchIdx + 1} · Câu {currentIdx + 1} /{' '}
                    {currentBatchQuestions.length}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {combo >= 2 && (
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 animate-bounce">
                      🔥 Combo x{combo}!
                    </span>
                  )}
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    ⚡ +{sessionPointsEarned} XP
                  </span>
                </div>
              </div>

              {/* Prompt Box */}
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200/80 px-4 space-y-2">
                {quizMode === 'hanzi-to-meaning' && (
                  <>
                    <p className="text-xs uppercase font-bold text-slate-400">
                      Chọn nghĩa đúng của từ Phồn thể sau ({currentQuestion.levelTag})
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-1">
                      <h2 className="font-tc text-5xl font-bold text-slate-900">
                        {currentQuestion.rawWord}
                      </h2>
                      <button
                        onClick={() => speakTaiwanMandarin(currentQuestion.traditional)}
                        className="p-2.5 rounded-2xl bg-white border border-slate-200 text-red-600 hover:bg-red-50 transition"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                      {currentQuestion.pinyin} ·{' '}
                      <span className="font-tc text-amber-900">{currentQuestion.zhuyin}</span> (Hán
                      Việt: {currentQuestion.hanViet.toUpperCase()})
                    </p>
                  </>
                )}

                {quizMode === 'audio-to-hanzi' && (
                  <>
                    <p className="text-xs uppercase font-bold text-amber-700">
                      Nghe phát âm giọng Đài Loan và chọn đúng chữ Phồn thể
                    </p>
                    <div className="py-3">
                      <button
                        onClick={() => speakTaiwanMandarin(currentQuestion.traditional, 0.85)}
                        className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md transition"
                      >
                        <Volume2 className="w-6 h-6" /> Bấm nghe lại phát âm (zh-TW)
                      </button>
                    </div>
                    {selectedOptionId && (
                      <p className="text-sm text-slate-700 font-semibold pt-1">
                        Đáp án: <span className="font-tc text-lg">{currentQuestion.rawWord}</span> (
                        {currentQuestion.pinyin} · {currentQuestion.zhuyin}) —{' '}
                        {getDisplayMeaning(currentQuestion)}
                      </p>
                    )}
                  </>
                )}

                {quizMode === 'meaning-to-hanzi' && (
                  <>
                    <p className="text-xs uppercase font-bold text-indigo-700">
                      Chọn chữ Phồn thể tương ứng với nghĩa sau
                    </p>
                    <h2 className="text-2xl font-bold text-slate-900 pt-1">
                      {getDisplayMeaning(currentQuestion)}
                    </h2>
                    <p className="text-xs font-bold uppercase text-slate-500">
                      Gợi ý Âm Hán Việt: {currentQuestion.hanViet.toUpperCase()} · Từ loại:{' '}
                      {currentQuestion.pos}
                    </p>
                  </>
                )}
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 gap-2.5">
                {options.map((opt) => {
                  const isChosen = selectedOptionId === opt.id;
                  const isCorrect = opt.id === currentQuestion.id;

                  let style =
                    'bg-white border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/30';
                  if (selectedOptionId) {
                    if (isCorrect) {
                      style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                    } else if (isChosen) {
                      style = 'bg-rose-50 border-rose-300 text-rose-900';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${style}`}
                    >
                      {quizMode === 'hanzi-to-meaning' ? (
                        <span className="text-sm">{getDisplayMeaning(opt)}</span>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="font-tc text-2xl font-bold text-slate-900">
                            {opt.rawWord}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({opt.pinyin} · <span className="font-tc">{opt.zhuyin}</span>)
                          </span>
                        </div>
                      )}

                      {selectedOptionId && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {selectedOptionId && isChosen && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedOptionId && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => speakTaiwanMandarin(currentQuestion.traditional)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                  >
                    <Volume2 className="w-4 h-4" /> Nghe lại phát âm từ này
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                  >
                    {currentIdx + 1 < currentBatchQuestions.length
                      ? 'Câu tiếp theo →'
                      : 'Hoàn thành bài & Nhận điểm thưởng 🎉'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* LEVEL CERTIFICATION EXAM MODAL */}
      {certifyingLevelCode && (
        <LevelCertificationModal
          levelMeta={
            levels.find((l) => l.code === certifyingLevelCode) || {
              code: certifyingLevelCode,
              label: certifyingLevelCode,
              band: 'TOCFL',
              count: words.filter((w) => w.levelCode === certifyingLevelCode).length,
            }
          }
          levelWords={words.filter((w) => w.levelCode === certifyingLevelCode)}
          existingCert={certifiedLevels[certifyingLevelCode]}
          onClose={() => setCertifyingLevelCode(null)}
          onCertifiedSuccess={(cert, allLevelWordIds) => {
            if (onCertifyLevel) {
              onCertifyLevel(cert, allLevelWordIds);
            }
            setRewardStats((prev) => ({
              ...prev,
              totalPoints: prev.totalPoints + 200,
            }));
          }}
        />
      )}
    </div>
  );
};
