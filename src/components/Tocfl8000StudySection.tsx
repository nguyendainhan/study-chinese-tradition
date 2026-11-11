import React, { useState, useEffect, useMemo } from 'react';
import { StrokeWriterPanel } from './StrokeWriterModal';
import { LevelCertificationModal } from './LevelCertificationModal';
import {
  LevelCertificationRecord,
  fetchViTranslationsFromCloud,
  saveViTranslationsToCloud,
} from '../utils/userAccountDb';
import { speakTaiwanMandarin } from '../utils/speech';
import { autoTranslateChineseToVietnamese } from '../utils/autoChineseHelper';
import {
  Volume2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  Layers,
  Tag,
  BookOpen,
  Loader2,
  Filter,
  Table2,
  Award,
  Sparkles,
  XCircle,
  RotateCcw,
  ArrowLeftRight,
  ShieldCheck,
} from 'lucide-react';

export interface Tocfl8000Word {
  id: string;
  levelCode: string;
  levelTag: string;
  band: string;
  rawWord: string;
  traditional: string;
  simplified: string;
  pinyin: string;
  zhuyin: string;
  hanViet: string;
  pos: string;
  context: string;
  contextLabel: string;
  vietnamese: string;
  english: string;
}

export interface TocflLevelMeta {
  code: string;
  label: string;
  band: string;
  count: number;
}

export interface CrossStraitDiffItem {
  華測八千詞條: string;
  華測等級: string;
  教育部兩岸常用詞語: string;
  HSK詞條: string;
  HSK等級: string;
}

interface Tocfl8000StudySectionProps {
  showZhuyin: boolean;
  showSimplified: boolean;
  masteredIds: string[];
  onToggleMastered: (id: string) => void;
  onBulkUpdateMastered?: (ids: string[]) => void;
  certifiedLevels?: Record<string, LevelCertificationRecord>;
  onCertifyLevel?: (cert: LevelCertificationRecord, allLevelWordIds: string[]) => void;
  extraCustomWords?: Tocfl8000Word[];
}

const BATCH_SIZE = 20;

export const Tocfl8000StudySection: React.FC<Tocfl8000StudySectionProps> = ({
  showZhuyin,
  showSimplified,
  masteredIds,
  onToggleMastered,
  onBulkUpdateMastered,
  certifiedLevels = {},
  onCertifyLevel,
  extraCustomWords = [],
}) => {
  const [words, setWords] = useState<Tocfl8000Word[]>([]);
  const [levels, setLevels] = useState<TocflLevelMeta[]>([]);
  const [crossStraitDiffs, setCrossStraitDiffs] = useState<CrossStraitDiffItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [certifyingLevelCode, setCertifyingLevelCode] = useState<string | null>(null);

  // Filters: Level -> Context (Lĩnh vực) -> Lesson Batch (20 words)
  const [selectedLevel, setSelectedLevel] = useState<string>('novice1');
  const [selectedContext, setSelectedContext] = useState<string>('ALL');
  const [selectedBatchIdx, setSelectedBatchIdx] = useState<number>(0);
  const [selectedWordIndexInBatch, setSelectedWordIndexInBatch] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Study Mode within the current 20-word lesson: 'flashcard' | 'table' | 'batch-quiz' | 'cross-strait'
  const [studyMode, setStudyMode] = useState<'flashcard' | 'table' | 'batch-quiz' | 'cross-strait'>('flashcard');

  // Batch Quiz State
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [quizSelectedId, setQuizSelectedId] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCorrectIds, setQuizCorrectIds] = useState<string[]>([]);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Cached automatic Vietnamese translations for higher-level words
  const [viCache, setViCache] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('formosa_tocfl8000_vi_cache');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isTranslatingVi, setIsTranslatingVi] = useState<boolean>(false);
  const [isBatchTranslating, setIsBatchTranslating] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    fetch('/tocfl_8000_full.json')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setWords(data.words || []);
        setLevels(data.levels || []);
        setCrossStraitDiffs(data.crossStraitDiffs || []);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    fetchViTranslationsFromCloud().then((cloudViMap) => {
      if (!mounted || !cloudViMap) return;
      if (Object.keys(cloudViMap).length > 0) {
        setViCache((prev) => ({ ...prev, ...cloudViMap }));
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('formosa_tocfl8000_vi_cache', JSON.stringify(viCache));
    } catch {
      // ignore storage errors
    }
  }, [viCache]);

  const combinedWords = useMemo(() => {
    if (extraCustomWords.length === 0) return words;
    return [...extraCustomWords, ...words];
  }, [words, extraCustomWords]);

  // Words filtered by Level
  const levelWords = useMemo(() => {
    if (selectedLevel === 'ALL') return combinedWords;
    return combinedWords.filter((w) => w.levelCode === selectedLevel);
  }, [combinedWords, selectedLevel]);

  // Available Contexts (任務領域 / Lĩnh vực) within the selected Level
  const availableContexts = useMemo(() => {
    const map = new Map<string, { code: string; label: string; count: number }>();
    for (const w of levelWords) {
      const existing = map.get(w.contextLabel);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(w.contextLabel, {
          code: w.contextLabel,
          label: w.contextLabel,
          count: 1,
        });
      }
    }
    return Array.from(map.values());
  }, [levelWords]);

  // Words filtered by Level + Context + Search query
  const filteredWords = useMemo(() => {
    let list = levelWords;
    if (selectedContext !== 'ALL') {
      list = list.filter((w) => w.contextLabel === selectedContext);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (w) =>
          w.rawWord.toLowerCase().includes(q) ||
          w.traditional.toLowerCase().includes(q) ||
          w.pinyin.toLowerCase().includes(q) ||
          w.hanViet.toLowerCase().includes(q) ||
          w.vietnamese.toLowerCase().includes(q) ||
          w.english.toLowerCase().includes(q)
      );
    }
    return list;
  }, [levelWords, selectedContext, searchQuery]);

  // Divide filteredWords into small study batches of 20 words
  const totalBatches = Math.max(1, Math.ceil(filteredWords.length / BATCH_SIZE));
  const safeBatchIdx = Math.min(selectedBatchIdx, totalBatches - 1);
  const currentBatchWords = useMemo(() => {
    const start = safeBatchIdx * BATCH_SIZE;
    return filteredWords.slice(start, start + BATCH_SIZE);
  }, [filteredWords, safeBatchIdx]);

  const currentWord =
    currentBatchWords[selectedWordIndexInBatch] || currentBatchWords[0] || null;

  const getWordMeaning = (w: Tocfl8000Word): string => {
    return w.vietnamese || viCache[w.traditional] || w.english || `Hán Việt: ${w.hanViet}`;
  };

  // Automatically fetch Vietnamese translation if currentWord only has English + HanViet
  useEffect(() => {
    if (!currentWord) return;
    if (currentWord.vietnamese || viCache[currentWord.traditional]) return;

    let cancelled = false;
    setIsTranslatingVi(true);
    autoTranslateChineseToVietnamese(currentWord.traditional)
      .then((res) => {
        if (cancelled) return;
        if (
          res.meaning &&
          !res.meaning.startsWith('Từ vựng tiếng Trung Phồn thể')
        ) {
          setViCache((prev) => ({
            ...prev,
            [currentWord.traditional]: res.meaning,
          }));
          void saveViTranslationsToCloud([
            { traditional: currentWord.traditional, vietnamese: res.meaning },
          ]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsTranslatingVi(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentWord, viCache]);

  // Translate all 20 words in the current batch to Vietnamese with 1 click
  const handleTranslateCurrentBatch = async () => {
    setIsBatchTranslating(true);
    try {
      const missing = currentBatchWords.filter(
        (w) => !w.vietnamese && !viCache[w.traditional]
      );
      const newCloudEntries: Array<{ traditional: string; vietnamese: string }> = [];
      for (const item of missing) {
        const res = await autoTranslateChineseToVietnamese(item.traditional);
        if (
          res.meaning &&
          !res.meaning.startsWith('Từ vựng tiếng Trung Phồn thể')
        ) {
          setViCache((prev) => ({
            ...prev,
            [item.traditional]: res.meaning,
          }));
          newCloudEntries.push({
            traditional: item.traditional,
            vietnamese: res.meaning,
          });
        }
      }
      if (newCloudEntries.length > 0) {
        void saveViTranslationsToCloud(newCloudEntries);
      }
    } finally {
      setIsBatchTranslating(false);
    }
  };

  const resetBatchQuiz = () => {
    setQuizIdx(0);
    setQuizSelectedId(null);
    setQuizScore(0);
    setQuizCorrectIds([]);
    setQuizFinished(false);
  };

  const handleLevelChange = (levelCode: string) => {
    setSelectedLevel(levelCode);
    setSelectedContext('ALL');
    setSelectedBatchIdx(0);
    setSelectedWordIndexInBatch(0);
    resetBatchQuiz();
  };

  const handleContextChange = (ctxLabel: string) => {
    setSelectedContext(ctxLabel);
    setSelectedBatchIdx(0);
    setSelectedWordIndexInBatch(0);
    resetBatchQuiz();
  };

  // Quiz current question & 4 options from current batch / level
  const currentQuizWord = currentBatchWords[quizIdx] || currentBatchWords[0];
  const quizOptions = useMemo(() => {
    if (!currentQuizWord) return [];
    const pool = currentBatchWords.length >= 4 ? currentBatchWords : levelWords;
    const others = pool.filter((w) => w.id !== currentQuizWord.id);
    const picked: Tocfl8000Word[] = [];
    for (let i = 0; i < 3 && i < others.length; i++) {
      picked.push(others[(quizIdx * 3 + i) % others.length]);
    }
    return [currentQuizWord, ...picked].sort((a, b) => a.id.localeCompare(b.id));
  }, [currentQuizWord, currentBatchWords, levelWords, quizIdx]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto" />
        <p className="font-bold text-slate-800">
          Đang tải toàn bộ 7.517 từ vựng chuẩn TOCFL (華語八千詞表)...
        </p>
      </div>
    );
  }

  const displayedVietnamese = currentWord
    ? currentWord.vietnamese || viCache[currentWord.traditional] || ''
    : '';

  const masteredInBatchCount = currentBatchWords.filter((w) =>
    masteredIds.includes(w.id)
  ).length;

  return (
    <div className="space-y-6">
      {/* STEP 1: SELECT TOCFL LEVEL (7 LEVELS FROM EXCEL FILE) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
              <Layers className="w-3.5 h-3.5" /> Bước 1 · Chọn Cấp Bậc TOCFL (Đầy đủ 7.517 từ từ file 華語八千詞表20240923.xlsx)
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Phân loại theo 7 Cấp Bậc & 12 Lĩnh Vực Phục Vụ Chuẩn TOCFL Đài Loan
            </h2>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm trong 7.517 từ (Hán, Pinyin, Việt, Anh)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedBatchIdx(0);
                setSelectedWordIndexInBatch(0);
              }}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-72 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* 7 Level Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {levels.map((lvl) => {
            const isSelected = selectedLevel === lvl.code;
            const masteredInLevel = combinedWords.filter(
              (w) => w.levelCode === lvl.code && masteredIds.includes(w.id)
            ).length;
            const cert = certifiedLevels[lvl.code];

            return (
              <button
                key={lvl.code}
                onClick={() => handleLevelChange(lvl.code)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-500/20'
                    : cert
                    ? 'bg-emerald-50/70 hover:bg-emerald-50 text-slate-900 border-emerald-300'
                    : 'bg-slate-50 hover:bg-red-50/50 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      isSelected ? 'text-amber-200' : 'text-slate-400'
                    }`}
                  >
                    {lvl.band}
                  </span>
                  {cert && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-amber-300 text-slate-950'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      🏆 Đã đạt
                    </span>
                  )}
                </div>
                <span className="font-bold text-xs mt-0.5 leading-snug">{lvl.label}</span>
                <div className="flex items-center justify-between mt-1.5">
                  <span
                    className={`text-[11px] font-semibold ${
                      isSelected ? 'text-red-100' : 'text-red-600'
                    }`}
                  >
                    {lvl.count} từ
                  </span>
                  {masteredInLevel > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      ✓ {masteredInLevel}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          <button
            onClick={() => handleLevelChange('ALL')}
            className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              selectedLevel === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <span className="text-[10px] font-bold uppercase opacity-75">Toàn bộ</span>
            <span className="font-bold text-xs mt-0.5">Tất cả 7 cấp</span>
            <span className="text-[11px] font-semibold mt-1.5">{combinedWords.length} từ</span>
          </button>
        </div>

        {/* LEVEL CERTIFICATION ACTION BAR FOR CURRENT LEVEL */}
        {selectedLevel !== 'ALL' && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                  <span>
                    Xác nhận hoàn thành cấp bậc:{' '}
                    {levels.find((l) => l.code === selectedLevel)?.label}
                  </span>
                  {certifiedLevels[selectedLevel] && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                      🏆 ĐÃ ĐẠT ({certifiedLevels[selectedLevel].accuracy}%)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600">
                  Làm bài kiểm tra 20 câu của cấp này (đạt ≥ 80%) để hệ thống công nhận <strong>Đã đạt</strong> và đưa toàn bộ từ của cấp này vào Kho Ôn Tập Hàng Ngày.
                </p>
              </div>
            </div>

            <button
              onClick={() => setCertifyingLevelCode(selectedLevel)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              {certifiedLevels[selectedLevel]
                ? 'Thi lại bài xác nhận cấp này'
                : `Thi xác nhận hoàn thành ${
                    levels.find((l) => l.code === selectedLevel)?.label || ''
                  }`}
            </button>
          </div>
        )}

        {/* STEP 2: SELECT TASK CONTEXT / LĨNH VỰC PHỤC VỤ (任務領域) */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-bold uppercase text-slate-500">
              Bước 2 · Chọn Lĩnh vực phục vụ (任務領域 Context / Từ loại) trong cấp này:
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleContextChange('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                selectedContext === 'ALL'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
              }`}
            >
              Tất cả lĩnh vực ({levelWords.length})
            </button>

            {availableContexts.map((ctx) => {
              const active = selectedContext === ctx.code;
              return (
                <button
                  key={ctx.code}
                  onClick={() => handleContextChange(ctx.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    active
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  {ctx.label} <span className="opacity-75">({ctx.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 3: SELECT LESSON BATCH (CHIA NHỎ 20 TỪ / BÀI) & STUDY MODE SWITCHER */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase text-slate-400">
              Bước 3 · Chia nhỏ bài học (20 từ/bài — Học xong bài nào lưu ngay bài đó vào Kho Ôn Tập):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {Array.from({ length: totalBatches }).map((_, idx) => {
                const startNum = idx * BATCH_SIZE + 1;
                const endNum = Math.min((idx + 1) * BATCH_SIZE, filteredWords.length);
                const batchSlice = filteredWords.slice(
                  idx * BATCH_SIZE,
                  (idx + 1) * BATCH_SIZE
                );
                const learnedInSlice = batchSlice.filter((w) =>
                  masteredIds.includes(w.id)
                ).length;
                const isAllBatchLearned =
                  batchSlice.length > 0 && learnedInSlice === batchSlice.length;
                const isSelectedBatch = idx === safeBatchIdx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedBatchIdx(idx);
                      setSelectedWordIndexInBatch(0);
                      resetBatchQuiz();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                      isSelectedBatch
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : isAllBatchLearned
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : learnedInSlice > 0
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isAllBatchLearned ? '✓ ' : ''}Bài {idx + 1} ({startNum}–{endNum})
                    {learnedInSlice > 0 && !isAllBatchLearned
                      ? ` · ${learnedInSlice}/${batchSlice.length}`
                      : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Switcher for Current 20-Word Lesson */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStudyMode('flashcard')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                studyMode === 'flashcard'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Thẻ học & Tập viết
            </button>

            <button
              onClick={() => setStudyMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                studyMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" /> Xem bảng 20 từ
            </button>

            <button
              onClick={() => {
                resetBatchQuiz();
                setStudyMode('batch-quiz');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                studyMode === 'batch-quiz'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Kiểm tra Bài {safeBatchIdx + 1}
            </button>

            <button
              onClick={() => setStudyMode('cross-strait')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                studyMode === 'cross-strait'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" /> 41 Từ Đài vs. HSK (Trong file)
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: FLASHCARD + STROKE WRITER */}
      {studyMode === 'flashcard' && currentBatchWords.length > 0 && currentWord && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase text-slate-500">
                Bài {safeBatchIdx + 1}: Đã thuộc {masteredInBatchCount}/{currentBatchWords.length} từ — Bấm vào từ để học & tập viết:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {onBulkUpdateMastered && (
                  <button
                    onClick={() => {
                      const batchIds = currentBatchWords.map((w) => w.id);
                      const allLearned = batchIds.every((id) => masteredIds.includes(id));
                      if (allLearned) {
                        const removeSet = new Set(batchIds);
                        onBulkUpdateMastered(masteredIds.filter((id) => !removeSet.has(id)));
                      } else {
                        const set = new Set(masteredIds);
                        batchIds.forEach((id) => set.add(id));
                        onBulkUpdateMastered(Array.from(set));
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                      masteredInBatchCount === currentBatchWords.length
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {masteredInBatchCount === currentBatchWords.length
                      ? `Đã thuộc cả Bài ${safeBatchIdx + 1} (${currentBatchWords.length} từ)`
                      : `Đánh dấu đã học cả Bài ${safeBatchIdx + 1} (${currentBatchWords.length} từ)`}
                  </button>
                )}

                <button
                  onClick={handleTranslateCurrentBatch}
                  disabled={isBatchTranslating}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition"
                >
                  {isBatchTranslating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang dịch 20 từ sang Tiếng Việt...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Dịch Tiếng Việt cả 20 từ bài này
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {currentBatchWords.map((item, idx) => {
                const isMastered = masteredIds.includes(item.id);
                const isSelected = idx === selectedWordIndexInBatch;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedWordIndexInBatch(idx)}
                    className={`px-3 py-1.5 rounded-xl font-tc text-sm font-bold transition flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-600 shadow-sm scale-105'
                        : isMastered
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    <span>{item.rawWord}</span>
                    {isMastered && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Flashcard Detail */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                    {currentWord.levelTag}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {currentWord.contextLabel}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                    Từ loại: {currentWord.pos}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakTaiwanMandarin(currentWord.traditional)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition shadow-sm"
                  >
                    <Volume2 className="w-4 h-4" /> Phát âm (zh-TW)
                  </button>

                  <button
                    onClick={() => onToggleMastered(currentWord.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      masteredIds.includes(currentWord.id)
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {masteredIds.includes(currentWord.id) ? 'Đã thuộc' : 'Đánh dấu thuộc'}
                  </button>
                </div>
              </div>

              {/* Character & Phonetics Box */}
              <div className="rounded-2xl bg-gradient-to-b from-amber-50/60 to-white border border-amber-200/80 p-6 text-center space-y-3">
                <div className="flex items-center justify-center gap-4">
                  <div>
                    <h2 className="font-tc text-5xl sm:text-6xl font-bold text-slate-900 tracking-wide">
                      {currentWord.rawWord}
                    </h2>
                    {currentWord.rawWord !== currentWord.traditional && (
                      <span className="text-xs text-slate-500 block mt-1">
                        Chữ chuẩn luyện viết:{' '}
                        <strong className="font-tc">{currentWord.traditional}</strong>
                      </span>
                    )}
                  </div>

                  {showSimplified && currentWord.simplified !== currentWord.traditional && (
                    <div className="text-left border-l border-slate-200 pl-3">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Giản thể
                      </span>
                      <span className="font-tc text-2xl text-slate-500">
                        {currentWord.simplified}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pinyin + Zhuyin + HanViet */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <span className="text-lg font-bold text-red-700">{currentWord.pinyin}</span>
                  {showZhuyin && currentWord.zhuyin && (
                    <span className="text-sm font-tc bg-amber-100/90 text-amber-950 px-2.5 py-0.5 rounded-lg border border-amber-200 font-semibold">
                      {currentWord.zhuyin}
                    </span>
                  )}
                  <span className="text-xs font-bold uppercase bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-200">
                    Hán Việt: {currentWord.hanViet}
                  </span>
                </div>

                {/* Meanings: Vietnamese + English CC-CEDICT */}
                <div className="pt-4 border-t border-amber-200/60 text-left space-y-2.5">
                  <div className="bg-white p-3.5 rounded-xl border border-amber-200/80">
                    <span className="text-[11px] font-bold uppercase text-emerald-700 block">
                      🇻🇳 Nghĩa Tiếng Việt
                    </span>
                    {displayedVietnamese ? (
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {displayedVietnamese}
                      </p>
                    ) : isTranslatingVi ? (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        Đang tự động dịch nghĩa tiếng Việt...
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        Âm Hán Việt: <span className="uppercase">{currentWord.hanViet}</span>
                      </p>
                    )}
                  </div>

                  {currentWord.english && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[11px] font-bold uppercase text-slate-400 block">
                        🇬🇧 Nghĩa Từ điển Quốc tế (CC-CEDICT)
                      </span>
                      <p className="text-sm text-slate-700 font-medium mt-0.5">
                        {currentWord.english}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() =>
                    setSelectedWordIndexInBatch((prev) =>
                      prev > 0 ? prev - 1 : currentBatchWords.length - 1
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Từ trước
                </button>

                <span className="text-xs text-slate-500 font-medium">
                  Từ {selectedWordIndexInBatch + 1} / {currentBatchWords.length} (Bài{' '}
                  {safeBatchIdx + 1})
                </span>

                <button
                  onClick={() =>
                    setSelectedWordIndexInBatch((prev) =>
                      prev + 1 < currentBatchWords.length ? prev + 1 : 0
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                >
                  Từ tiếp theo <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Stroke Order Practice for Current Word */}
            <div className="lg:col-span-6">
              <StrokeWriterPanel
                word={currentWord.traditional}
                pinyin={currentWord.pinyin}
                zhuyin={currentWord.zhuyin}
                meaning={getWordMeaning(currentWord)}
                radicalInfo={`Cấp độ: ${currentWord.levelTag} · Lĩnh vực: ${currentWord.contextLabel}`}
                mnemonic={`Từ loại: ${currentWord.pos} · Âm Hán Việt: ${currentWord.hanViet.toUpperCase()}${
                  currentWord.english ? ` · Nghĩa Anh: ${currentWord.english}` : ''
                }`}
              />
            </div>
          </div>
        </>
      )}

      {/* MODE 2: TABLE VIEW OF CURRENT 20-WORD LESSON */}
      {studyMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Bảng Từ Vựng Bài {safeBatchIdx + 1} ({currentBatchWords.length} từ)
              </h3>
              <p className="text-xs text-slate-500">
                Bấm vào chữ Hán để nghe phát âm hoặc bấm "Tập viết" để mở ô luyện nét chữ
              </p>
            </div>

            <button
              onClick={handleTranslateCurrentBatch}
              disabled={isBatchTranslating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition shadow-sm"
            >
              {isBatchTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang dịch tự động...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Dịch Tiếng Việt cả 20 từ này
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Từ vựng (詞彙)</th>
                  <th className="py-3 px-4">Pinyin & Chú âm ㄅㄆㄇㄈ</th>
                  <th className="py-3 px-4">Hán Việt</th>
                  <th className="py-3 px-4">Nghĩa Tiếng Việt & CC-CEDICT</th>
                  <th className="py-3 px-4">Lĩnh vực / Từ loại</th>
                  <th className="py-3 px-4 text-right">Học</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {currentBatchWords.map((w, idx) => {
                  const viText = w.vietnamese || viCache[w.traditional] || '';
                  const isMastered = masteredIds.includes(w.id);
                  return (
                    <tr key={w.id} className="hover:bg-amber-50/40 transition">
                      <td className="py-3 px-4 text-xs font-bold text-slate-400">
                        {safeBatchIdx * BATCH_SIZE + idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => speakTaiwanMandarin(w.traditional)}
                          className="inline-flex items-center gap-1.5 font-tc text-xl font-bold text-slate-900 hover:text-red-600"
                        >
                          {w.rawWord}
                          <Volume2 className="w-4 h-4 text-slate-400" />
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-red-700 text-xs">{w.pinyin}</div>
                        {showZhuyin && (
                          <div className="font-tc text-xs text-amber-900">{w.zhuyin}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-bold uppercase text-indigo-800">
                        {w.hanViet}
                      </td>
                      <td className="py-3 px-4">
                        {viText && (
                          <div className="font-semibold text-slate-900 text-sm">{viText}</div>
                        )}
                        {w.english && (
                          <div className="text-xs text-slate-500">{w.english}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-semibold text-slate-700 block">
                          {w.contextLabel}
                        </span>
                        <span className="text-[11px] text-slate-400">Từ loại: {w.pos}</span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => onToggleMastered(w.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                            isMastered
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50'
                          }`}
                        >
                          {isMastered ? 'Đã thuộc' : 'Thuộc'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWordIndexInBatch(idx);
                            setStudyMode('flashcard');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-red-600 transition"
                        >
                          Tập viết →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 3: MINI-QUIZ FOR THE CURRENT 20-WORD LESSON */}
      {studyMode === 'batch-quiz' && currentQuizWord && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 max-w-2xl mx-auto">
          {quizFinished ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Hoàn thành kiểm tra Bài {safeBatchIdx + 1} ({currentBatchWords.length} từ)!
              </h3>
              <p className="text-slate-600">
                Bạn trả lời đúng{' '}
                <strong className="text-emerald-600 text-xl">{quizScore}</strong> /{' '}
                <strong>{currentBatchWords.length}</strong> từ trong bài học này.
              </p>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 max-w-lg mx-auto text-xs font-semibold text-emerald-950">
                {quizScore >= Math.ceil(currentBatchWords.length * 0.8) ? (
                  <span>
                    🎉 <strong>Đạt yêu cầu Bài {safeBatchIdx + 1} (≥ 80%)!</strong> Toàn bộ{' '}
                    <strong>{currentBatchWords.length} từ</strong> của bài này đã được tự động đánh dấu{' '}
                    <strong>Đã thuộc</strong> và lưu vào Kho Ôn Tập Hàng Ngày của tài khoản bạn!
                  </span>
                ) : (
                  <span>
                    ✓ Hệ thống đã tự động lưu <strong>{quizCorrectIds.length} từ bạn trả lời đúng</strong> trong bài này vào Kho Ôn Tập Hàng Ngày! Những từ trả lời sai chưa được thêm để tránh nhầm lẫn.
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {safeBatchIdx + 1 < totalBatches && (
                  <button
                    onClick={() => {
                      setSelectedBatchIdx(safeBatchIdx + 1);
                      setSelectedWordIndexInBatch(0);
                      resetBatchQuiz();
                      setStudyMode('flashcard');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow-sm"
                  >
                    Sang học Bài {safeBatchIdx + 2} →
                  </button>
                )}
                <button
                  onClick={resetBatchQuiz}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                >
                  <RotateCcw className="w-4 h-4" /> Kiểm tra lại Bài {safeBatchIdx + 1}
                </button>
                <button
                  onClick={() => setStudyMode('flashcard')}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                >
                  Quay lại Thẻ học
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Kiểm tra Bài {safeBatchIdx + 1} · Câu {quizIdx + 1} / {currentBatchWords.length}
                </span>
                <span className="text-sm font-semibold text-slate-600">
                  Điểm: <strong className="text-emerald-600">{quizScore}</strong>
                </span>
              </div>

              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200/80 px-4">
                <p className="text-xs uppercase font-bold text-slate-400 mb-2">
                  Chọn nghĩa đúng của từ Phồn thể sau
                </p>
                <div className="flex items-center justify-center gap-3">
                  <h2 className="font-tc text-5xl font-bold text-slate-900">
                    {currentQuizWord.rawWord}
                  </h2>
                  <button
                    onClick={() => speakTaiwanMandarin(currentQuizWord.traditional)}
                    className="p-2.5 rounded-2xl bg-white border border-slate-200 text-red-600 hover:bg-red-50 transition"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-slate-600 mt-2 font-medium">
                  {currentQuizWord.pinyin} · <span className="font-tc">{currentQuizWord.zhuyin}</span>{' '}
                  (Hán Việt: {currentQuizWord.hanViet.toUpperCase()})
                </p>
              </div>

              <div className="space-y-2.5">
                {quizOptions.map((opt) => {
                  const isChosen = quizSelectedId === opt.id;
                  const isCorrect = opt.id === currentQuizWord.id;
                  let style =
                    'bg-white border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/30';
                  if (quizSelectedId) {
                    if (isCorrect) {
                      style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                    } else if (isChosen) {
                      style = 'bg-rose-50 border-rose-300 text-rose-900';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        if (quizSelectedId) return;
                        setQuizSelectedId(opt.id);
                        if (opt.id === currentQuizWord.id) {
                          setQuizScore((s) => s + 1);
                          setQuizCorrectIds((prev) =>
                            prev.includes(currentQuizWord.id)
                              ? prev
                              : [...prev, currentQuizWord.id]
                          );
                          speakTaiwanMandarin(currentQuizWord.traditional);
                        }
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition flex items-center justify-between gap-2 ${style}`}
                    >
                      <span className="text-sm">{getWordMeaning(opt)}</span>
                      {quizSelectedId && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {quizSelectedId && isChosen && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {quizSelectedId && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      if (quizIdx + 1 < currentBatchWords.length) {
                        setQuizIdx((i) => i + 1);
                        setQuizSelectedId(null);
                      } else {
                        if (onBulkUpdateMastered) {
                          const passedBatch =
                            quizScore >= Math.ceil(currentBatchWords.length * 0.8);
                          const idsToAdd = passedBatch
                            ? currentBatchWords.map((w) => w.id)
                            : quizCorrectIds;
                          if (idsToAdd.length > 0) {
                            const merged = Array.from(new Set([...masteredIds, ...idsToAdd]));
                            onBulkUpdateMastered(merged);
                          }
                        }
                        setQuizFinished(true);
                      }
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                  >
                    {quizIdx + 1 < currentBatchWords.length
                      ? 'Câu tiếp theo →'
                      : 'Hoàn thành & Lưu các từ đã thuộc ✓'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODE 4: 41 CROSS-STRAIT DIFFERENCES SHEET FROM EXCEL (兩岸常用詞語差異表) */}
      {studyMode === 'cross-strait' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Trích xuất từ Sheet「兩岸常用詞語差異表」trong file của bạn
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                41 Từ Vựng Khác Biệt Giữa TOCFL Đài Loan & HSK Đại Lục
              </h3>
            </div>
            <button
              onClick={() => setStudyMode('flashcard')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
            >
              ← Quay lại Thẻ học
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Từ chuẩn Đài Loan (華測八千詞條)</th>
                  <th className="py-3 px-4">Cấp TOCFL</th>
                  <th className="py-3 px-4">Đối chiếu Hai bờ Eo biển (教育部兩岸常用詞語)</th>
                  <th className="py-3 px-4">Từ HSK tương ứng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {crossStraitDiffs.map((row, idx) => (
                  <tr key={idx} className="hover:bg-teal-50/40 transition">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => speakTaiwanMandarin(row.華測八千詞條)}
                        className="inline-flex items-center gap-1.5 font-tc text-lg font-bold text-teal-800 hover:text-teal-950"
                      >
                        {row.華測八千詞條}
                        <Volume2 className="w-4 h-4 opacity-70" />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {row.華測等級}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-tc text-slate-700">
                      {row.教育部兩岸常用詞語}
                    </td>
                    <td className="py-3 px-4 font-tc text-slate-500">
                      {row.HSK詞條 || '—'} {row.HSK等級 ? `(${row.HSK等級})` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              count: combinedWords.filter((w) => w.levelCode === certifyingLevelCode).length,
            }
          }
          levelWords={combinedWords.filter((w) => w.levelCode === certifyingLevelCode)}
          existingCert={certifiedLevels[certifyingLevelCode]}
          onClose={() => setCertifyingLevelCode(null)}
          onCertifiedSuccess={(cert, allLevelWordIds) => {
            if (onCertifyLevel) {
              onCertifyLevel(cert, allLevelWordIds);
            }
          }}
        />
      )}
    </div>
  );
};
