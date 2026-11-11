import React, { useState, useEffect, useMemo } from 'react';
import { VocabItem, TrackId } from '../data/courseData';
import { Tocfl8000Word, TocflLevelMeta } from './Tocfl8000StudySection';
import { LevelCertificationModal } from './LevelCertificationModal';
import {
  LevelCertificationRecord,
  RewardStats,
  WordReviewStat,
  DailyProgressState,
  computeWeeklyDiligence,
  DayDiligenceView,
} from '../utils/userAccountDb';
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
  TrendingUp,
  X,
  History,
} from 'lucide-react';

interface QuizSectionProps {
  activeTrack: TrackId | 'all';
  vocabList: VocabItem[];
  masteredIds?: string[];
  masteredAt?: Record<string, string>;
  onBulkUpdateMastered?: (ids: string[]) => void;
  certifiedLevels?: Record<string, LevelCertificationRecord>;
  onCertifyLevel?: (cert: LevelCertificationRecord, allLevelWordIds: string[]) => void;
  userRewardStats?: RewardStats;
  userReviewStats?: Record<string, WordReviewStat>;
  userDailyPlan?: DailyProgressState;
  onUpdateQuizAccountStats?: (patch: {
    rewardStats?: RewardStats;
    reviewStats?: Record<string, WordReviewStat>;
    dailyPlan?: DailyProgressState;
  }) => void;
  onGoToStudyTab?: () => void;
}

type QuizMode = 'hanzi-to-meaning' | 'audio-to-hanzi' | 'meaning-to-hanzi';

export interface PausedQuizState {
  batchIdx: number;
  currentIdx: number;
  score: number;
  combo: number;
  questions: Tocfl8000Word[];
  quizMode: QuizMode;
  dateStr: string;
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function getDiligenceRank(rate: number): { title: string; badge: string; color: string } {
  if (rate >= 90) {
    return { title: 'Siêu chăm chỉ', badge: '🌟', color: 'bg-amber-400 text-slate-950' };
  }
  if (rate >= 75) {
    return { title: 'Rất đều đặn', badge: '🔥', color: 'bg-orange-500 text-white' };
  }
  if (rate >= 50) {
    return { title: 'Đang cố gắng', badge: '🌱', color: 'bg-emerald-500 text-white' };
  }
  return { title: 'Cần tăng tốc', badge: '💪', color: 'bg-slate-700 text-slate-200' };
}

// PRNG with seed string (date + session)
function seededRandom(seedStr: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(array: T[], seedStr: string): T[] {
  const result = [...array];
  const rand = seededRandom(seedStr);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Xáo trộn triệt để danh sách từ vựng ôn tập và giãn cách (disperse) các từ cặp/trái nghĩa/gần nhau
 * trong cùng bài học gốc (như: năm nay/năm sau, hôm qua/hôm nay/ngày mai, ba/mẹ, trái/phải...)
 * để câu hỏi không bao giờ bị xếp liền kề nhau gây lộ đáp án hoặc quá dễ đoán.
 */
function shuffleWordsWithDispersion(
  wordsToShuffle: Tocfl8000Word[],
  allWords: Tocfl8000Word[],
  seedStr: string
): Tocfl8000Word[] {
  if (wordsToShuffle.length <= 1) return [...wordsToShuffle];

  // Lưu vị trí chỉ số gốc trong bộ từ vựng
  const originalIndexMap = new Map<string, number>();
  allWords.forEach((w, idx) => originalIndexMap.set(w.id, idx));

  // Bước 1: Xáo trộn ngẫu nhiên hoàn toàn theo thuật toán Fisher-Yates có Seed
  const result = shuffleWithSeed(wordsToShuffle, seedStr);

  // Bước 2: Quét chống dồn cụm (Anti-clustering pass)
  // Nếu 2 từ kế tiếp có khoảng cách gốc <= 3 (thường là từ trái nghĩa, cùng cụm từ vựng trong bài),
  // thực hiện tráo đổi với từ ở xa hơn để phân tán đều khắp các bài ôn.
  const n = result.length;
  for (let i = 1; i < n; i++) {
    const prevIdx = originalIndexMap.get(result[i - 1].id) ?? -999;
    const currIdx = originalIndexMap.get(result[i].id) ?? 999;

    if (Math.abs(currIdx - prevIdx) <= 3) {
      let swapped = false;
      for (let offset = Math.floor(n / 3); offset < n; offset++) {
        const swapTarget = (i + offset) % n;
        if (swapTarget !== i && swapTarget !== i - 1) {
          const targetOriginalIdx = originalIndexMap.get(result[swapTarget].id) ?? 999;
          const targetPrevOriginalIdx =
            swapTarget > 0 ? (originalIndexMap.get(result[swapTarget - 1].id) ?? -999) : -999;
          if (
            Math.abs(targetOriginalIdx - prevIdx) > 3 &&
            Math.abs(currIdx - targetPrevOriginalIdx) > 3
          ) {
            [result[i], result[swapTarget]] = [result[swapTarget], result[i]];
            swapped = true;
            break;
          }
        }
      }
      if (!swapped) {
        const fallbackTarget = (i + Math.floor(n / 2)) % n;
        if (fallbackTarget !== i && fallbackTarget !== i - 1) {
          [result[i], result[fallbackTarget]] = [result[fallbackTarget], result[i]];
        }
      }
    }
  }

  return result;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  masteredIds = [],
  masteredAt = {},
  onBulkUpdateMastered,
  certifiedLevels = {},
  onCertifyLevel,
  userRewardStats,
  userReviewStats,
  userDailyPlan,
  onUpdateQuizAccountStats,
  onGoToStudyTab,
}) => {
  const [words, setWords] = useState<Tocfl8000Word[]>([]);
  const [levels, setLevels] = useState<TocflLevelMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [certifyingLevelCode, setCertifyingLevelCode] = useState<string | null>(null);
  const [selectedLessonLevelCode, setSelectedLessonLevelCode] = useState<string>('novice2');

  // Option: Include today's newly mastered words vs only older words learned before today
  const [includeTodayNewWords, setIncludeTodayNewWords] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('formosa_quiz_include_today_words_v1');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('formosa_quiz_include_today_words_v1', String(includeTodayNewWords));
    } catch {
      // ignore
    }
  }, [includeTodayNewWords]);

  // SRS word review stats (synced with logged-in user's Supabase account)
  const [reviewStats, setReviewStats] = useState<Record<string, WordReviewStat>>(() => {
    if (userReviewStats) return userReviewStats;
    try {
      const saved = localStorage.getItem('formosa_srs_word_stats_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Diligence & Streak (synced with logged-in user's Supabase account)
  const [rewardStats, setRewardStats] = useState<RewardStats>(() => {
    if (userRewardStats) return userRewardStats;
    try {
      const saved = localStorage.getItem('formosa_reward_stats_v2');
      return saved
        ? JSON.parse(saved)
        : {
            totalPoints: 0,
            streakDays: 0,
            lastCompletedDate: '',
            totalSessionsCompleted: 0,
            diligenceHistory: {},
          };
    } catch {
      return {
        totalPoints: 0,
        streakDays: 0,
        lastCompletedDate: '',
        totalSessionsCompleted: 0,
        diligenceHistory: {},
      };
    }
  });

  // Daily Review Plan state
  const todayStr = getTodayStr();
  const [dailyPlan, setDailyPlan] = useState<DailyProgressState>(() => {
    if (userDailyPlan && userDailyPlan.dateStr === getTodayStr()) {
      return userDailyPlan;
    }
    try {
      const saved = localStorage.getItem('formosa_daily_review_plan_v2');
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

  // Keep state synced when user logs in / switches account
  useEffect(() => {
    if (userRewardStats) {
      setRewardStats(userRewardStats);
    }
  }, [userRewardStats]);

  useEffect(() => {
    if (userReviewStats) {
      setReviewStats(userReviewStats);
    }
  }, [userReviewStats]);

  useEffect(() => {
    if (userDailyPlan && userDailyPlan.dateStr === getTodayStr()) {
      setDailyPlan(userDailyPlan);
    }
  }, [userDailyPlan]);

  // Active Lesson Quiz State
  const [activeBatchIdx, setActiveBatchIdx] = useState<number>(0);
  const [activeBatchQuestions, setActiveBatchQuestions] = useState<Tocfl8000Word[]>([]);
  const [isPlayingQuiz, setIsPlayingQuiz] = useState<boolean>(false);
  const [quizMode, setQuizMode] = useState<QuizMode>('hanzi-to-meaning');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [sessionPointsEarned, setSessionPointsEarned] = useState<number>(0);
  const [finishedBatch, setFinishedBatch] = useState<boolean>(false);

  // Paused session progress state (resumable when exiting midway)
  const [pausedState, setPausedState] = useState<PausedQuizState | null>(() => {
    try {
      const saved = localStorage.getItem('formosa_paused_quiz_batch_v1');
      if (saved) {
        const parsed: PausedQuizState = JSON.parse(saved);
        if (parsed.dateStr === getTodayStr() && parsed.questions && parsed.questions.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    try {
      if (pausedState) {
        localStorage.setItem('formosa_paused_quiz_batch_v1', JSON.stringify(pausedState));
      } else {
        localStorage.removeItem('formosa_paused_quiz_batch_v1');
      }
    } catch {
      // ignore
    }
  }, [pausedState]);

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

  const updateRewardAndSync = (updater: (prev: RewardStats) => RewardStats) => {
    setRewardStats((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('formosa_reward_stats_v2', JSON.stringify(next));
      } catch {
        // ignore
      }
      if (onUpdateQuizAccountStats) {
        onUpdateQuizAccountStats({ rewardStats: next });
      }
      return next;
    });
  };

  const updateReviewAndSync = (
    updater: (prev: Record<string, WordReviewStat>) => Record<string, WordReviewStat>
  ) => {
    setReviewStats((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('formosa_srs_word_stats_v2', JSON.stringify(next));
      } catch {
        // ignore
      }
      if (onUpdateQuizAccountStats) {
        onUpdateQuizAccountStats({ reviewStats: next });
      }
      return next;
    });
  };

  const updateDailyPlanAndSync = (
    updater: (prev: DailyProgressState) => DailyProgressState
  ) => {
    setDailyPlan((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('formosa_daily_review_plan_v2', JSON.stringify(next));
      } catch {
        // ignore
      }
      if (onUpdateQuizAccountStats) {
        onUpdateQuizAccountStats({ dailyPlan: next });
      }
      return next;
    });
  };

  // STRICT Pool of "Learned Words" (Chỉ lấy đúng các từ tài khoản này đã học / đã thi đạt, tuyệt đối không trộn từ chưa học)
  const masteredSet = useMemo(() => new Set(masteredIds), [masteredIds]);
  const learnedWordsPool = useMemo(() => {
    return words.filter((w) => {
      if (!masteredSet.has(w.id)) return false;
      // Nếu tắt công tắc "Bao gồm từ mới học hôm nay" -> loại các từ vừa học trong ngày hôm nay
      if (!includeTodayNewWords && masteredAt && masteredAt[w.id] === todayStr) {
        return false;
      }
      return true;
    });
  }, [words, masteredSet, includeTodayNewWords, masteredAt, todayStr]);

  // Đếm số lượng từ mới học hôm nay
  const wordsLearnedTodayCount = useMemo(() => {
    if (!masteredAt) return 0;
    return masteredIds.filter((id) => masteredAt[id] === todayStr).length;
  }, [masteredIds, masteredAt, todayStr]);

  // Sort learned words by SRS priority without shifting words mid-quiz:
  // 1. Words with wrongCount > correctCount (hay sai)
  // 2. Words never reviewed or reviewed longest ago
  // 3. Xáo trộn ngẫu nhiên toàn bộ các bài ôn và giãn cách từ cặp liền kề
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

    const topWords = sorted.slice(0, Math.min(dailyPlan.targetWordsCount, sorted.length));
    const seed = `${dailyPlan.dateStr}_shuffled_pool_${topWords.length}`;
    return shuffleWordsWithDispersion(topWords, words, seed);
    // Notice: Do NOT include reviewStats in deps while isPlayingQuiz to avoid shuffling batches during testing!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learnedWordsPool, dailyPlan.targetWordsCount, dailyPlan.dateStr, words, isPlayingQuiz ? 0 : reviewStats]);

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
  // When in an active quiz session, strictly lock questions to activeBatchQuestions so questions never mutate mid-quiz!
  const currentBatchQuestions =
    isPlayingQuiz && activeBatchQuestions.length > 0
      ? activeBatchQuestions
      : reviewBatches[safeBatchIdx] || [];
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
    const rawOptions = [currentQuestion, ...distractors];
    const optSeed = `${currentQuestion.id}_${currentIdx}_${safeBatchIdx}`;
    return shuffleWithSeed(rawOptions, optSeed);
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
    updateDailyPlanAndSync((prev) => ({
      ...prev,
      targetWordsCount: targetCount,
      batchSize: bSize,
      completedBatchIndices: [],
      dailyBonusClaimed: false,
    }));
    setActiveBatchIdx(0);
    setIsPlayingQuiz(false);
  };

  const handleStartOrResumeBatch = (batchIdx: number, forceRestart: boolean = false) => {
    if (
      !forceRestart &&
      pausedState &&
      pausedState.batchIdx === batchIdx &&
      pausedState.dateStr === todayStr &&
      pausedState.questions &&
      pausedState.questions.length > 0
    ) {
      setActiveBatchQuestions(pausedState.questions);
      setActiveBatchIdx(batchIdx);
      setCurrentIdx(pausedState.currentIdx);
      setSelectedOptionId(null);
      setScore(pausedState.score);
      setCombo(pausedState.combo);
      setFinishedBatch(false);
      setQuizMode(pausedState.quizMode);
      setIsPlayingQuiz(true);
      return;
    }

    const targetBatch = reviewBatches[batchIdx] || [];
    setActiveBatchQuestions(targetBatch);
    setActiveBatchIdx(batchIdx);
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setScore(0);
    setCombo(0);
    setSessionPointsEarned(0);
    setFinishedBatch(false);
    setIsPlayingQuiz(true);

    const initialPaused: PausedQuizState = {
      batchIdx,
      currentIdx: 0,
      score: 0,
      combo: 0,
      questions: targetBatch,
      quizMode,
      dateStr: todayStr,
    };
    setPausedState(initialPaused);
    try {
      localStorage.setItem('formosa_paused_quiz_batch_v1', JSON.stringify(initialPaused));
    } catch {
      // ignore
    }
  };

  const handleExitQuiz = () => {
    if (activeBatchQuestions.length > 0 && !finishedBatch) {
      const targetIdx = selectedOptionId ? currentIdx + 1 : currentIdx;
      if (targetIdx < activeBatchQuestions.length) {
        const stateToSave: PausedQuizState = {
          batchIdx: activeBatchIdx,
          currentIdx: targetIdx,
          score,
          combo,
          questions: activeBatchQuestions,
          quizMode,
          dateStr: todayStr,
        };
        setPausedState(stateToSave);
        try {
          localStorage.setItem('formosa_paused_quiz_batch_v1', JSON.stringify(stateToSave));
        } catch {
          // ignore
        }
      } else {
        setPausedState(null);
        try {
          localStorage.removeItem('formosa_paused_quiz_batch_v1');
        } catch {
          // ignore
        }
      }
    }
    setIsPlayingQuiz(false);
  };

  const handleSelectOption = (optId: string) => {
    if (selectedOptionId || !currentQuestion) return;
    setSelectedOptionId(optId);
    const isCorrect = optId === currentQuestion.id;

    // Update SRS history for this word and sync to Supabase
    updateReviewAndSync((prev) => {
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

    const newScore = isCorrect ? score + 1 : score;
    const newCombo = isCorrect ? combo + 1 : 0;

    if (isCorrect) {
      const comboBonus = newCombo >= 3 ? 5 : 0;
      const gained = 10 + comboBonus;
      setScore(newScore);
      setCombo(newCombo);
      setSessionPointsEarned((prev) => prev + gained);
      updateRewardAndSync((prev) => ({
        ...prev,
        totalPoints: prev.totalPoints + gained,
      }));
      speakTaiwanMandarin(currentQuestion.traditional, 0.9);
    } else {
      setCombo(0);
    }

    // Keep paused progress synced (target index advances to next question once answered)
    const nextIdx = currentIdx + 1;
    if (nextIdx < activeBatchQuestions.length) {
      const stateToSave: PausedQuizState = {
        batchIdx: activeBatchIdx,
        currentIdx: nextIdx,
        score: newScore,
        combo: newCombo,
        questions: activeBatchQuestions,
        quizMode,
        dateStr: todayStr,
      };
      setPausedState(stateToSave);
      try {
        localStorage.setItem('formosa_paused_quiz_batch_v1', JSON.stringify(stateToSave));
      } catch {
        // ignore
      }
    } else {
      setPausedState(null);
      try {
        localStorage.removeItem('formosa_paused_quiz_batch_v1');
      } catch {
        // ignore
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < currentBatchQuestions.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelectedOptionId(null);
      setPausedState({
        batchIdx: activeBatchIdx,
        currentIdx: nextIdx,
        score,
        combo,
        questions: activeBatchQuestions,
        quizMode,
        dateStr: todayStr,
      });
    } else {
      // Completed this batch!
      setPausedState(null);
      try {
        localStorage.removeItem('formosa_paused_quiz_batch_v1');
      } catch {
        // ignore
      }
      const newCompleted = Array.from(
        new Set([...dailyPlan.completedBatchIndices, safeBatchIdx])
      );
      const isAllDoneNow = reviewBatches.length > 0 && reviewBatches.every((_, idx) => newCompleted.includes(idx));
      const todayTotal = Math.max(1, reviewBatches.length);
      const todayRate = Math.min(100, Math.round((newCompleted.length / todayTotal) * 100));

      updateDailyPlanAndSync((prev) => ({
        ...prev,
        completedBatchIndices: newCompleted,
        dailyBonusClaimed: prev.dailyBonusClaimed || isAllDoneNow,
        wordsReviewedToday: prev.wordsReviewedToday + currentBatchQuestions.length,
      }));

      updateRewardAndSync((prev) => {
        const isNewStreakDay = isAllDoneNow && prev.lastCompletedDate !== todayStr;
        const nextHistory = {
          ...(prev.diligenceHistory || {}),
          [todayStr]: {
            completedBatches: newCompleted.length,
            totalBatches: todayTotal,
            rate: todayRate,
          },
        };
        return {
          ...prev,
          totalPoints: prev.totalPoints + 50 + (isAllDoneNow && !dailyPlan.dailyBonusClaimed ? 300 : 0),
          streakDays: isNewStreakDay ? prev.streakDays + 1 : prev.streakDays,
          lastCompletedDate: isAllDoneNow ? todayStr : prev.lastCompletedDate,
          totalSessionsCompleted: prev.totalSessionsCompleted + 1,
          diligenceHistory: nextHistory,
        };
      });

      setFinishedBatch(true);
    }
  };

  const diligenceData = useMemo(() => {
    return computeWeeklyDiligence(
      rewardStats.diligenceHistory || {},
      todayStr,
      dailyPlan.completedBatchIndices.length,
      reviewBatches.length
    );
  }, [rewardStats.diligenceHistory, todayStr, dailyPlan.completedBatchIndices.length, reviewBatches.length]);

  const diligenceRank = getDiligenceRank(diligenceData.weeklyRate);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
        Đang tải hệ thống Ôn tập Thông minh (SRS 8000 từ)...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* DILIGENCE & WEEKLY 7-DAY TRACKER */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${diligenceRank.color}`}>
                {diligenceRank.badge} {diligenceRank.title}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/15 px-2.5 py-0.5 rounded-full text-amber-300">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Chuỗi {rewardStats.streakDays} ngày liên tiếp
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold pt-0.5">
              Độ Chăm Chỉ & Ôn Tập Mỗi Ngày
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 text-center min-w-[130px]">
              <div className="text-[10px] text-amber-300 font-bold uppercase flex items-center justify-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Chăm chỉ tuần này
              </div>
              <div className="text-3xl font-extrabold text-white mt-0.5">
                {diligenceData.weeklyRate}%
              </div>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 text-center min-w-[120px]">
              <div className="text-[10px] text-emerald-300 font-bold uppercase flex items-center justify-center gap-1">
                <CalendarCheck2 className="w-3.5 h-3.5" /> Hôm nay
              </div>
              <div className="text-2xl font-extrabold text-white mt-0.5">
                {dailyPlan.completedBatchIndices.length}/{reviewBatches.length} bài
              </div>
            </div>
          </div>
        </div>

        {/* 7-DAY MINI WEEK TRACKER */}
        <div className="mt-4 pt-3.5 border-t border-white/15">
          <div className="text-[11px] font-bold text-slate-300 uppercase mb-2 flex items-center justify-between">
            <span>Theo dõi độ chăm chỉ tuần này:</span>
            <span className="text-amber-300 font-semibold lowercase">
              trung bình các ngày: {diligenceData.weeklyRate}%
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {diligenceData.days.map((d) => (
              <div
                key={d.label}
                className={`rounded-xl p-2 text-center border transition ${
                  d.isToday
                    ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/30'
                    : d.hasStudied
                    ? 'bg-white/20 text-white border-emerald-400/50'
                    : d.isPast
                    ? 'bg-white/5 text-slate-400 border-white/10'
                    : 'bg-white/5 text-slate-500 border-white/5 opacity-60'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase ${d.isToday ? 'text-slate-900 font-extrabold' : ''}`}>
                  {d.label} {d.isToday ? '(Nay)' : ''}
                </div>
                <div className={`text-xs sm:text-sm font-extrabold mt-0.5 ${d.isToday ? 'text-slate-950' : d.hasStudied ? 'text-emerald-300' : ''}`}>
                  {d.isFuture ? '—' : `${d.rate}%`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Grand Completion Celebration Banner */}
        {allBatchesCompletedToday && (
          <div className="mt-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <Gift className="w-5 h-5 text-slate-950" />
              <span className="font-extrabold text-sm">
                Xuất sắc! Hôm nay hoàn thành 100% mục tiêu bài ôn tập!
              </span>
            </div>
            <span className="text-xs font-extrabold uppercase bg-slate-950 text-amber-300 px-3 py-1 rounded-xl">
              ✓ Đạt 100%
            </span>
          </div>
        )}
      </div>

      {/* DASHBOARD VIEW (WHEN NOT IN AN ACTIVE QUIZ SESSION) */}
      {!isPlayingQuiz && (
        <div className="space-y-5">
          {/* STEP 1: CONFIGURE LEARNED POOL & DAILY VOLUME */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Level Certification & 20-word selector */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  1. Từ đã học: {learnedWordsPool.length}/{words.length} từ
                </h3>
              </div>

              {/* Certified Level Badges */}
              <div className="flex flex-wrap gap-1.5">
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
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                        cert
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : learnedCountInLvl > 0
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      {cert && <Award className="w-3.5 h-3.5 text-amber-300" />}
                      <span>{cert ? `🏆 ${lvl.label}` : lvl.label}</span>
                      <span className="opacity-75 text-[11px]">
                        ({learnedCountInLvl}/{lvl.count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 1B: 20-word Lesson Selector for in-progress level */}
              <div className="pt-2.5 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    Chọn bài 20 từ ({levels.find((l) => l.code === selectedLessonLevelCode)?.label}):
                  </span>
                  <div className="flex gap-1">
                    {levels.map((lvl) => (
                      <button
                        key={lvl.code}
                        onClick={() => setSelectedLessonLevelCode(lvl.code)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                          selectedLessonLevelCode === lvl.code
                            ? 'bg-slate-900 text-amber-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {lvl.label.slice(0, 4)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 20-word Lesson Chips */}
                {(() => {
                  const lvlWords = words.filter((w) => w.levelCode === selectedLessonLevelCode);
                  const lessonCount = Math.ceil(lvlWords.length / 20);
                  return (
                    <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto bg-slate-50 p-2 rounded-xl border border-slate-200">
                      {Array.from({ length: lessonCount }).map((_, bIdx) => {
                        const slice = lvlWords.slice(bIdx * 20, (bIdx + 1) * 20);
                        const sliceIds = slice.map((w) => w.id);
                        const learnedInSlice = sliceIds.filter((id) =>
                          masteredSet.has(id)
                        ).length;
                        const isFullSlice =
                          sliceIds.length > 0 && learnedInSlice === sliceIds.length;

                        return (
                          <button
                            key={bIdx}
                            onClick={() => {
                              if (!onBulkUpdateMastered) return;
                              if (isFullSlice) {
                                const removeSet = new Set(sliceIds);
                                onBulkUpdateMastered(
                                  masteredIds.filter((id) => !removeSet.has(id))
                                );
                              } else {
                                const merged = Array.from(
                                  new Set([...masteredIds, ...sliceIds])
                                );
                                onBulkUpdateMastered(merged);
                              }
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                              isFullSlice
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : learnedInSlice > 0
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                            }`}
                          >
                            {isFullSlice ? '✓' : '+'} Bài {bIdx + 1}
                            {learnedInSlice > 0 && !isFullSlice ? ` (${learnedInSlice}/20)` : ''}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right: Daily Review Target Presets */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  2. Mục tiêu ôn tập hôm nay:
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { count: 100, batch: 20, label: '100 từ', desc: '5 bài × 20 từ' },
                  { count: 200, batch: 25, label: '200 từ', desc: '8 bài × 25 từ' },
                  { count: 350, batch: 35, label: '350 từ', desc: '10 bài × 35 từ' },
                  { count: 500, batch: 50, label: '500 từ', desc: '10 bài × 50 từ' },
                  { count: 1000, batch: 50, label: '1.000 từ', desc: '20 bài × 50 từ' },
                  {
                    count: learnedWordsPool.length,
                    batch: 50,
                    label: 'Tất cả',
                    desc: `${learnedWordsPool.length} từ`,
                  },
                ].map((preset, idx) => {
                  const isSelected = dailyPlan.targetWordsCount === preset.count;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSetDailyTarget(preset.count, preset.batch)}
                      className={`p-2.5 rounded-2xl border text-left transition ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      <div className="font-bold text-xs">{preset.label}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900">
                  Bài ôn tập hôm nay ({reviewBatches.length} bài · {prioritizedDailyWords.length} từ)
                </h3>

                {/* Công tắc Bật/Tắt: Bao gồm từ mới học hôm nay */}
                <button
                  onClick={() => setIncludeTodayNewWords((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    includeTodayNewWords
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                  }`}
                  title="Bấm để chuyển đổi giữa ôn cả từ mới vừa học và chỉ ôn từ các hôm trước"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>
                    Từ mới hôm nay:{' '}
                    <strong className={includeTodayNewWords ? 'text-emerald-700' : 'text-amber-800'}>
                      {includeTodayNewWords ? 'Bao gồm' : 'Để dành mai'}
                    </strong>
                  </span>
                  {wordsLearnedTodayCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        includeTodayNewWords
                          ? 'bg-emerald-200/70 text-emerald-950'
                          : 'bg-amber-200/70 text-amber-950'
                      }`}
                    >
                      {wordsLearnedTodayCount} từ
                    </span>
                  )}
                </button>
              </div>

              {/* Quiz Mode Selector */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setQuizMode('hanzi-to-meaning')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    quizMode === 'hanzi-to-meaning'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Chữ → Nghĩa
                </button>

                <button
                  onClick={() => setQuizMode('audio-to-hanzi')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    quizMode === 'audio-to-hanzi'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" /> Nghe → Chữ
                </button>

                <button
                  onClick={() => setQuizMode('meaning-to-hanzi')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    quizMode === 'meaning-to-hanzi'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" /> Nghĩa → Chữ
                </button>
              </div>
            </div>

            {pausedState && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-xs font-bold text-amber-950">
                    Tiến độ làm dở: Bài Ôn Tập {pausedState.batchIdx + 1} (Câu {pausedState.currentIdx + 1}/{pausedState.questions.length} · {pausedState.score} đúng)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartOrResumeBatch(pausedState.batchIdx, false)}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-sm flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" /> Tiếp tục câu {pausedState.currentIdx + 1}
                  </button>
                  <button
                    onClick={() => {
                      setPausedState(null);
                      try {
                        localStorage.removeItem('formosa_paused_quiz_batch_v1');
                      } catch {
                        // ignore
                      }
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline px-1"
                  >
                    Hủy bài dở
                  </button>
                </div>
              </div>
            )}

            {reviewBatches.length === 0 ? (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                {wordsLearnedTodayCount > 0 && !includeTodayNewWords ? (
                  <>
                    <h4 className="text-base font-bold text-slate-900">
                      Bạn có {wordsLearnedTodayCount} từ mới học hôm nay đang được để dành cho ngày mai!
                    </h4>
                    <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                      Bạn đang bật chế độ <strong>&quot;Chỉ ôn từ của hôm trước trở về trước&quot;</strong> để kiểm tra trí nhớ qua đêm. Nếu muốn ôn tập ngay {wordsLearnedTodayCount} từ vừa học hôm nay, bạn chỉ cần bấm nút bên dưới.
                    </p>
                    <div className="pt-1">
                      <button
                        onClick={() => setIncludeTodayNewWords(true)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                      >
                        Bật ôn tập ngay {wordsLearnedTodayCount} từ mới hôm nay →
                      </button>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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

                  const isPausedHere =
                    pausedState &&
                    pausedState.batchIdx === idx &&
                    pausedState.dateStr === todayStr &&
                    !isDone;

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border p-4 flex flex-col justify-between transition ${
                        isDone
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : isPausedHere
                          ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 shadow-sm'
                          : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-emerald-400'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : isPausedHere
                                ? 'bg-amber-500 text-slate-950 font-extrabold'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            Bài Ôn Tập {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {batch.length} từ
                          </span>
                        </div>

                        <p className="font-tc text-sm font-bold text-slate-800 truncate">
                          {sampleWords}...
                        </p>

                        {isPausedHere ? (
                          <div className="text-[11px] text-amber-900 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Đang làm dở: Câu {pausedState.currentIdx + 1}/{batch.length} ({pausedState.score} đúng)
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 font-medium">
                            Từ {startNum}–{endNum}
                          </div>
                        )}
                      </div>

                      {isPausedHere ? (
                        <div className="flex items-center gap-1.5 mt-3">
                          <button
                            onClick={() => handleStartOrResumeBatch(idx, false)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm"
                          >
                            <Play className="w-3.5 h-3.5" /> Tiếp tục câu {pausedState.currentIdx + 1} →
                          </button>
                          <button
                            onClick={() => handleStartOrResumeBatch(idx, true)}
                            className="px-2.5 py-2 rounded-xl text-xs font-semibold transition bg-slate-100 hover:bg-slate-200 text-slate-600"
                            title="Làm lại từ câu 1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartOrResumeBatch(idx, isDone)}
                          className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            isDone
                              ? 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5" />
                          {isDone ? 'Đã hoàn thành ✓ (Ôn lại)' : 'Bắt đầu ôn bài này →'}
                        </button>
                      )}
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

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Tiến độ hôm nay:</span>
                  <span className="text-emerald-700 font-extrabold">
                    {dailyPlan.completedBatchIndices.length} / {reviewBatches.length} bài ({Math.min(100, Math.round((dailyPlan.completedBatchIndices.length / Math.max(1, reviewBatches.length)) * 100))}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Độ chăm chỉ tuần này:</span>
                  <span className="text-amber-600 font-extrabold text-sm">
                    {diligenceData.weeklyRate}% 🔥
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {safeBatchIdx + 1 < reviewBatches.length && (
                  <button
                    onClick={() => handleStartOrResumeBatch(safeBatchIdx + 1, true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition shadow-sm"
                  >
                    Sang Bài Ôn Tập {safeBatchIdx + 2} →
                  </button>
                )}

                <button
                  onClick={() => handleStartOrResumeBatch(safeBatchIdx, true)}
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
                    onClick={handleExitQuiz}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-bold transition shadow-sm"
                    title="Dừng làm bài và quay lại danh sách bài ôn"
                  >
                    <X className="w-3.5 h-3.5" /> Thoát ra
                  </button>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Bài Ôn {safeBatchIdx + 1} · Câu {currentIdx + 1} /{' '}
                    {currentBatchQuestions.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {combo >= 2 && (
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 animate-bounce">
                      🔥 Combo x{combo}!
                    </span>
                  )}
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Đúng: {score}/{currentBatchQuestions.length}
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
                          {/* Chỉ hiển thị phiên âm Pinyin/Chú âm SAU KHI người học đã bấm chọn đáp án để tránh nhìn Pinyin đoán chữ */}
                          {selectedOptionId && (
                            <span className="text-xs text-slate-500">
                              ({opt.pinyin} · <span className="font-tc">{opt.zhuyin}</span>)
                            </span>
                          )}
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
            updateRewardAndSync((prev) => ({
              ...prev,
              totalPoints: prev.totalPoints + 200,
            }));
          }}
        />
      )}
    </div>
  );
};
