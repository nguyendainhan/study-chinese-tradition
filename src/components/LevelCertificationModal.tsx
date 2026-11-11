import React, { useState, useMemo, useEffect } from 'react';
import { Tocfl8000Word, TocflLevelMeta } from './Tocfl8000StudySection';
import { LevelCertificationRecord } from '../utils/userAccountDb';
import { speakTaiwanMandarin } from '../utils/speech';
import {
  Award,
  CheckCircle2,
  XCircle,
  Volume2,
  X,
  Trophy,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface LevelCertificationModalProps {
  levelMeta: TocflLevelMeta;
  levelWords: Tocfl8000Word[];
  existingCert?: LevelCertificationRecord;
  onClose: () => void;
  onCertifiedSuccess: (cert: LevelCertificationRecord, allLevelWordIds: string[]) => void;
}

const EXAM_QUESTION_COUNT = 20;
const PASSING_RATIO = 0.8; // 80% (16/20 câu)

export const LevelCertificationModal: React.FC<LevelCertificationModalProps> = ({
  levelMeta,
  levelWords,
  existingCert,
  onClose,
  onCertifiedSuccess,
}) => {
  const [seed, setSeed] = useState<number>(() => Date.now());
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [wrongWords, setWrongWords] = useState<Tocfl8000Word[]>([]);
  const [finished, setFinished] = useState<boolean>(false);

  // Pick 20 random words from this TOCFL level
  const examQuestions = useMemo(() => {
    if (levelWords.length === 0) return [];
    const copy = [...levelWords];
    // Deterministic shuffle from seed
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.abs((seed * (i + 13) * 9301 + 49297) % (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy.slice(0, Math.min(EXAM_QUESTION_COUNT, copy.length));
  }, [levelWords, seed]);

  const currentQuestion = examQuestions[currentIdx];

  // Question mode alternates: 0 = Hanzi->Meaning, 1 = Audio->Hanzi, 2 = Meaning->Hanzi
  const currentQType = useMemo(() => {
    if (currentIdx % 3 === 1) return 'audio-to-hanzi';
    if (currentIdx % 3 === 2) return 'meaning-to-hanzi';
    return 'hanzi-to-meaning';
  }, [currentIdx]);

  // 4 choices drawn strictly from this same TOCFL level
  const options = useMemo(() => {
    if (!currentQuestion || levelWords.length === 0) return [];
    const others = levelWords.filter((w) => w.id !== currentQuestion.id);
    const distractors: Tocfl8000Word[] = [];
    for (let i = 0; i < 3 && i < others.length; i++) {
      const pickIdx = Math.abs((seed + currentIdx * 31 + i * 79) % others.length);
      distractors.push(others[pickIdx]);
    }
    return [currentQuestion, ...distractors].sort((a, b) => a.id.localeCompare(b.id));
  }, [currentQuestion, levelWords, seed, currentIdx]);

  useEffect(() => {
    if (currentQuestion && !finished && currentQType === 'audio-to-hanzi') {
      speakTaiwanMandarin(currentQuestion.traditional, 0.88);
    }
  }, [currentQuestion, finished, currentQType]);

  const getDisplayMeaning = (w: Tocfl8000Word) => {
    if (w.vietnamese && w.english) {
      return `${w.vietnamese} (${w.english.split(';')[0]})`;
    }
    return w.vietnamese || w.english || `Âm Hán Việt: ${w.hanViet.toUpperCase()}`;
  };

  const handleChooseOption = (optId: string) => {
    if (selectedId || !currentQuestion) return;
    setSelectedId(optId);
    if (optId === currentQuestion.id) {
      setScore((prev) => prev + 1);
      speakTaiwanMandarin(currentQuestion.traditional, 0.9);
    } else {
      setWrongWords((prev) => [...prev, currentQuestion]);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < examQuestions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedId(null);
    } else {
      setFinished(true);
      const total = examQuestions.length;
      const ratio = total > 0 ? score / total : 0;
      if (ratio >= PASSING_RATIO) {
        const cert: LevelCertificationRecord = {
          levelCode: levelMeta.code,
          levelLabel: levelMeta.label,
          score,
          totalQuestions: total,
          accuracy: Math.round(ratio * 100),
          passedAt: new Date().toISOString(),
        };
        onCertifiedSuccess(
          cert,
          levelWords.map((w) => w.id)
        );
      }
    }
  };

  const handleRetake = () => {
    setSeed(Date.now());
    setCurrentIdx(0);
    setSelectedId(null);
    setScore(0);
    setWrongWords([]);
    setFinished(false);
  };

  const requiredScore = Math.ceil(examQuestions.length * PASSING_RATIO);
  const passed = score >= requiredScore;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  Bài Thi Xác Nhận Hoàn Thành Cấp Bậc
                </span>
                {existingCert && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ✓ Đã đạt ({existingCert.accuracy}%)
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Kiểm tra xác nhận: {levelMeta.label} ({levelMeta.count} từ)
              </h3>
              <p className="text-xs text-slate-500">
                Đạt tối thiểu <strong>{requiredScore}/{examQuestions.length} câu (80%)</strong> để xác nhận bạn đã thuộc cấp này và đưa toàn bộ {levelMeta.count} từ vào Kho Ôn Tập Hàng Ngày.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Finished Exam Screen */}
        {finished ? (
          <div className="space-y-6 py-2">
            {passed ? (
              <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white rounded-3xl p-6 text-center space-y-4 shadow-lg">
                <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                  <Trophy className="w-9 h-9" />
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 px-3.5 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" /> Chính thức đạt chứng nhận cấp bậc
                </div>
                <h4 className="text-2xl font-extrabold">
                  Chúc mừng! Bạn đã ĐẠT {levelMeta.label}
                </h4>
                <p className="text-emerald-100 text-sm max-w-md mx-auto">
                  Kết quả bài kiểm tra:{' '}
                  <strong className="text-amber-300 text-lg">
                    {score}/{examQuestions.length} câu ({Math.round((score / examQuestions.length) * 100)}%)
                  </strong>
                  . Toàn bộ <strong>{levelMeta.count} từ</strong> của cấp này đã được xác nhận Đã Học và thêm vào Kho Ôn Tập Hàng Ngày của tài khoản bạn!
                </p>
                <div className="inline-block bg-white/15 border border-white/20 rounded-2xl px-4 py-2 text-xs font-bold text-amber-300">
                  🎁 Thưởng +200 Điểm Tích Cực (XP) vào tài khoản!
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-rose-950">
                  Chưa đạt mức xác nhận ({score}/{examQuestions.length} câu — cần tối thiểu {requiredScore} câu)
                </h4>
                <p className="text-xs text-rose-800 max-w-md mx-auto leading-relaxed">
                  Để tránh các từ chưa thực sự thuộc bị lẫn vào bài ôn tập hàng ngày, hệ thống chỉ công nhận <strong>Đã đạt {levelMeta.label}</strong> khi bạn đạt từ 80% trở lên. Hãy xem lại các từ bạn trả lời sai bên dưới rồi thi lại nhé!
                </p>
              </div>
            )}

            {/* Wrong words review list if any */}
            {wrongWords.length > 0 && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5">
                <div className="text-xs font-bold uppercase text-slate-600">
                  Các từ cần xem lại trong đề thi vừa rồi ({wrongWords.length} từ):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {wrongWords.map((w) => (
                    <div
                      key={w.id}
                      className="bg-white rounded-xl border border-slate-200 p-2.5 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-tc font-bold text-base text-slate-900">
                          {w.rawWord}
                        </span>{' '}
                        <span className="text-xs text-slate-500">
                          ({w.pinyin} · <span className="font-tc">{w.zhuyin}</span>)
                        </span>
                        <div className="text-xs text-emerald-800 font-medium">
                          {getDisplayMeaning(w)}
                        </div>
                      </div>
                      <button
                        onClick={() => speakTaiwanMandarin(w.traditional)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
              >
                <RotateCcw className="w-4 h-4" /> Thi lại đề ngẫu nhiên mới
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        ) : (
          /* Active Exam Question */
          currentQuestion && (
            <div className="space-y-5">
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>
                  Câu hỏi {currentIdx + 1} / {examQuestions.length}
                </span>
                <span className="text-emerald-700">
                  Số câu đúng hiện tại: {score} / {currentIdx + (selectedId ? 1 : 0)} (Cần {requiredScore} câu)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${((currentIdx + 1) / examQuestions.length) * 100}%` }}
                />
              </div>

              {/* Prompt */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-center space-y-2">
                {currentQType === 'hanzi-to-meaning' && (
                  <>
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      Phần Đọc Từ — Chọn nghĩa đúng của từ Phồn thể
                    </span>
                    <div className="flex items-center justify-center gap-3 pt-1">
                      <h2 className="font-tc text-5xl font-bold text-slate-900">
                        {currentQuestion.rawWord}
                      </h2>
                      <button
                        onClick={() => speakTaiwanMandarin(currentQuestion.traditional)}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-red-600 hover:bg-red-50"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600">
                      {currentQuestion.pinyin} ·{' '}
                      <span className="font-tc text-amber-900">{currentQuestion.zhuyin}</span>
                    </p>
                  </>
                )}

                {currentQType === 'audio-to-hanzi' && (
                  <>
                    <span className="text-[11px] font-bold uppercase text-amber-700">
                      Phần Nghe — Nghe phát âm Đài Loan và chọn đúng chữ Phồn thể
                    </span>
                    <div className="py-2">
                      <button
                        onClick={() => speakTaiwanMandarin(currentQuestion.traditional, 0.85)}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
                      >
                        <Volume2 className="w-5 h-5" /> Nghe lại phát âm (zh-TW)
                      </button>
                    </div>
                  </>
                )}

                {currentQType === 'meaning-to-hanzi' && (
                  <>
                    <span className="text-[11px] font-bold uppercase text-indigo-700">
                      Phần Phản Xạ Từ — Chọn chữ Phồn thể ứng với nghĩa sau
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 pt-1">
                      {getDisplayMeaning(currentQuestion)}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Âm Hán Việt: {currentQuestion.hanViet.toUpperCase()} · Từ loại: {currentQuestion.pos}
                    </p>
                  </>
                )}
              </div>

              {/* 4 Choices */}
              <div className="grid grid-cols-1 gap-2.5">
                {options.map((opt) => {
                  const isChosen = selectedId === opt.id;
                  const isCorrect = opt.id === currentQuestion.id;
                  let style =
                    'bg-white border-slate-200 text-slate-800 hover:border-amber-400 hover:bg-amber-50/30';
                  if (selectedId) {
                    if (isCorrect) {
                      style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                    } else if (isChosen) {
                      style = 'bg-rose-50 border-rose-300 text-rose-900';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleChooseOption(opt.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${style}`}
                    >
                      {currentQType === 'hanzi-to-meaning' ? (
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

                      {selectedId && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {selectedId && isChosen && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedId && (
                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                  >
                    {currentIdx + 1 < examQuestions.length
                      ? 'Câu tiếp theo →'
                      : 'Nộp bài & Xem kết quả xác nhận 🏆'}
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

