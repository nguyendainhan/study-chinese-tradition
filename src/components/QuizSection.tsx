import React, { useState, useEffect, useMemo } from 'react';
import { VocabItem, TrackId } from '../data/courseData';
import { Tocfl8000Word, TocflLevelMeta } from './Tocfl8000StudySection';
import { LevelCertificationModal } from './LevelCertificationModal';
import {
  LevelCertificationRecord,
  RewardStats,
  WordReviewStat,
  DailyProgressState,
  BatchScoreRecord,
  SRSRating,
  calculateNextSRS,
  getSRSPredictedInterval,
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
  Coins,
  Star,
  CheckSquare,
  Play,
  Gift,
  ShieldCheck,
  Award,
  TrendingUp,
  X,
  History,
  Keyboard,
  Shuffle,
  AlertTriangle,
  Target,
} from 'lucide-react';
import { isVietnameseMeaningMatch } from '../utils/vietnameseMatch';

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

type QuizMode =
  | 'hanzi-to-meaning'
  | 'audio-to-hanzi'
  | 'meaning-to-hanzi'
  | 'type-vietnamese'
  | 'type-hanzi'
  | 'mixed';

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
    let savedTomorrowTarget: number | undefined;
    let savedBatchSize = 25;
    try {
      const saved = localStorage.getItem('formosa_daily_review_plan_v2');
      if (saved) {
        const parsed: DailyProgressState = JSON.parse(saved);
        if (parsed.dateStr === getTodayStr()) {
          return parsed;
        }
        // Sang ngày mới: Nạp mục tiêu mà người dùng đã lên kế hoạch cho ngày hôm nay từ hôm qua
        savedTomorrowTarget = parsed.tomorrowTargetWordsCount || parsed.targetWordsCount;
        savedBatchSize = parsed.batchSize || 25;
      }
    } catch {
      // ignore
    }

    const carriedTarget =
      savedTomorrowTarget ||
      userDailyPlan?.tomorrowTargetWordsCount ||
      userDailyPlan?.targetWordsCount ||
      200;

    return {
      dateStr: getTodayStr(),
      targetWordsCount: carriedTarget,
      batchSize: savedBatchSize,
      completedBatchIndices: [],
      dailyBonusClaimed: false,
      wordsReviewedToday: 0,
      tomorrowTargetWordsCount: carriedTarget,
      batchScores: {},
      todayWrongWordIds: [],
      todayCorrectCount: 0,
      todayTotalAnswered: 0,
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
  const [isReviewingMistakes, setIsReviewingMistakes] = useState<boolean>(false);
  const [currentBatchWrongWordIds, setCurrentBatchWrongWordIds] = useState<string[]>([]);
  const batchWrongWordsRef = React.useRef<string[]>([]);
  const [currentQuestionRating, setCurrentQuestionRating] = useState<SRSRating | null>(null);
  const [showBountyBoard, setShowBountyBoard] = useState<boolean>(true);
  const questionBaselineStatRef = React.useRef<{ id: string; stat: WordReviewStat | undefined } | null>(null);

  // Gõ nghĩa tiếng Việt & Gõ chữ Hán state
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [isTypingSubmitted, setIsTypingSubmitted] = useState<boolean>(false);
  const [typingResult, setTypingResult] = useState<{ isMatch: boolean; matchedCandidate?: string } | null>(null);
  const [showTypingHint, setShowTypingHint] = useState<boolean>(false);
  const typingInputRef = React.useRef<HTMLInputElement | null>(null);

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

  // SRS Statistics of learned words pool according to the Spaced Repetition Forgetting Curve
  const srsStatsSummary = useMemo(() => {
    let dueCount = 0;
    let learningCount = 0;
    let graduatedCount = 0;

    for (const w of learnedWordsPool) {
      const stat = reviewStats[w.id];
      const isDue = !stat || !stat.nextReviewDate || stat.nextReviewDate <= todayStr;
      if (isDue) {
        dueCount++;
      } else if ((stat.intervalDays || 1) >= 21) {
        graduatedCount++;
      } else {
        learningCount++;
      }
    }

    return {
      dueCount,
      learningCount,
      graduatedCount,
      totalLearned: learnedWordsPool.length,
    };
  }, [learnedWordsPool, reviewStats, todayStr]);

  // Thuật toán SRS (Spaced Repetition System) chuẩn kết hợp đường cong quên lãng Ebbinghaus:
  // 1. Phân loại từ thành nhóm "Đến hạn ôn hôm nay" (due) và "Chưa đến hạn" (non-due)
  // 2. Nhóm đến hạn ưu tiên: Quá hạn sâu nhất -> Hay sai (lapses) -> Khó (easeFactor thấp) -> Lần ôn cũ nhất
  // 3. Tự động lấy toàn bộ từ đến hạn (hoặc giới hạn theo mục tiêu nếu người dùng đặt trần)
  // 4. Nếu số từ đến hạn ít hơn mục tiêu, tự động bổ sung từ nhóm sắp đến hạn nhất để ôn tăng cường (cram review)
  const prioritizedDailyWords = useMemo(() => {
    const dueWords: Tocfl8000Word[] = [];
    const nonDueWords: Tocfl8000Word[] = [];

    for (const w of learnedWordsPool) {
      const stat = reviewStats[w.id];
      const isDue = !stat || !stat.nextReviewDate || stat.nextReviewDate <= todayStr;
      if (isDue) {
        dueWords.push(w);
      } else {
        nonDueWords.push(w);
      }
    }

    dueWords.sort((a, b) => {
      const statA = reviewStats[a.id];
      const statB = reviewStats[b.id];

      // 1. Quá hạn sâu hơn lên trước (hoặc chưa bao giờ ôn)
      const dateA = statA?.nextReviewDate || '1970-01-01';
      const dateB = statB?.nextReviewDate || '1970-01-01';
      if (dateA !== dateB) return dateA.localeCompare(dateB);

      // 2. Tỷ lệ sai nhiều hơn lên trước
      const wrongDiffA = statA ? statA.wrongCount * 2 - statA.correctCount : 2;
      const wrongDiffB = statB ? statB.wrongCount * 2 - statB.correctCount : 2;
      if (wrongDiffA !== wrongDiffB) return wrongDiffB - wrongDiffA;

      // 3. Độ khó (Ease factor) thấp hơn lên trước
      const easeA = statA?.easeFactor || 2.5;
      const easeB = statB?.easeFactor || 2.5;
      if (easeA !== easeB) return easeA - easeB;

      // 4. Lần ôn cũ nhất lên trước
      const timeA = statA ? statA.lastReviewed : 0;
      const timeB = statB ? statB.lastReviewed : 0;
      return timeA - timeB;
    });

    nonDueWords.sort((a, b) => {
      const statA = reviewStats[a.id];
      const statB = reviewStats[b.id];
      const dateA = statA?.nextReviewDate || '9999-99-99';
      const dateB = statB?.nextReviewDate || '9999-99-99';
      return dateA.localeCompare(dateB);
    });

    const targetPool = [...dueWords, ...nonDueWords];
    const effectiveTarget = Math.min(dailyPlan.targetWordsCount, targetPool.length);
    const topWords = targetPool.slice(0, effectiveTarget);
    const seed = `${dailyPlan.dateStr}_srs_pool_${topWords.length}`;
    return shuffleWordsWithDispersion(topWords, words, seed);
    // Notice: Do NOT include reviewStats in deps while isPlayingQuiz to avoid shuffling batches during testing!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learnedWordsPool, dailyPlan.targetWordsCount, dailyPlan.dateStr, words, isPlayingQuiz ? 0 : reviewStats, todayStr]);

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
  const isCurrentQuestionAnswered = selectedOptionId !== null || isTypingSubmitted;
  if (
    currentQuestion &&
    (!questionBaselineStatRef.current ||
      questionBaselineStatRef.current.id !== currentQuestion.id ||
      !isCurrentQuestionAnswered)
  ) {
    questionBaselineStatRef.current = {
      id: currentQuestion.id,
      stat: reviewStats[currentQuestion.id],
    };
  }
  const currentWordBaselineStat =
    currentQuestion &&
    questionBaselineStatRef.current &&
    questionBaselineStatRef.current.id === currentQuestion.id
      ? questionBaselineStatRef.current?.stat
      : currentQuestion
      ? reviewStats[currentQuestion.id]
      : undefined;

  const hardIntervalDays = useMemo(
    () => getSRSPredictedInterval(currentWordBaselineStat, 'hard'),
    [currentWordBaselineStat]
  );
  const goodIntervalDays = useMemo(
    () => getSRSPredictedInterval(currentWordBaselineStat, 'good'),
    [currentWordBaselineStat]
  );
  const easyIntervalDays = useMemo(
    () => getSRSPredictedInterval(currentWordBaselineStat, 'easy'),
    [currentWordBaselineStat]
  );

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
    if (w.vietnamese && w.vietnamese.trim()) {
      return w.vietnamese.trim();
    }
    return w.english || (w.hanViet ? `Hán Việt: ${w.hanViet.toUpperCase()}` : '—');
  };

  // Xác định chế độ của câu hỏi hiện tại:
  // Nếu người dùng chọn 'mixed' (hỗn hợp), hệ thống luân phiên công bằng cả 5 dạng:
  // 0: Chữ → Nghĩa (Trắc nghiệm)
  // 1: Nghe → Chữ (Nghe giọng Đài Loan chọn chữ)
  // 2: Chữ → Gõ nghĩa TV (Nhập bàn phím tự luận)
  // 3: Nghĩa → Chữ (Trắc nghiệm)
  // 4: Nghĩa/Nghe → Gõ chữ Phồn thể (Tự luận gõ tiếng Trung thực chiến)
  const effectiveMode:
    | 'hanzi-to-meaning'
    | 'audio-to-hanzi'
    | 'meaning-to-hanzi'
    | 'type-vietnamese'
    | 'type-hanzi' = useMemo(() => {
    if (quizMode !== 'mixed') return quizMode;
    const modes: (
      | 'hanzi-to-meaning'
      | 'audio-to-hanzi'
      | 'type-vietnamese'
      | 'meaning-to-hanzi'
      | 'type-hanzi'
    )[] = [
      'hanzi-to-meaning',
      'audio-to-hanzi',
      'type-vietnamese',
      'meaning-to-hanzi',
      'type-hanzi',
    ];
    return modes[currentIdx % modes.length];
  }, [quizMode, currentIdx]);

  useEffect(() => {
    if (
      isPlayingQuiz &&
      effectiveMode === 'audio-to-hanzi' &&
      currentQuestion &&
      !finishedBatch
    ) {
      speakTaiwanMandarin(currentQuestion.traditional, 0.88);
    }
  }, [isPlayingQuiz, effectiveMode, currentQuestion, finishedBatch]);

  // Tự động focus ô nhập liệu khi ở chế độ Gõ tự luận (tiếng Việt hoặc tiếng Trung)
  useEffect(() => {
    if (
      isPlayingQuiz &&
      (effectiveMode === 'type-vietnamese' || effectiveMode === 'type-hanzi') &&
      !finishedBatch
    ) {
      setTypedAnswer('');
      setIsTypingSubmitted(false);
      setTypingResult(null);
      setShowTypingHint(false);
      const timer = setTimeout(() => {
        typingInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, isPlayingQuiz, effectiveMode, finishedBatch]);

  // Open Level Certification Exam when user clicks a level to confirm they mastered it
  const handleClickCertifyLevel = (levelCode: string) => {
    setCertifyingLevelCode(levelCode);
  };

  const handleSetDailyTarget = (
    targetCount: number,
    bSize: number = 25,
    autoSRSMode: boolean = false
  ) => {
    if (
      dailyPlan.targetWordsCount === targetCount &&
      dailyPlan.batchSize === bSize &&
      dailyPlan.autoSRSMode === autoSRSMode
    ) {
      return; // Đang ở mục tiêu này rồi, không thay đổi hay xóa kết quả
    }

    const newTotalBatches = Math.max(1, Math.ceil(targetCount / bSize));
    // Giữ nguyên toàn bộ các bài ôn đã hoàn thành trước đó (không xóa mất bài đã làm)
    const preservedCompleted = (dailyPlan.completedBatchIndices || []).filter(
      (idx) => idx < newTotalBatches
    );
    const isAllDoneNow = preservedCompleted.length >= newTotalBatches;
    const todayRate = Math.min(100, Math.round((preservedCompleted.length / newTotalBatches) * 100));

    updateDailyPlanAndSync((prev) => ({
      ...prev,
      targetWordsCount: targetCount,
      batchSize: bSize,
      autoSRSMode,
      completedBatchIndices: preservedCompleted,
      dailyBonusClaimed: isAllDoneNow ? prev.dailyBonusClaimed : false,
    }));

    // Cập nhật lại độ chăm chỉ theo số bài đã hoàn thành để không bị mất điểm chăm chỉ
    updateRewardAndSync((prev) => {
      const nextHistory = {
        ...(prev.diligenceHistory || {}),
        [todayStr]: {
          completedBatches: preservedCompleted.length,
          totalBatches: newTotalBatches,
          rate: todayRate,
        },
      };
      return {
        ...prev,
        diligenceHistory: nextHistory,
      };
    });

    setActiveBatchIdx(0);
    setIsPlayingQuiz(false);
  };

  const handleSetTomorrowTarget = (targetCount: number) => {
    updateDailyPlanAndSync((prev) => ({
      ...prev,
      tomorrowTargetWordsCount: targetCount,
    }));
  };

  const handleStartReviewMistakes = (targetWordIds?: string[]) => {
    const idsToReview = targetWordIds || dailyPlan.todayWrongWordIds || [];
    if (idsToReview.length === 0) return;

    const mistakeQuestions = words.filter((w) => idsToReview.includes(w.id));
    if (mistakeQuestions.length === 0) return;

    // Shuffle questions so user gets varied testing order
    const shuffled = [...mistakeQuestions].sort(() => Math.random() - 0.5);

    setIsReviewingMistakes(true);
    questionBaselineStatRef.current = null;
    batchWrongWordsRef.current = [];
    setCurrentBatchWrongWordIds([]);
    setCurrentQuestionRating(null);
    setActiveBatchQuestions(shuffled);
    setActiveBatchIdx(-1);
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setTypedAnswer('');
    setIsTypingSubmitted(false);
    setTypingResult(null);
    setScore(0);
    setCombo(0);
    setSessionPointsEarned(0);
    setFinishedBatch(false);
    setIsPlayingQuiz(true);
  };

  const handleStartOrResumeBatch = (batchIdx: number, forceRestart: boolean = false) => {
    setIsReviewingMistakes(false);
    questionBaselineStatRef.current = null;
    batchWrongWordsRef.current = [];
    setCurrentBatchWrongWordIds([]);
    setCurrentQuestionRating(null);

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
      setTypedAnswer('');
      setIsTypingSubmitted(false);
      setTypingResult(null);
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
    setTypedAnswer('');
    setIsTypingSubmitted(false);
    setTypingResult(null);
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
    if (isReviewingMistakes) {
      setIsPlayingQuiz(false);
      setIsReviewingMistakes(false);
      return;
    }

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

    if (!isCorrect) {
      batchWrongWordsRef.current = Array.from(new Set([...batchWrongWordsRef.current, currentQuestion.id]));
      setCurrentBatchWrongWordIds(batchWrongWordsRef.current);
    }

    // Update Daily Accuracy counters and Mistake list
    updateDailyPlanAndSync((prev) => {
      const currentWrongList = prev.todayWrongWordIds || [];
      const nextWrong = isCorrect
        ? currentWrongList.filter((id) => id !== currentQuestion.id)
        : Array.from(new Set([...currentWrongList, currentQuestion.id]));
      return {
        ...prev,
        todayCorrectCount: (prev.todayCorrectCount || 0) + (isCorrect ? 1 : 0),
        todayTotalAnswered: (prev.todayTotalAnswered || 0) + 1,
        todayWrongWordIds: nextWrong,
      };
    });

    // Update SRS history using SM-2 Spaced Repetition algorithm and sync to Supabase
    const initialRating: SRSRating = isCorrect ? 'good' : 'again';
    setCurrentQuestionRating(initialRating);
    const hasBaselineSnapshot = Boolean(
      questionBaselineStatRef.current && questionBaselineStatRef.current.id === currentQuestion.id
    );
    const baselineStat = hasBaselineSnapshot ? questionBaselineStatRef.current?.stat : undefined;
    updateReviewAndSync((prev) => {
      const base = hasBaselineSnapshot ? baselineStat : prev[currentQuestion.id];
      const nextStat = calculateNextSRS(base, initialRating, todayStr);
      return {
        ...prev,
        [currentQuestion.id]: nextStat,
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
    if (!isReviewingMistakes) {
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
    }
  };

  const handleCheckTypedAnswer = () => {
    if (isTypingSubmitted || !currentQuestion || !typedAnswer.trim()) return;

    let isCorrect = false;
    let matchResult: { isMatch: boolean; matchedCandidate?: string } = { isMatch: false };

    if (effectiveMode === 'type-hanzi') {
      const cleanInput = typedAnswer.trim().replace(/[\s\p{P}]/gu, '');
      const cleanTrad = currentQuestion.traditional.replace(/[\s\p{P}]/gu, '');
      const cleanRaw = (currentQuestion.rawWord || '').replace(/[\s\p{P}]/gu, '');
      const cleanSimp = (currentQuestion.simplified || '').replace(/[\s\p{P}]/gu, '');

      isCorrect =
        cleanInput === cleanTrad ||
        cleanInput === cleanRaw ||
        (cleanSimp.length > 0 && cleanInput === cleanSimp);

      matchResult = {
        isMatch: isCorrect,
        matchedCandidate: isCorrect ? currentQuestion.traditional : undefined,
      };
    } else {
      const targetMeaning = currentQuestion.vietnamese || getDisplayMeaning(currentQuestion);
      matchResult = isVietnameseMeaningMatch(typedAnswer, targetMeaning);
      // Double check: If not match, also test against Han-Viet meaning if available
      if (!matchResult.isMatch && currentQuestion.hanViet) {
        const hanVietMatch = isVietnameseMeaningMatch(typedAnswer, currentQuestion.hanViet);
        if (hanVietMatch.isMatch) {
          matchResult = hanVietMatch;
        }
      }
      isCorrect = matchResult.isMatch;
    }

    setIsTypingSubmitted(true);
    setTypingResult(matchResult);
    setSelectedOptionId(isCorrect ? currentQuestion.id : '__WRONG_TYPING__');

    if (!isCorrect) {
      batchWrongWordsRef.current = Array.from(new Set([...batchWrongWordsRef.current, currentQuestion.id]));
      setCurrentBatchWrongWordIds(batchWrongWordsRef.current);
    }

    // Update Daily Accuracy counters and Mistake list
    updateDailyPlanAndSync((prev) => {
      const currentWrongList = prev.todayWrongWordIds || [];
      const nextWrong = isCorrect
        ? currentWrongList.filter((id) => id !== currentQuestion.id)
        : Array.from(new Set([...currentWrongList, currentQuestion.id]));
      return {
        ...prev,
        todayCorrectCount: (prev.todayCorrectCount || 0) + (isCorrect ? 1 : 0),
        todayTotalAnswered: (prev.todayTotalAnswered || 0) + 1,
        todayWrongWordIds: nextWrong,
      };
    });

    // Update SRS history using SM-2 Spaced Repetition algorithm and sync to Supabase
    const initialRating: SRSRating = isCorrect ? 'good' : 'again';
    setCurrentQuestionRating(initialRating);
    const hasBaselineSnapshot = Boolean(
      questionBaselineStatRef.current && questionBaselineStatRef.current.id === currentQuestion.id
    );
    const baselineStat = hasBaselineSnapshot ? questionBaselineStatRef.current?.stat : undefined;
    updateReviewAndSync((prev) => {
      const base = hasBaselineSnapshot ? baselineStat : prev[currentQuestion.id];
      const nextStat = calculateNextSRS(base, initialRating, todayStr);
      return {
        ...prev,
        [currentQuestion.id]: nextStat,
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

    // Keep paused progress synced
    if (!isReviewingMistakes) {
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
    }
  };

  const handleRateCurrentQuestion = (rating: SRSRating) => {
    if (!currentQuestion) return;
    setCurrentQuestionRating(rating);
    const hasBaselineSnapshot = Boolean(
      questionBaselineStatRef.current && questionBaselineStatRef.current.id === currentQuestion.id
    );
    const baselineStat = hasBaselineSnapshot ? questionBaselineStatRef.current?.stat : undefined;
    updateReviewAndSync((prev) => {
      const base = hasBaselineSnapshot ? baselineStat : prev[currentQuestion.id];
      const nextStat = calculateNextSRS(base, rating, todayStr);
      return {
        ...prev,
        [currentQuestion.id]: nextStat,
      };
    });
  };

  const handleNextQuestion = () => {
    questionBaselineStatRef.current = null;
    setTypedAnswer('');
    setIsTypingSubmitted(false);
    setTypingResult(null);
    setShowTypingHint(false);
    setCurrentQuestionRating(null);
    if (currentIdx + 1 < currentBatchQuestions.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelectedOptionId(null);
      if (!isReviewingMistakes) {
        setPausedState({
          batchIdx: activeBatchIdx,
          currentIdx: nextIdx,
          score,
          combo,
          questions: activeBatchQuestions,
          quizMode,
          dateStr: todayStr,
        });
      }
    } else {
      // Completed this batch or mistake review!
      if (!isReviewingMistakes) {
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
          batchScores: {
            ...(prev.batchScores || {}),
            [safeBatchIdx]: {
              correct: score,
              total: currentBatchQuestions.length,
              wrongWordIds: [...batchWrongWordsRef.current],
            },
          },
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
          const earnedExp = 50 + (isAllDoneNow && !dailyPlan.dailyBonusClaimed ? 200 : 0);
          const earnedCoins = 10 + (isAllDoneNow && !dailyPlan.dailyBonusClaimed ? 30 : 0);
          const currentExpBase = prev.exp !== undefined ? prev.exp : Math.max(100, (masteredIds?.length || 0) * 5);
          const currentCoinsBase = prev.starCoins !== undefined ? prev.starCoins : Math.max(10, Math.floor((masteredIds?.length || 0) / 2));
          return {
            ...prev,
            totalPoints: prev.totalPoints + 50 + (isAllDoneNow && !dailyPlan.dailyBonusClaimed ? 300 : 0),
            exp: currentExpBase + earnedExp,
            starCoins: currentCoinsBase + earnedCoins,
            streakDays: isNewStreakDay ? prev.streakDays + 1 : prev.streakDays,
            lastCompletedDate: isAllDoneNow ? todayStr : prev.lastCompletedDate,
            totalSessionsCompleted: prev.totalSessionsCompleted + 1,
            diligenceHistory: nextHistory,
          };
        });
      }

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

  const todayTotalAnswered = dailyPlan.todayTotalAnswered || 0;
  const todayCorrectCount = dailyPlan.todayCorrectCount || 0;
  const todayWrongCount = Math.max(0, todayTotalAnswered - todayCorrectCount);
  const todayAccuracyRate =
    todayTotalAnswered > 0 ? Math.round((todayCorrectCount / todayTotalAnswered) * 100) : null;

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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="bg-white/10 border border-white/15 rounded-2xl px-3 sm:px-4 py-2.5 text-center min-w-[110px]">
              <div className="text-[10px] text-amber-300 font-bold uppercase flex items-center justify-center gap-1 truncate">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" /> Chăm chỉ tuần
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                {diligenceData.weeklyRate}%
              </div>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl px-3 sm:px-4 py-2.5 text-center min-w-[110px]">
              <div className="text-[10px] text-emerald-300 font-bold uppercase flex items-center justify-center gap-1 truncate">
                <CalendarCheck2 className="w-3.5 h-3.5 shrink-0" /> Bài hôm nay
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                {dailyPlan.completedBatchIndices.length}/{reviewBatches.length}
              </div>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl px-3 sm:px-4 py-2.5 text-center col-span-2 sm:col-span-1 min-w-[125px]">
              <div className="text-[10px] text-sky-300 font-bold uppercase flex items-center justify-center gap-1 truncate">
                <Target className="w-3.5 h-3.5 shrink-0" /> Độ chính xác
              </div>
              <div
                className={`text-2xl sm:text-3xl font-extrabold mt-0.5 ${
                  todayAccuracyRate === null
                    ? 'text-white/60'
                    : todayAccuracyRate >= 80
                    ? 'text-emerald-400'
                    : todayAccuracyRate >= 50
                    ? 'text-amber-300'
                    : 'text-rose-400'
                }`}
              >
                {todayAccuracyRate !== null ? `${todayAccuracyRate}%` : '--%'}
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5 truncate">
                {todayTotalAnswered > 0
                  ? `${todayCorrectCount} đúng · ${todayWrongCount} sai`
                  : 'Chưa làm câu nào'}
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
          <div className="mt-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-slate-950" />
                <span className="font-extrabold text-sm sm:text-base">
                  Xuất sắc! Hôm nay bạn đã hoàn thành 100% mục tiêu bài ôn tập!
                </span>
              </div>
              <span className="text-xs font-extrabold uppercase bg-slate-950 text-amber-300 px-3 py-1 rounded-xl">
                ✓ Đạt 100%
              </span>
            </div>

            {/* Choose Target for Tomorrow */}
            <div className="pt-2 border-t border-slate-950/15 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Đặt mục tiêu cho ngày mai:</span>
                <span className="font-extrabold text-slate-950 underline">
                  {dailyPlan.tomorrowTargetWordsCount || dailyPlan.targetWordsCount} từ
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[50, 100, 200, 300, 500].map((tCount) => {
                  const isTomorrowTarget =
                    (dailyPlan.tomorrowTargetWordsCount || dailyPlan.targetWordsCount) === tCount;
                  return (
                    <button
                      key={tCount}
                      onClick={() => handleSetTomorrowTarget(tCount)}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold transition border ${
                        isTomorrowTarget
                          ? 'bg-slate-950 text-amber-300 border-slate-950 shadow-sm'
                          : 'bg-white/80 hover:bg-white text-slate-900 border-slate-950/20'
                      }`}
                    >
                      {tCount} từ
                    </button>
                  );
                })}
              </div>
            </div>
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

            {/* Right: Daily Review Target Presets & SRS Smart Status */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  2. Mục tiêu ôn tập hôm nay (Thuật toán SRS):
                </h3>
              </div>

              {/* 3-Pill SRS Status Indicator */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                <div className="text-center p-1.5 rounded-xl bg-white border border-rose-200 shadow-xs">
                  <div className="text-[10px] font-bold text-rose-700 uppercase flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Cần ôn hôm nay
                  </div>
                  <div className="text-base font-extrabold text-rose-900 mt-0.5">
                    {srsStatsSummary.dueCount} từ
                  </div>
                </div>

                <div className="text-center p-1.5 rounded-xl bg-white border border-amber-200 shadow-xs">
                  <div className="text-[10px] font-bold text-amber-700 uppercase flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Đang củng cố
                  </div>
                  <div className="text-base font-extrabold text-amber-900 mt-0.5">
                    {srsStatsSummary.learningCount} từ
                  </div>
                </div>

                <div className="text-center p-1.5 rounded-xl bg-white border border-emerald-200 shadow-xs">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Đã nhớ sâu
                  </div>
                  <div className="text-base font-extrabold text-emerald-900 mt-0.5">
                    {srsStatsSummary.graduatedCount} từ
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* Auto SRS Option (Recommended) */}
                <button
                  type="button"
                  onClick={() =>
                    handleSetDailyTarget(
                      Math.max(1, srsStatsSummary.dueCount),
                      25,
                      true
                    )
                  }
                  className={`col-span-2 sm:col-span-3 p-3 rounded-2xl border text-left transition flex items-center justify-between gap-3 ${
                    dailyPlan.autoSRSMode || dailyPlan.targetWordsCount === srsStatsSummary.dueCount
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/30'
                      : 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-xs flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-300" />
                      ⚡ Lộ trình SRS Tự động ({srsStatsSummary.dueCount} từ đến hạn)
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">
                        Khuyên dùng
                      </span>
                    </div>
                    <div
                      className={`text-[11px] ${
                        dailyPlan.autoSRSMode || dailyPlan.targetWordsCount === srsStatsSummary.dueCount
                          ? 'text-emerald-100'
                          : 'text-emerald-700'
                      }`}
                    >
                      {srsStatsSummary.dueCount > 0
                        ? `Tự động đưa ${srsStatsSummary.dueCount} từ đến hạn vào các Card ôn tập hôm nay`
                        : 'Tuyệt vời! Bạn đã hoàn thành toàn bộ từ đến hạn hôm nay!'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-sm">
                      {Math.ceil(srsStatsSummary.dueCount / 25) || 1} bài
                    </div>
                    <div className="text-[10px] opacity-80">25 từ/bài</div>
                  </div>
                </button>

                {[
                  { count: 50, batch: 25, label: '50 từ', desc: '2 bài × 25 từ' },
                  { count: 100, batch: 25, label: '100 từ', desc: '4 bài × 25 từ' },
                  { count: 200, batch: 25, label: '200 từ', desc: '8 bài × 25 từ' },
                  { count: 350, batch: 25, label: '350 từ', desc: '14 bài × 25 từ' },
                  { count: 500, batch: 25, label: '500 từ', desc: '20 bài × 25 từ' },
                  {
                    count: Math.max(25, learnedWordsPool.length),
                    batch: 25,
                    label: 'Tất cả kho',
                    desc: `${learnedWordsPool.length} từ`,
                  },
                ].map((preset, idx) => {
                  const isSelected =
                    !dailyPlan.autoSRSMode && dailyPlan.targetWordsCount === preset.count;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSetDailyTarget(preset.count, preset.batch, false)}
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

          {/* BOUNTY QUEST BOARD (BẢNG NHIỆM VỤ SĂN THƯỞNG HÀNG NGÀY) */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/30 rounded-3xl p-5 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  📜
                </div>
                <div>
                  <h4 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
                    BẢNG NHIỆM VỤ SĂN THƯỞNG (BOUNTY BOARD)
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                      Hằng Ngày
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Hoàn thành các nhiệm vụ công hội để tích lũy Nguyên Lực (EXP) và Tinh Tệ (Credits)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBountyBoard((prev) => !prev)}
                className="text-xs text-cyan-300 hover:text-cyan-200 font-bold underline px-2 py-1"
              >
                {showBountyBoard ? 'Thu gọn' : 'Mở rộng'}
              </button>
            </div>

            {showBountyBoard && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Quest F */}
                {(() => {
                  const isDone = dailyPlan.completedBatchIndices.length >= 1;
                  return (
                    <div
                      className={`p-3.5 rounded-2xl border transition relative overflow-hidden ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                          : 'bg-black/30 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          Quest F · Học Đồ
                        </span>
                        {isDone ? (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {dailyPlan.completedBatchIndices.length}/1 bài
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-white leading-snug">
                        Hoàn thành 1 Card bài ôn
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Làm xong ít nhất 25 từ ôn tập hôm nay
                      </p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 text-[11px] font-bold">
                        <span className="text-cyan-300 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-cyan-400" /> +50 EXP
                        </span>
                        <span className="text-amber-300 flex items-center gap-1">
                          <Coins className="w-3 h-3 text-amber-400" /> +10 🪙
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Quest E */}
                {(() => {
                  const isDone =
                    todayAccuracyRate !== null &&
                    todayAccuracyRate >= 80 &&
                    todayTotalAnswered >= 15;
                  return (
                    <div
                      className={`p-3.5 rounded-2xl border transition relative overflow-hidden ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                          : 'bg-black/30 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          Quest E · Vũ Giả
                        </span>
                        {isDone ? (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {todayTotalAnswered >= 15 ? `${todayAccuracyRate}%` : `${todayTotalAnswered}/15 câu`}
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-white leading-snug">
                        Độ chính xác chuẩn xác &ge; 80%
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Đạt tỷ lệ đúng cao trên tối thiểu 15 câu
                      </p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 text-[11px] font-bold">
                        <span className="text-cyan-300 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-cyan-400" /> +80 EXP
                        </span>
                        <span className="text-amber-300 flex items-center gap-1">
                          <Coins className="w-3 h-3 text-amber-400" /> +15 🪙
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Quest D */}
                {(() => {
                  const isDone = quizMode === 'type-hanzi' || quizMode === 'mixed';
                  return (
                    <div
                      className={`p-3.5 rounded-2xl border transition relative overflow-hidden ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                          : 'bg-black/30 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          Quest D · Chiến Tướng
                        </span>
                        {isDone ? (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã kích hoạt
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            Chưa chọn
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-white leading-snug">
                        Luyện Gõ Phồn thể / Hỗn hợp
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Chọn chế độ ✍️ Gõ Phồn thể hoặc Hỗn hợp
                      </p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 text-[11px] font-bold">
                        <span className="text-cyan-300 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-cyan-400" /> +100 EXP
                        </span>
                        <span className="text-amber-300 flex items-center gap-1">
                          <Coins className="w-3 h-3 text-amber-400" /> +20 🪙
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Quest C */}
                {(() => {
                  const isDone =
                    reviewBatches.length > 0 &&
                    dailyPlan.completedBatchIndices.length >= reviewBatches.length;
                  return (
                    <div
                      className={`p-3.5 rounded-2xl border transition relative overflow-hidden ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                          : 'bg-black/30 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          Quest C · Chiến Thần
                        </span>
                        {isDone ? (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {dailyPlan.completedBatchIndices.length}/{Math.max(1, reviewBatches.length)} bài
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-white leading-snug">
                        Hoàn thành 100% mục tiêu ngày
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Giải phóng toàn bộ các card bài ôn hôm nay
                      </p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 text-[11px] font-bold">
                        <span className="text-cyan-300 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-cyan-400" /> +200 EXP
                        </span>
                        <span className="text-amber-300 flex items-center gap-1">
                          <Coins className="w-3 h-3 text-amber-400" /> +30 🪙
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
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

                <button
                  onClick={() => setQuizMode('type-vietnamese')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    quizMode === 'type-vietnamese'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" /> Chữ → Gõ nghĩa TV
                </button>

                <button
                  onClick={() => setQuizMode('type-hanzi')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    quizMode === 'type-hanzi'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Nghe phát âm hoặc nhìn nghĩa rồi dùng bàn phím gõ chữ Hán Phồn thể"
                >
                  <Keyboard className="w-3.5 h-3.5 text-rose-300" /> ✍️ Gõ chữ Phồn thể
                </button>

                <button
                  onClick={() => setQuizMode('mixed')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    quizMode === 'mixed'
                      ? 'bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white shadow-sm ring-1 ring-purple-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Bài ôn tổng hợp xen kẽ cả 5 dạng: Chữ→Nghĩa, Nghe→Chữ, Gõ nghĩa TV, Gõ chữ Phồn thể, Nghĩa→Chữ"
                >
                  <Shuffle className="w-3.5 h-3.5" /> 🎲 Hỗn hợp (5 dạng)
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

            {/* MISTAKE REVIEW BANNER */}
            {dailyPlan.todayWrongWordIds && dailyPlan.todayWrongWordIds.length > 0 && (
              <div className="bg-gradient-to-r from-rose-50 via-rose-100/70 to-amber-50 border-2 border-rose-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Kho từ cần khắc phục hôm nay
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-200 text-rose-800">
                        {dailyPlan.todayWrongWordIds.length} từ sai
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Ôn tập chuyên sâu các câu đã trả lời sai hôm nay để củng cố trí nhớ và xóa sạch điểm yếu!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartReviewMistakes()}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Ôn lại {dailyPlan.todayWrongWordIds.length} từ sai ngay →
                </button>
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
                  const batchScore = dailyPlan.batchScores?.[idx];
                  const batchAcc =
                    batchScore && batchScore.total > 0
                      ? Math.round((batchScore.correct / batchScore.total) * 100)
                      : null;
                  const batchWrongCount = batchScore ? Math.max(0, batchScore.total - batchScore.correct) : 0;
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

                        {/* Thanh phần trăm đúng/sai của từng card bài ôn */}
                        {batchScore && batchAcc !== null && (
                          <div className="pt-1.5 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-emerald-700 flex items-center gap-1">
                                <Target className="w-3 h-3 text-emerald-600" />
                                {batchScore.correct}/{batchScore.total} đúng ({batchAcc}%)
                              </span>
                              {batchWrongCount > 0 ? (
                                <span className="text-rose-600 font-extrabold">
                                  {batchWrongCount} sai
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-extrabold">
                                  100% Tuyệt đối!
                                </span>
                              )}
                            </div>
                            {/* Dual-color Accuracy Progress Bar */}
                            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
                              <div
                                className="bg-emerald-500 h-full transition-all duration-300"
                                style={{ width: `${batchAcc}%` }}
                                title={`Đúng: ${batchAcc}%`}
                              />
                              <div
                                className="bg-rose-500 h-full transition-all duration-300"
                                style={{ width: `${100 - batchAcc}%` }}
                                title={`Sai: ${100 - batchAcc}%`}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Nút thao tác bài ôn & nút ôn lại câu sai nếu có */}
                      <div className="space-y-1.5 mt-3">
                        {isPausedHere ? (
                          <div className="flex items-center gap-1.5">
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
                            className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                              isDone
                                ? 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            }`}
                          >
                            <Play className="w-3.5 h-3.5" />
                            {isDone ? 'Đã hoàn thành ✓ (Ôn lại)' : 'Bắt đầu ôn bài này →'}
                          </button>
                        )}

                        {/* Nút ôn lại riêng các câu sai của bài này */}
                        {batchScore && batchScore.wrongWordIds && batchScore.wrongWordIds.length > 0 && (
                          <button
                            onClick={() => handleStartReviewMistakes(batchScore.wrongWordIds)}
                            className="w-full py-1.5 px-2 rounded-xl text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center justify-center gap-1.5"
                            title={`Ôn lại ${batchScore.wrongWordIds.length} từ đã làm sai ở Bài Ôn Tập ${idx + 1}`}
                          >
                            <RotateCcw className="w-3 h-3 text-rose-600" />
                            Ôn lại {batchScore.wrongWordIds.length} câu sai của bài này
                          </button>
                        )}
                      </div>
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
              <div
                className={`w-16 h-16 rounded-3xl ${
                  isReviewingMistakes ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                } flex items-center justify-center mx-auto`}
              >
                {isReviewingMistakes ? <ShieldCheck className="w-8 h-8" /> : <Trophy className="w-8 h-8" />}
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                {isReviewingMistakes
                  ? 'Hoàn thành Ôn Lại Từ Sai! 🎯'
                  : `Hoàn thành Bài Ôn Tập ${safeBatchIdx + 1}! 🎉`}
              </h3>
              <p className="text-slate-600">
                Bạn trả lời đúng{' '}
                <strong className="text-emerald-600 text-2xl">{score}</strong> /{' '}
                <strong>{currentBatchQuestions.length}</strong> từ{' '}
                {currentBatchQuestions.length > 0 && (
                  <span className="font-bold text-slate-800">
                    ({Math.round((score / currentBatchQuestions.length) * 100)}%)
                  </span>
                )}
                .
              </p>

              {/* Phần Thưởng Hệ Thống Thợ Săn & Cảnh Giới Tu Chân */}
              {!isReviewingMistakes && (
                <div className="flex flex-wrap items-center justify-center gap-2.5 py-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-cyan-300 border border-cyan-400/40 text-xs font-bold shadow-sm">
                    <Zap className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                    <span>+50 Nguyên Lực (EXP)</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-amber-300 border border-amber-400/40 text-xs font-bold shadow-sm">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>+10 Tinh Tệ (Credits)</span>
                  </div>
                </div>
              )}

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Tiến độ bài hôm nay:</span>
                  <span className="text-emerald-700 font-extrabold">
                    {dailyPlan.completedBatchIndices.length} / {reviewBatches.length} bài ({Math.min(100, Math.round((dailyPlan.completedBatchIndices.length / Math.max(1, reviewBatches.length)) * 100))}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Độ chính xác chung hôm nay:</span>
                  <span className="text-sky-700 font-extrabold text-sm">
                    {todayAccuracyRate !== null ? `${todayAccuracyRate}%` : '--%'} ({todayCorrectCount} đúng / {todayWrongCount} sai)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Độ chăm chỉ tuần này:</span>
                  <span className="text-amber-600 font-extrabold text-sm">
                    {diligenceData.weeklyRate}% 🔥
                  </span>
                </div>
                {dailyPlan.todayWrongWordIds && dailyPlan.todayWrongWordIds.length > 0 && (
                  <div className="flex items-center justify-between text-xs font-bold text-rose-700 pt-1 border-t border-emerald-200/60">
                    <span>Từ sai cần khắc phục hôm nay:</span>
                    <span className="font-extrabold">
                      {dailyPlan.todayWrongWordIds.length} từ
                    </span>
                  </div>
                )}
              </div>

              {/* Nếu đã hoàn thành tất cả các bài ôn hôm nay, cho phép đặt mục tiêu ngày mai */}
              {!isReviewingMistakes && dailyPlan.completedBatchIndices.length >= reviewBatches.length && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 max-w-md mx-auto text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Đặt mục tiêu cho ngày mai:</span>
                    <strong className="text-amber-800 underline">
                      {dailyPlan.tomorrowTargetWordsCount || dailyPlan.targetWordsCount} từ
                    </strong>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                    {[50, 100, 200, 300, 500].map((tCount) => {
                      const isTomorrowTarget =
                        (dailyPlan.tomorrowTargetWordsCount || dailyPlan.targetWordsCount) === tCount;
                      return (
                        <button
                          key={tCount}
                          onClick={() => handleSetTomorrowTarget(tCount)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                            isTomorrowTarget
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-amber-100'
                          }`}
                        >
                          {tCount} từ
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {/* Nếu đang ở chế độ ôn từ sai và vẫn còn từ sai */}
                {isReviewingMistakes && dailyPlan.todayWrongWordIds && dailyPlan.todayWrongWordIds.length > 0 && (
                  <button
                    onClick={() => handleStartReviewMistakes()}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" /> Tiếp tục ôn {dailyPlan.todayWrongWordIds.length} từ sai còn lại →
                  </button>
                )}

                {/* Nếu vừa xong bài ôn thường và có câu sai ở bài này */}
                {!isReviewingMistakes && currentBatchWrongWordIds.length > 0 && (
                  <button
                    onClick={() => handleStartReviewMistakes(currentBatchWrongWordIds)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs hover:bg-rose-100 transition shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-600" /> Ôn lại {currentBatchWrongWordIds.length} câu sai của bài này ngay
                  </button>
                )}

                {!isReviewingMistakes && safeBatchIdx + 1 < reviewBatches.length && (
                  <button
                    onClick={() => handleStartOrResumeBatch(safeBatchIdx + 1, true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition shadow-sm"
                  >
                    Sang Bài Ôn Tập {safeBatchIdx + 2} →
                  </button>
                )}

                {!isReviewingMistakes && (
                  <button
                    onClick={() => handleStartOrResumeBatch(safeBatchIdx, true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
                  >
                    <RotateCcw className="w-4 h-4" /> Làm lại bài này
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsPlayingQuiz(false);
                    setIsReviewingMistakes(false);
                  }}
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
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border ${
                      isReviewingMistakes
                        ? 'text-rose-800 bg-rose-50 border-rose-200'
                        : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    {isReviewingMistakes
                      ? `🚨 Ôn Từ Sai · Câu ${currentIdx + 1} / ${currentBatchQuestions.length}`
                      : `Bài Ôn ${safeBatchIdx + 1} · Câu ${currentIdx + 1} / ${currentBatchQuestions.length}`}
                  </span>
                  {quizMode === 'mixed' && (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 ${
                        effectiveMode === 'hanzi-to-meaning'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : effectiveMode === 'audio-to-hanzi'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : effectiveMode === 'type-vietnamese'
                          ? 'bg-purple-50 text-purple-800 border-purple-300'
                          : effectiveMode === 'type-hanzi'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                      }`}
                    >
                      {effectiveMode === 'hanzi-to-meaning' && '📖 Chữ → Nghĩa'}
                      {effectiveMode === 'audio-to-hanzi' && '🎧 Nghe → Chữ'}
                      {effectiveMode === 'type-vietnamese' && '⌨️ Gõ nghĩa TV'}
                      {effectiveMode === 'type-hanzi' && '✍️ Gõ chữ Phồn thể'}
                      {effectiveMode === 'meaning-to-hanzi' && '🌐 Nghĩa → Chữ'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {combo >= 2 && (
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 animate-bounce">
                      🔥 Combo x{combo}!
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      isReviewingMistakes
                        ? 'text-rose-800 bg-rose-50 border-rose-200'
                        : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    Đúng: {score}/{currentBatchQuestions.length}
                  </span>
                </div>
              </div>

              {/* Prompt Box */}
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200/80 px-4 space-y-2">
                {effectiveMode === 'hanzi-to-meaning' && (
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
                      <span className="font-tc text-amber-900">{currentQuestion.zhuyin}</span>
                      {selectedOptionId && currentQuestion.hanViet && (
                        <span className="text-slate-500 font-normal"> (Hán Việt: {currentQuestion.hanViet.toUpperCase()})</span>
                      )}
                    </p>
                  </>
                )}

                {effectiveMode === 'audio-to-hanzi' && (
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
                        {currentQuestion.hanViet && (
                          <span className="text-slate-500 font-normal"> · Hán Việt: {currentQuestion.hanViet.toUpperCase()}</span>
                        )}
                      </p>
                    )}
                  </>
                )}

                {effectiveMode === 'meaning-to-hanzi' && (
                  <>
                    <p className="text-xs uppercase font-bold text-indigo-700">
                      Chọn chữ Phồn thể tương ứng với nghĩa sau
                    </p>
                    <h2 className="text-2xl font-bold text-slate-900 pt-1">
                      {getDisplayMeaning(currentQuestion)}
                    </h2>
                    <p className="text-xs font-bold uppercase text-slate-500">
                      {selectedOptionId && currentQuestion.hanViet && (
                        <span>Âm Hán Việt: {currentQuestion.hanViet.toUpperCase()} · </span>
                      )}
                      Từ loại: {currentQuestion.pos}
                    </p>
                  </>
                )}

                {effectiveMode === 'type-vietnamese' && (
                  <>
                    <p className="text-xs uppercase font-bold text-purple-700">
                      Nhập nghĩa tiếng Việt của từ Phồn thể sau ({currentQuestion.levelTag})
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-1">
                      <h2 className="font-tc text-5xl font-bold text-slate-900">
                        {currentQuestion.rawWord}
                      </h2>
                      <button
                        onClick={() => speakTaiwanMandarin(currentQuestion.traditional)}
                        className="p-2.5 rounded-2xl bg-white border border-slate-200 text-purple-600 hover:bg-purple-50 transition"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                      {currentQuestion.pinyin} ·{' '}
                      <span className="font-tc text-purple-900">{currentQuestion.zhuyin}</span>
                      {selectedOptionId && currentQuestion.hanViet && (
                        <span className="text-slate-500 font-normal"> (Hán Việt: {currentQuestion.hanViet.toUpperCase()})</span>
                      )}
                    </p>
                  </>
                )}

                {effectiveMode === 'type-hanzi' && (
                  <>
                    <p className="text-xs uppercase font-bold text-rose-700">
                      Nghĩa tiếng Việt → Gõ chữ Hán Phồn thể ({currentQuestion.levelTag})
                    </p>
                    <div className="py-3 space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        {getDisplayMeaning(currentQuestion)}
                      </h2>
                    </div>
                    <p className="text-xs font-bold uppercase text-slate-500">
                      Từ loại: {currentQuestion.pos}
                    </p>
                  </>
                )}
              </div>

              {/* Typing Input Form (Gõ nghĩa tiếng Việt hoặc Gõ chữ Phồn thể) OR 4 Choices */}
              {effectiveMode === 'type-vietnamese' || effectiveMode === 'type-hanzi' ? (
                <div className="space-y-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!isTypingSubmitted) {
                        handleCheckTypedAnswer();
                      } else {
                        handleNextQuestion();
                      }
                    }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <input
                        ref={typingInputRef}
                        type="text"
                        value={typedAnswer}
                        onChange={(e) => setTypedAnswer(e.target.value)}
                        disabled={isTypingSubmitted}
                        placeholder={
                          effectiveMode === 'type-hanzi'
                            ? 'Dùng bộ gõ tiếng Trung gõ chữ Phồn thể vào đây (nhấn Enter để nộp)...'
                            : 'Nhập nghĩa tiếng Việt của từ này (nhấn Enter để nộp)...'
                        }
                        className={`w-full px-4 py-3.5 rounded-2xl border text-base font-medium shadow-sm transition outline-none ${
                          isTypingSubmitted
                            ? typingResult?.isMatch
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold font-tc'
                              : 'bg-rose-50 border-rose-400 text-rose-950 font-tc'
                            : effectiveMode === 'type-hanzi'
                            ? 'bg-white border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 font-tc text-xl'
                            : 'bg-white border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                        }`}
                      />
                    </div>

                    {!isTypingSubmitted && (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">
                          {effectiveMode === 'type-hanzi'
                            ? '💡 Bật bộ gõ tiếng Trung (Pinyin / Chú âm Zhuyin) trên máy tính/điện thoại để gõ ra chữ Phồn thể'
                            : '💡 Gõ có dấu hoặc không dấu, đồng nghĩa cách nhau bằng dấu chấm phẩy (;)'}
                        </span>
                        <button
                          type="submit"
                          disabled={!typedAnswer.trim()}
                          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl disabled:bg-slate-300 text-white text-xs font-bold transition shadow-sm ${
                            effectiveMode === 'type-hanzi'
                              ? 'bg-rose-600 hover:bg-rose-700'
                              : 'bg-purple-600 hover:bg-purple-700'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {effectiveMode === 'type-hanzi' ? 'Kiểm tra chữ Phồn thể' : 'Kiểm tra đáp án'}
                        </button>
                      </div>
                    )}
                  </form>

                  {/* Kết quả sau khi nộp câu trả lời gõ */}
                  {isTypingSubmitted && (
                    <div
                      className={`p-4 rounded-2xl border transition ${
                        typingResult?.isMatch
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50 border-rose-300 text-rose-950'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {typingResult?.isMatch ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm">
                              {typingResult?.isMatch
                                ? effectiveMode === 'type-hanzi'
                                  ? 'Chính xác! Gõ chuẩn chữ Phồn thể 🎉'
                                  : 'Chính xác! Xuất sắc 🎉'
                                : 'Chưa chính xác!'}
                            </h4>
                            {typingResult?.isMatch && (
                              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                +10 Điểm
                              </span>
                            )}
                          </div>

                          {effectiveMode === 'type-hanzi' ? (
                            <div className="space-y-1 text-xs">
                              {!typingResult?.isMatch && (
                                <p className="text-rose-900">
                                  Bạn đã gõ:{' '}
                                  <strong className="font-tc text-base font-bold bg-white/80 px-2 py-0.5 rounded border border-rose-200">
                                    {typedAnswer}
                                  </strong>
                                </p>
                              )}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p>
                                  Chữ Phồn thể chuẩn:{' '}
                                  <strong className="font-tc text-xl font-bold text-emerald-900 ml-1">
                                    {currentQuestion.rawWord}
                                  </strong>{' '}
                                  ({currentQuestion.pinyin} · <span className="font-tc">{currentQuestion.zhuyin}</span>)
                                  {currentQuestion.hanViet && (
                                    <span className="text-slate-500 font-normal ml-1">
                                      · Hán Việt: {currentQuestion.hanViet.toUpperCase()}
                                    </span>
                                  )}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => speakTaiwanMandarin(currentQuestion.traditional)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs shadow-xs"
                                >
                                  <Volume2 className="w-3.5 h-3.5 text-rose-600" /> Nghe phát âm
                                </button>
                              </div>
                              <p className="text-slate-700">
                                Nghĩa: <strong>{getDisplayMeaning(currentQuestion)}</strong>
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs">
                              Nghĩa trong từ điển:{' '}
                              <strong className="text-sm font-semibold">{getDisplayMeaning(currentQuestion)}</strong>
                            </p>
                          )}

                          {(currentQuestion.pos || currentQuestion.contextLabel) && (
                            <p className="text-xs text-slate-600 pt-1 border-t border-slate-200/60 mt-1.5">
                              {currentQuestion.pos && <span>Từ loại: <strong>{currentQuestion.pos}</strong> </span>}
                              {currentQuestion.contextLabel && (
                                <span className="ml-2">Chủ đề: <strong>{currentQuestion.contextLabel}</strong></span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
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
                        {effectiveMode === 'hanzi-to-meaning' ? (
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
              )}

              {selectedOptionId && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {/* SRS Rating Bar */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-700 gap-1">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Độ nhớ từ này (Thuật toán lặp lại ngắt quãng SRS):
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Bấm chọn hoặc bấm &quot;Câu tiếp theo&quot; để dùng mặc định
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {/* Again */}
                      <button
                        type="button"
                        onClick={() => handleRateCurrentQuestion('again')}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          currentQuestionRating === 'again'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-300'
                            : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <div className="font-bold text-xs">Quên / Chưa thuộc</div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            currentQuestionRating === 'again' ? 'text-rose-100' : 'text-rose-500'
                          }`}
                        >
                          Ôn lại: 1 ngày
                        </div>
                      </button>

                      {/* Hard */}
                      <button
                        type="button"
                        onClick={() => handleRateCurrentQuestion('hard')}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          currentQuestionRating === 'hard'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-300'
                            : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <div className="font-bold text-xs">Nhớ vất vả (Khó)</div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            currentQuestionRating === 'hard' ? 'text-amber-100' : 'text-amber-600'
                          }`}
                        >
                          +{hardIntervalDays} ngày (x1.2)
                        </div>
                      </button>

                      {/* Good */}
                      <button
                        type="button"
                        onClick={() => handleRateCurrentQuestion('good')}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          currentQuestionRating === 'good'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300'
                            : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        <div className="font-bold text-xs">Vừa vặn (Chuẩn) ✓</div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            currentQuestionRating === 'good' ? 'text-emerald-100' : 'text-emerald-600'
                          }`}
                        >
                          +{goodIntervalDays} ngày (x2.5)
                        </div>
                      </button>

                      {/* Easy */}
                      <button
                        type="button"
                        onClick={() => handleRateCurrentQuestion('easy')}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          currentQuestionRating === 'easy'
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm ring-2 ring-sky-300'
                            : 'bg-white hover:bg-sky-50 text-sky-800 border-sky-200'
                        }`}
                      >
                        <div className="font-bold text-xs">Quá dễ! (Nhanh)</div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            currentQuestionRating === 'easy' ? 'text-sky-100' : 'text-sky-600'
                          }`}
                        >
                          +{easyIntervalDays} ngày (x3.5)
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => speakTaiwanMandarin(currentQuestion.traditional)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                    >
                      <Volume2 className="w-4 h-4" /> Nghe lại phát âm từ này
                    </button>

                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-sm flex items-center gap-1.5"
                    >
                      <span>
                        {currentIdx + 1 < currentBatchQuestions.length
                          ? 'Câu tiếp theo →'
                          : 'Hoàn thành bài & Nhận điểm thưởng 🎉'}
                      </span>
                    </button>
                  </div>
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
