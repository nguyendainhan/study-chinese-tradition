import React, { useState, useEffect, useMemo } from 'react';
import { RICH_READING_PASSAGES, RICH_GRAMMAR_LIST } from '../data/readingAndGrammarData';
import { Tocfl8000Word } from './Tocfl8000StudySection';
import { speakTaiwanMandarin } from '../utils/speech';
import {
  CloudSavedText,
  fetchSavedTextsFromCloud,
  saveTextNoteToCloud,
  getCurrentUserAccount,
} from '../utils/userAccountDb';
import {
  autoGeneratePinyinAndZhuyin,
  autoTranslateChineseToVietnamese,
} from '../utils/autoChineseHelper';
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  GraduationCap,
  Wand2,
  Search,
  Filter,
  Loader2,
  BookmarkPlus,
} from 'lucide-react';

interface IntermediateB1SectionProps {
  showZhuyin: boolean;
}

const LEVEL_COLORS: Record<string, string> = {
  novice1: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  novice2: 'bg-teal-100 text-teal-900 border-teal-300',
  level1: 'bg-blue-100 text-blue-900 border-blue-300',
  level2: 'bg-amber-100 text-amber-900 border-amber-300',
  level3: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  level4: 'bg-purple-100 text-purple-900 border-purple-300',
  level5: 'bg-rose-100 text-rose-900 border-rose-300',
};

export const IntermediateB1Section: React.FC<IntermediateB1SectionProps> = ({ showZhuyin }) => {
  const [tocflWords, setTocflWords] = useState<Tocfl8000Word[]>([]);
  const [subTab, setSubTab] = useState<'passages' | 'smart-reader' | 'grammar'>('passages');

  // Reading passages state
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [selectedPassageId, setSelectedPassageId] = useState<string>(RICH_READING_PASSAGES[0].id);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showPinyinReading, setShowPinyinReading] = useState<boolean>(true);

  // Pop-up word inspector state
  const [inspectedWord, setInspectedWord] = useState<{
    traditional: string;
    pinyin: string;
    zhuyin: string;
    hanViet: string;
    vietnamese: string;
    english: string;
    levelTag: string;
    contextLabel: string;
  } | null>(null);
  const [isTranslatingWord, setIsTranslatingWord] = useState<boolean>(false);

  // Smart Reader custom text state & Supabase formosa_saved_texts notebook
  const [customText, setCustomText] = useState<string>(
    '剛來臺灣留學的時候，我花了一個月才適應這裡的天氣與飲食習慣。平常除了在大學圖書館讀書以外，週末我也常跟臺灣朋友搭捷運去逛夜市、喝珍珠奶茶。現在我已經考過華語測驗進階級，打算明年申請獎學金！'
  );
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [savedTexts, setSavedTexts] = useState<CloudSavedText[]>([]);

  // Grammar filter & quiz state
  const [grammarLevelFilter, setGrammarLevelFilter] = useState<string>('ALL');
  const [grammarSearch, setGrammarSearch] = useState<string>('');
  const [grammarQuizAnswers, setGrammarQuizAnswers] = useState<Record<string, number>>({});

  const activeUsername = getCurrentUserAccount()?.username || 'guest';

  useEffect(() => {
    fetch('/tocfl_8000_full.json')
      .then((r) => r.json())
      .then((data) => {
        setTocflWords(data.words || []);
      })
      .catch(() => {});

    fetchSavedTextsFromCloud(activeUsername).then((rows) => {
      setSavedTexts(rows);
    });
  }, [activeUsername]);

  // Fast lookup map from traditional Chinese word -> Tocfl8000Word
  const wordMap = useMemo(() => {
    const map = new Map<string, Tocfl8000Word>();
    for (const w of tocflWords) {
      if (!map.has(w.traditional)) {
        map.set(w.traditional, w);
      }
    }
    return map;
  }, [tocflWords]);

  // Greedy longest-match tokenizer using the 7,517 TOCFL dictionary
  const tokenizeChineseText = (text: string) => {
    const tokens: { text: string; match?: Tocfl8000Word }[] = [];
    let i = 0;
    while (i < text.length) {
      let matchedWord: Tocfl8000Word | undefined;
      let matchedLen = 1;

      for (let len = Math.min(5, text.length - i); len >= 1; len--) {
        const sub = text.slice(i, i + len);
        const found = wordMap.get(sub);
        if (found) {
          matchedWord = found;
          matchedLen = len;
          break;
        }
      }

      tokens.push({
        text: text.slice(i, i + matchedLen),
        match: matchedWord,
      });
      i += matchedLen;
    }
    return tokens;
  };

  const handleInspectToken = async (tokenText: string, match?: Tocfl8000Word) => {
    if (!/[\u4e00-\u9fff]/.test(tokenText)) return;
    speakTaiwanMandarin(tokenText, 0.9);

    if (match) {
      setInspectedWord({
        traditional: match.traditional,
        pinyin: match.pinyin,
        zhuyin: match.zhuyin,
        hanViet: match.hanViet,
        vietnamese: match.vietnamese,
        english: match.english,
        levelTag: match.levelTag,
        contextLabel: match.contextLabel,
      });

      if (!match.vietnamese) {
        setIsTranslatingWord(true);
        const res = await autoTranslateChineseToVietnamese(match.traditional);
        setIsTranslatingWord(false);
        setInspectedWord((prev) =>
          prev && prev.traditional === match.traditional
            ? { ...prev, vietnamese: res.meaning }
            : prev
        );
      }
    } else {
      const { pinyin, zhuyin } = autoGeneratePinyinAndZhuyin(tokenText);
      setInspectedWord({
        traditional: tokenText,
        pinyin,
        zhuyin,
        hanViet: '—',
        vietnamese: '',
        english: '',
        levelTag: 'Từ mở rộng',
        contextLabel: 'Ngoài bảng TOCFL',
      });
      setIsTranslatingWord(true);
      const res = await autoTranslateChineseToVietnamese(tokenText);
      setIsTranslatingWord(false);
      setInspectedWord((prev) =>
        prev && prev.traditional === tokenText
          ? { ...prev, vietnamese: res.meaning, hanViet: res.hanViet }
          : prev
      );
    }
  };

  const filteredPassages = RICH_READING_PASSAGES.filter(
    (p) => levelFilter === 'ALL' || p.levelCode === levelFilter
  );
  const activePassage =
    filteredPassages.find((p) => p.id === selectedPassageId) ||
    filteredPassages[0] ||
    RICH_READING_PASSAGES[0];

  const filteredGrammar = RICH_GRAMMAR_LIST.filter((g) => {
    const matchLevel = grammarLevelFilter === 'ALL' || g.levelCode === grammarLevelFilter;
    const q = grammarSearch.trim().toLowerCase();
    if (!q) return matchLevel;
    return (
      matchLevel &&
      (g.pattern.toLowerCase().includes(q) ||
        g.meaning.toLowerCase().includes(q) ||
        g.explanation.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q))
    );
  });

  const customTokens = useMemo(
    () => tokenizeChineseText(customText),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customText, wordMap]
  );

  return (
    <div className="space-y-6">
      {/* Header Banner + Mode Switcher */}
      <div className="bg-gradient-to-r from-indigo-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full">
              <GraduationCap className="w-4 h-4 text-amber-300" /> Kết nối trực tiếp Kho 7.517 Từ TOCFL
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              Trung Tâm Đọc Hiểu Phân Cấp & Ngữ Pháp Đương Đại (Novice → B2)
            </h2>
            <p className="text-indigo-100 text-sm mt-1 max-w-2xl">
              Bấm vào <strong>bất kỳ từ nào</strong> trong bài đọc để tra ngay nghĩa Tiếng Việt, Âm Hán Việt, Chú âm ㄅㄆㄇㄈ và cấp độ TOCFL. Hoặc tự dán văn bản của bạn vào <strong>Máy Đọc Thông Minh</strong>!
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setSubTab('passages')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                subTab === 'passages'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <BookOpen className="w-4 h-4" /> 1. Bài đọc TOCFL (Novice → B2)
            </button>

            <button
              onClick={() => setSubTab('smart-reader')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                subTab === 'smart-reader'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Wand2 className="w-4 h-4" /> 2. Máy Đọc & Bắt Từ TOCFL
            </button>

            <button
              onClick={() => setSubTab('grammar')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                subTab === 'grammar'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Sparkles className="w-4 h-4" /> 3. Kho Ngữ Pháp Đương Đại 1–4
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: GRADED READING PASSAGES (NOVICE -> A1 -> A2 -> B1 -> B2) */}
      {subTab === 'passages' && (
        <div className="space-y-6">
          {/* Passage Selector Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold uppercase text-slate-400 mr-1">
                  Lọc cấp độ:
                </span>
                {[
                  { id: 'ALL', label: 'Tất cả (6 bài)' },
                  { id: 'novice', label: '準備級 (Novice)' },
                  { id: 'a1', label: '入門級 (A1)' },
                  { id: 'a2', label: '基礎級 (A2)' },
                  { id: 'b1', label: '進階級 (B1)' },
                  { id: 'b2', label: '高階級 (B2)' },
                ].map((lv) => (
                  <button
                    key={lv.id}
                    onClick={() => {
                      setLevelFilter(lv.id);
                      const first = RICH_READING_PASSAGES.find(
                        (p) => lv.id === 'ALL' || p.levelCode === lv.id
                      );
                      if (first) setSelectedPassageId(first.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      levelFilter === lv.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {lv.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPinyinReading((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                >
                  {showPinyinReading ? 'Ẩn Pinyin & Bản dịch' : 'Hiện Pinyin & Bản dịch'}
                </button>
              </div>
            </div>

            {/* Passage Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {filteredPassages.map((p) => {
                const isSelected = p.id === activePassage.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPassageId(p.id)}
                    className={`text-left p-3.5 rounded-2xl border transition ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {p.levelBadge}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-1">
                      {p.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{p.category}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Passage Interactive Reader + Dictionary Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                    {activePassage.levelBadge} · {activePassage.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{activePassage.title}</h3>
                </div>

                <button
                  onClick={() =>
                    speakTaiwanMandarin(
                      activePassage.paragraphs.map((p) => p.traditional).join(' '),
                      0.88
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
                >
                  <Volume2 className="w-4 h-4" /> Nghe đọc cả bài (zh-TW)
                </button>
              </div>

              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                💡 <strong>Mẹo học nhanh:</strong> Bấm trực tiếp vào <strong>bất kỳ từ tiếng Trung nào</strong> trong đoạn văn dưới đây để xem nghĩa Tiếng Việt, Âm Hán Việt, Chú âm ㄅㄆㄇㄈ và cấp độ TOCFL ở cột bên phải!
              </p>

              {/* Tokenized Paragraphs */}
              <div className="space-y-4">
                {activePassage.paragraphs.map((para, pIdx) => {
                  const tokens = tokenizeChineseText(para.traditional);
                  return (
                    <div
                      key={pIdx}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-tc text-xl leading-loose text-slate-900 flex flex-wrap items-baseline">
                          {tokens.map((tk, tIdx) => {
                            const isChinese = /[\u4e00-\u9fff]/.test(tk.text);
                            if (!isChinese) {
                              return <span key={tIdx}>{tk.text}</span>;
                            }
                            return (
                              <span
                                key={tIdx}
                                onClick={() => handleInspectToken(tk.text, tk.match)}
                                className="cursor-pointer px-0.5 rounded hover:bg-indigo-200/80 hover:text-indigo-950 transition border-b border-dotted border-slate-400 mx-0.5"
                                title={
                                  tk.match
                                    ? `${tk.match.pinyin} (${tk.match.levelTag})`
                                    : 'Bấm để tra từ'
                                }
                              >
                                {tk.text}
                              </span>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => speakTaiwanMandarin(para.traditional, 0.9)}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 shrink-0"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {showPinyinReading && (
                        <div className="pt-3 border-t border-slate-200/80 space-y-1">
                          <p className="text-xs text-indigo-700 font-medium">{para.pinyin}</p>
                          <p className="text-sm text-slate-700">{para.vietnamese}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Comprehension Questions */}
              <div className="pt-2 space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  Câu hỏi Đọc hiểu ({activePassage.questions.length} câu)
                </h4>

                {activePassage.questions.map((q, qIdx) => {
                  const key = `${activePassage.id}-${qIdx}`;
                  const chosen = answers[key];
                  const isAnswered = chosen !== undefined;
                  const isCorrect = chosen === q.correctIndex;

                  return (
                    <div
                      key={key}
                      className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3"
                    >
                      <p className="font-tc font-bold text-slate-900 text-sm md:text-base">
                        {qIdx + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const selectedThis = chosen === oIdx;
                          let btnStyle =
                            'bg-slate-50 border-slate-200 text-slate-800 hover:bg-indigo-50/50';
                          if (isAnswered) {
                            if (oIdx === q.correctIndex) {
                              btnStyle =
                                'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                            } else if (selectedThis) {
                              btnStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => setAnswers((prev) => ({ ...prev, [key]: oIdx }))}
                              className={`text-left p-3 rounded-xl border text-xs md:text-sm font-tc transition ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <div
                          className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Instant Pop-up Word Inspector */}
            <div className="lg:col-span-4 sticky top-28 space-y-4">
              <div className="bg-white rounded-3xl border border-indigo-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-indigo-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Từ điển Bấm-Để-Tra (TOCFL 8000)
                  </span>
                </div>

                {inspectedWord ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100">
                      <div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                          {inspectedWord.levelTag}
                        </span>
                        <h4 className="font-tc text-4xl font-bold text-slate-900 mt-1.5">
                          {inspectedWord.traditional}
                        </h4>
                      </div>
                      <button
                        onClick={() => speakTaiwanMandarin(inspectedWord.traditional)}
                        className="p-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <p className="font-bold text-indigo-700 text-base">
                        {inspectedWord.pinyin}{' '}
                        {showZhuyin && inspectedWord.zhuyin && (
                          <span className="font-tc text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg text-xs ml-1">
                            {inspectedWord.zhuyin}
                          </span>
                        )}
                      </p>
                      <p className="text-xs font-bold uppercase text-slate-500">
                        Âm Hán Việt: <span className="text-slate-900">{inspectedWord.hanViet}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Lĩnh vực: <strong>{inspectedWord.contextLabel}</strong>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                        <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                          🇻🇳 Nghĩa Tiếng Việt
                        </span>
                        {isTranslatingWord ? (
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang dịch...
                          </span>
                        ) : (
                          <p className="font-bold text-slate-900 text-sm mt-0.5">
                            {inspectedWord.vietnamese || `Hán Việt: ${inspectedWord.hanViet}`}
                          </p>
                        )}
                      </div>

                      {inspectedWord.english && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            🇬🇧 Từ điển CC-CEDICT
                          </span>
                          <p className="text-xs text-slate-700 mt-0.5">{inspectedWord.english}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs space-y-2">
                    <BookOpen className="w-8 h-8 mx-auto opacity-50" />
                    <p>
                      Hãy bấm vào <strong>bất kỳ từ chữ Hán nào</strong> trong bài đọc bên trái để xem phiên âm, Chú âm ㄅㄆㄇㄈ, âm Hán Việt và nghĩa!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SMART TOCFL 8000 TEXT ANALYZER & READER */}
      {subTab === 'smart-reader' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                Tự động phân tích 7.517 từ TOCFL
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1.5">
                Máy Đọc Văn Bản Phồn Thể & Tự Động Bắt Từ Vựng TOCFL 8000
              </h3>
              <p className="text-xs text-slate-500">
                Dán bất kỳ bài báo Đài Loan, đề thi đọc hiểu, tin nhắn LINE hoặc đoạn văn nào vào ô dưới đây. Máy sẽ tự động tách từ, tô màu theo cấp độ TOCFL và cho phép bấm vào từng từ để tra nghĩa!
              </p>
            </div>

            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Dán đoạn văn tiếng Trung Phồn thể bất kỳ vào đây..."
              className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 font-tc text-base focus:bg-white focus:outline-none focus:border-indigo-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                <span className="text-slate-400 mr-1">Chú giải màu cấp độ:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">Novice 1–2</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900">A1 (入門)</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900">A2 (基礎)</span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900">B1 (進階)</span>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900">B2 (高階)</span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900">C1 (流利)</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Đặt tên đoạn văn để lưu..."
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs w-44"
                />
                <button
                  onClick={async () => {
                    if (!customText.trim()) return;
                    const saved = await saveTextNoteToCloud(
                      activeUsername,
                      noteTitle || `Đoạn văn (${customText.slice(0, 12)}...)`,
                      customText
                    );
                    if (saved) {
                      setSavedTexts((prev) => [saved, ...prev]);
                      setNoteTitle('');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  <BookmarkPlus className="w-4 h-4" /> Lưu vào Sổ tay Database
                </button>
                <button
                  onClick={() => speakTaiwanMandarin(customText, 0.88)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  <Volume2 className="w-4 h-4" /> Nghe đọc đoạn văn này
                </button>
              </div>
            </div>

            {savedTexts.length > 0 && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 space-y-2">
                <div className="text-xs font-bold uppercase text-slate-500">
                  Sổ tay đoạn văn đã lưu trên Database (formosa_saved_texts — bấm để mở lại):
                </div>
                <div className="flex flex-wrap gap-2">
                  {savedTexts.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setCustomText(st.content)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-xs font-semibold text-slate-800"
                    >
                      📄 {st.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Highlighted Tokenized Output */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 font-tc text-2xl leading-loose flex flex-wrap items-baseline gap-1">
              {customTokens.map((tk, idx) => {
                const isChinese = /[\u4e00-\u9fff]/.test(tk.text);
                if (!isChinese) {
                  return <span key={idx}>{tk.text}</span>;
                }
                const colorClass = tk.match
                  ? LEVEL_COLORS[tk.match.levelCode] || 'bg-slate-200 text-slate-900'
                  : 'hover:bg-slate-200 text-slate-800';

                return (
                  <button
                    key={idx}
                    onClick={() => handleInspectToken(tk.text, tk.match)}
                    className={`px-1.5 py-0.5 rounded-lg border text-xl font-bold transition hover:scale-105 ${colorClass}`}
                  >
                    {tk.text}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Inspector */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-indigo-200 shadow-sm p-5 space-y-4">
            <span className="text-xs font-bold uppercase text-indigo-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Chi tiết từ vừa bấm
            </span>
            {inspectedWord ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-indigo-50/70 p-4 rounded-2xl">
                  <div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      {inspectedWord.levelTag}
                    </span>
                    <h4 className="font-tc text-4xl font-bold text-slate-900 mt-1.5">
                      {inspectedWord.traditional}
                    </h4>
                  </div>
                  <button
                    onClick={() => speakTaiwanMandarin(inspectedWord.traditional)}
                    className="p-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="font-bold text-indigo-700">
                  {inspectedWord.pinyin} · <span className="font-tc">{inspectedWord.zhuyin}</span>
                </p>
                <p className="text-xs font-bold uppercase text-slate-500">
                  Hán Việt: {inspectedWord.hanViet}
                </p>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Nghĩa Tiếng Việt
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {inspectedWord.vietnamese || `Hán Việt: ${inspectedWord.hanViet}`}
                  </p>
                </div>
                {inspectedWord.english && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      CC-CEDICT
                    </span>
                    <p className="text-xs text-slate-700 mt-0.5">{inspectedWord.english}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Bấm vào bất kỳ từ được tô màu nào ở bên trái để tra cứu ngay!
              </p>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: COMPREHENSIVE DANGDAI GRAMMAR LIBRARY (BOOKS 1 -> 4) */}
      {subTab === 'grammar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-600 mr-1" />
              {[
                { id: 'ALL', label: `Tất cả (${RICH_GRAMMAR_LIST.length} chủ điểm)` },
                { id: 'novice', label: '準備級 (Đương Đại 1)' },
                { id: 'a1', label: 'TOCFL A1 (Đương Đại 1–2)' },
                { id: 'a2', label: 'TOCFL A2 (Đương Đại 2)' },
                { id: 'b1', label: 'TOCFL B1 (Đương Đại 3–4)' },
                { id: 'b2', label: 'TOCFL B2 (Đương Đại 4)' },
              ].map((lv) => (
                <button
                  key={lv.id}
                  onClick={() => setGrammarLevelFilter(lv.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    grammarLevelFilter === lv.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lv.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm cấu trúc (把, 比, 既然, 才, 就...)"
                value={grammarSearch}
                onChange={(e) => setGrammarSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-64 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredGrammar.map((g) => {
              const chosenQuiz = grammarQuizAnswers[g.id];
              const isAnswered = chosenQuiz !== undefined;
              return (
                <div
                  key={g.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {g.levelBadge} · {g.book}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{g.category}</span>
                    </div>

                    <h4 className="font-tc text-xl font-bold text-indigo-950">{g.pattern}</h4>
                    <p className="text-xs font-semibold text-indigo-700">{g.pinyin}</p>
                    <p className="text-sm font-bold text-slate-900">{g.meaning}</p>

                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 font-mono">
                      📐 Công thức: <strong>{g.structure}</strong>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{g.explanation}</p>

                    <div className="space-y-2 pt-1">
                      {g.examples.map((ex, i) => (
                        <div
                          key={i}
                          onClick={() => speakTaiwanMandarin(ex.traditional)}
                          className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/80 cursor-pointer transition"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-tc font-bold text-slate-900 text-base">
                              {ex.traditional}
                            </p>
                            <Volume2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          </div>
                          <p className="text-xs text-indigo-700 mt-0.5">{ex.pinyin}</p>
                          <p className="text-xs text-slate-700 mt-0.5">→ {ex.vietnamese}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini Grammar Quiz inside each card */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-xs font-bold text-slate-800 font-tc">
                      ✍️ Bài tập nhanh: {g.quizQuestion.prompt}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {g.quizQuestion.options.map((opt, oIdx) => {
                        let style = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50';
                        if (isAnswered) {
                          if (oIdx === g.quizQuestion.correctIndex) {
                            style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                          } else if (chosenQuiz === oIdx) {
                            style = 'bg-rose-50 border-rose-300 text-rose-900';
                          }
                        }
                        return (
                          <button
                            key={oIdx}
                            onClick={() =>
                              setGrammarQuizAnswers((prev) => ({ ...prev, [g.id]: oIdx }))
                            }
                            className={`text-left p-2 rounded-xl border text-xs font-tc transition ${style}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
