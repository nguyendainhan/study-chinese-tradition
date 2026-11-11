import React, { useState, useEffect, useMemo } from 'react';
import { TAIWAN_VS_MAINLAND } from '../data/courseData';
import { FULL_TAIWAN_SCENARIOS, TAIWAN_SLANG_DICTIONARY } from '../data/taiwanDialoguesData';
import { Tocfl8000Word } from './Tocfl8000StudySection';
import { speakTaiwanMandarin } from '../utils/speech';
import {
  Volume2,
  Coffee,
  Sparkles,
  ArrowLeftRight,
  MessageSquareQuote,
  Flame,
  Layers,
  Search,
} from 'lucide-react';

interface TaiwanLifeSectionProps {
  showZhuyin: boolean;
}

const SUGAR_LEVELS = [
  { zh: '正常甜 (全糖)', py: 'zhèngcháng tián', zy: 'ㄓㄥˋ ㄔㄤˊ ㄊㄧㄢˊ', vi: '100% đường' },
  { zh: '少糖 (七分)', py: 'shǎotáng', zy: 'ㄕㄠˇ ㄊㄤˊ', vi: '70% đường' },
  { zh: '半糖 (五分)', py: 'bàntáng', zy: 'ㄅㄢˋ ㄊㄤˊ', vi: '50% đường' },
  { zh: '微糖 (三分)', py: 'wéitáng', zy: 'ㄨㄟˊ ㄊㄤˊ', vi: '30% đường (Phổ biến nhất)' },
  { zh: '無糖', py: 'wútáng', zy: 'ㄨˊ ㄊㄤˊ', vi: '0% đường' },
];

const ICE_LEVELS = [
  { zh: '正常冰', py: 'zhèngcháng bīng', zy: 'ㄓㄥˋ ㄔㄤˊ ㄅㄧㄥ', vi: '100% đá' },
  { zh: '少冰', py: 'shǎobīng', zy: 'ㄕㄠˇ ㄅㄧㄥ', vi: '70% đá' },
  { zh: '微冰', py: 'wéibīng', zy: 'ㄨㄟˊ ㄅㄧㄥ', vi: '30% đá' },
  { zh: '去冰', py: 'qùbīng', zy: 'ㄑㄩˋ ㄅㄧㄥ', vi: 'Không đá (Vẫn mát)' },
  { zh: '溫的 / 熱的', py: 'wēnde / rède', zy: 'ㄨㄣ ㄉㄜ˙ / ㄖㄜˋ ㄉㄜ˙', vi: 'Ấm / Nóng' },
];

const DRINKS = [
  { zh: '珍珠奶茶', py: 'zhēnzhū nǎichá', zy: 'ㄓㄣ ㄓㄨ ㄋㄞˇ ㄔㄚˊ', vi: 'Trà sữa trân châu' },
  { zh: '四季春加波霸', py: 'Sìjìchūn jiā bōbà', zy: 'ㄙˋ ㄐㄧˋ ㄔㄨㄣ ㄐㄧㄚ ㄅㄛ ㄅㄚˋ', vi: 'Trà Tứ Quý Xuân + trân châu to' },
  { zh: '黑糖珍珠鮮奶', py: 'hēitáng zhēnzhū xiānnǎi', zy: 'ㄏㄟ ㄊㄤˊ ㄓㄣ ㄓㄨ ㄒㄧㄢ ㄋㄞˇ', vi: 'Sữa tươi trân châu đường đen' },
  { zh: '翡翠檸檬綠茶', py: 'fěicuì níngméng lǜchá', zy: 'ㄈㄟˇ ㄘㄨㄟˋ ㄋㄧㄥˊ ㄇㄥˊ ㄌㄩˋ ㄔㄚˊ', vi: 'Trà xanh chanh tươi Đài Loan' },
];

// Sentence templates per TOCFL Context (任務領域) so any of the 7,517 words can be practiced in real Taiwanese conversation!
const CONTEXT_SENTENCE_TEMPLATES: Record<string, (word: string) => { zh: string; vi: string }> = {
  飲食: (w) => ({
    zh: `不好意思，請問這裡有賣「${w}」嗎？我要一份外帶。`,
    vi: `Xin lỗi cho hỏi ở đây có bán "${w}" không ạ? Cho mình 1 phần mang về.`,
  }),
  購物: (w) => ({
    zh: `請問這個「${w}」多少錢？可以刷悠遊卡或存載具嗎？`,
    vi: `Cho hỏi "${w}" này bao nhiêu tiền? Có quẹt thẻ EasyCard hoặc lưu mã 載具 được không?`,
  }),
  旅行: (w) => ({
    zh: `請問去「${w}」要搭幾號公車或是搭捷運？`,
    vi: `Xin hỏi đi "${w}" thì bắt xe buýt số mấy hoặc đi tàu MRT thế nào ạ?`,
  }),
  健康及身體照護: (w) => ({
    zh: `醫生您好，我最近覺得「${w}」不太舒服，想掛號看診。`,
    vi: `Chào bác sĩ, gần đây tôi thấy "${w}" không được khỏe lắm, muốn đăng ký khám.`,
  }),
  教育: (w) => ({
    zh: `我在臺灣的大學上課時，常常需要用到「${w}」。`,
    vi: `Khi đi học ở trường đại học Đài Loan, mình thường xuyên cần dùng đến "${w}".`,
  }),
  工作: (w) => ({
    zh: `在臺灣公司上班，處理「${w}」的時候要特別注意細節。`,
    vi: `Khi đi làm ở công ty Đài Loan, lúc xử lý "${w}" cần đặc biệt chú ý chi tiết.`,
  }),
};

export const TaiwanLifeSection: React.FC<TaiwanLifeSectionProps> = ({ showZhuyin }) => {
  const [subTab, setSubTab] = useState<'scenarios' | 'context-speak' | 'slang' | 'bubble-tea'>('scenarios');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(FULL_TAIWAN_SCENARIOS[0].id);

  // TOCFL 8000 Context Conversation Builder state
  const [tocflWords, setTocflWords] = useState<Tocfl8000Word[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('飲食');
  const [domainSearch, setDomainSearch] = useState<string>('');
  const [activePracticeWord, setActivePracticeWord] = useState<Tocfl8000Word | null>(null);

  // Bubble Tea state
  const [drinkIdx, setDrinkIdx] = useState<number>(0);
  const [sugarIdx, setSugarIdx] = useState<number>(3);
  const [iceIdx, setIceIdx] = useState<number>(3);
  const [bringCup, setBringCup] = useState<boolean>(true);

  useEffect(() => {
    fetch('/tocfl_8000_full.json')
      .then((r) => r.json())
      .then((data) => {
        const list: Tocfl8000Word[] = data.words || [];
        setTocflWords(list);
        const firstFood = list.find((w) => w.context === '飲食');
        if (firstFood) setActivePracticeWord(firstFood);
      })
      .catch(() => {});
  }, []);

  const domainWords = useMemo(() => {
    return tocflWords.filter((w) => {
      const matchDomain = w.context === selectedDomain;
      const q = domainSearch.trim().toLowerCase();
      if (!q) return matchDomain;
      return (
        matchDomain &&
        (w.traditional.includes(q) ||
          w.pinyin.toLowerCase().includes(q) ||
          w.vietnamese.toLowerCase().includes(q) ||
          w.english.toLowerCase().includes(q))
      );
    });
  }, [tocflWords, selectedDomain, domainSearch]);

  const activeScenario =
    FULL_TAIWAN_SCENARIOS.find((s) => s.id === selectedScenarioId) || FULL_TAIWAN_SCENARIOS[0];

  const drink = DRINKS[drinkIdx];
  const sugar = SUGAR_LEVELS[sugarIdx].zh.split(' ')[0];
  const sugarPy = SUGAR_LEVELS[sugarIdx].py;
  const ice = ICE_LEVELS[iceIdx].zh.split(' ')[0];
  const icePy = ICE_LEVELS[iceIdx].py;

  const generatedOrderZh = `不好意思，我要一杯大杯的${drink.zh}，${sugar}${ice}${
    bringCup ? '，我自己有帶環保杯' : ''
  }，謝謝！`;
  const generatedOrderPy = `Bù hǎoyìsi, wǒ yào yì bēi dà bēi de ${drink.py}, ${sugarPy} ${icePy}${
    bringCup ? ', wǒ zìjǐ yǒu dài huánbǎobēi' : ''
  }, xièxie!`;

  const generatedContextSentence = useMemo(() => {
    if (!activePracticeWord) return null;
    const fn = CONTEXT_SENTENCE_TEMPLATES[activePracticeWord.context];
    if (fn) {
      return fn(activePracticeWord.traditional);
    }
    return {
      zh: `不好意思，我想請問關於「${activePracticeWord.traditional}」的事情，謝謝！`,
      vi: `Xin lỗi làm phiền, mình muốn hỏi thăm về việc "${activePracticeWord.traditional}", cảm ơn!`,
    };
  }, [activePracticeWord]);

  return (
    <div className="space-y-6">
      {/* Header Banner + 4 Sub-Tabs */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 md:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Thực chiến đời sống Đài Loan (8 Tình huống & 12 Lĩnh vực)
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              Giao Tiếp Thực Tế Chuẩn Người Đài (臺灣生活與道地口語)
            </h2>
            <p className="text-teal-100 text-sm mt-1 max-w-2xl">
              Từ sân bay Đào Viên, 7-Eleven, gọi trà sữa, ăn sáng, thuê nhà, khám bệnh 健保卡 đến phỏng vấn xin việc và ghép câu trực tiếp từ 12 lĩnh vực trong file Excel 8000 từ!
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setSubTab('scenarios')}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                subTab === 'scenarios'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <MessageSquareQuote className="w-4 h-4" /> 1. 8 Tình huống Sinh tồn
            </button>

            <button
              onClick={() => setSubTab('context-speak')}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                subTab === 'context-speak'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Layers className="w-4 h-4" /> 2. Giao tiếp theo 12 Lĩnh vực Excel
            </button>

            <button
              onClick={() => setSubTab('slang')}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                subTab === 'slang'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Flame className="w-4 h-4" /> 3. Tiếng Lóng & Đài Ngữ (台語)
            </button>

            <button
              onClick={() => setSubTab('bubble-tea')}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                subTab === 'bubble-tea'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Coffee className="w-4 h-4" /> 4. Máy Order Trà Sữa
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: 8 REAL-LIFE SURVIVAL SCENARIOS IN TAIWAN */}
      {subTab === 'scenarios' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {FULL_TAIWAN_SCENARIOS.map((sc) => {
              const active = sc.id === activeScenario.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`text-left p-3.5 rounded-2xl border transition ${
                    active
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-teal-50/50'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {sc.badge}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm mt-1.5 leading-snug">{sc.title}</h4>
                </button>
              );
            })}
          </div>

          {/* Cultural Tip */}
          <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase text-teal-800">
                💡 Văn hóa & Kinh nghiệm thực tế tại Đài Loan ({activeScenario.title})
              </span>
              <span className="text-xs text-teal-700 font-medium">{activeScenario.category}</span>
            </div>
            <p className="text-sm text-teal-950 leading-relaxed">{activeScenario.culturalTip}</p>
          </div>

          {/* Key Phrases */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeScenario.keyPhrases.map((kp, i) => (
              <button
                key={i}
                onClick={() => speakTaiwanMandarin(kp.traditional)}
                className="text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200/80 transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-tc text-lg font-bold text-slate-900 group-hover:text-teal-700">
                    {kp.traditional}
                  </span>
                  <Volume2 className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                </div>
                <p className="text-xs text-teal-700 font-medium mt-0.5">
                  {kp.pinyin} {showZhuyin && `· ${kp.zhuyin}`}
                </p>
                <p className="text-xs text-slate-600 mt-1">{kp.meaning}</p>
              </button>
            ))}
          </div>

          {/* Dialogue Lines */}
          <div className="space-y-3">
            {activeScenario.dialogue.map((line, index) => {
              const isUser = line.role === 'user';
              return (
                <div
                  key={index}
                  onClick={() => speakTaiwanMandarin(line.traditional)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isUser
                      ? 'bg-teal-50/60 border-teal-200 ml-0 md:ml-10 hover:bg-teal-50'
                      : 'bg-slate-50 border-slate-200/90 mr-0 md:mr-10 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isUser ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {line.speaker}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-teal-700 font-medium">
                      <Volume2 className="w-3.5 h-3.5" /> Bấm để nghe (zh-TW)
                    </span>
                  </div>
                  <p className="font-tc text-xl font-bold text-slate-900 mt-1">
                    {line.traditional}
                  </p>
                  <p className="text-sm text-teal-800 font-medium mt-0.5">{line.pinyin}</p>
                  {showZhuyin && (
                    <p className="text-xs text-slate-500 font-tc mt-0.5">{line.zhuyin}</p>
                  )}
                  <p className="text-sm text-slate-700 mt-1.5">{line.vietnamese}</p>
                  {line.note && (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200/70 rounded-lg px-2.5 py-1 mt-2 inline-block">
                      📌 {line.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PRACTICE REAL CONVERSATION BY THE 12 DOMAINS IN THE EXCEL FILE */}
      {subTab === 'context-speak' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Trích xuất trực tiếp từ cột 任務領域 (Context) trong file Excel 8000 từ
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1.5">
                Luyện Phản Xạ Đặt Câu Giao Tiếp Theo 12 Lĩnh Vực Đời Sống
              </h3>
              <p className="text-xs text-slate-500">
                Chọn 1 lĩnh vực và bấm vào bất kỳ từ vựng nào bên dưới để ghép ngay vào mẫu câu giao tiếp thực tế với người Đài!
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm từ trong lĩnh vực này..."
                value={domainSearch}
                onChange={(e) => setDomainSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-56"
              />
            </div>
          </div>

          {/* 12 Domain Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { code: '飲食', label: '飲食 · Ẩm thực & Ăn uống' },
              { code: '購物', label: '購物 · Mua sắm' },
              { code: '旅行', label: '旅行 · Du lịch & Đi lại' },
              { code: '健康及身體照護', label: '健康 · Sức khỏe & Y tế' },
              { code: '日常生活', label: '日常生活 · Đời sống hàng ngày' },
              { code: '房屋與家庭、環境', label: '房屋 · Nhà cửa & Môi trường' },
              { code: '教育', label: '教育 · Trường học' },
              { code: '工作', label: '工作 · Công việc' },
              { code: '閒暇時間、娛樂', label: '娛樂 · Giải trí' },
              { code: '與他人的關係', label: '關係 · Quan hệ xã hội' },
              { code: '個人資料', label: '個人資料 · Thông tin cá nhân' },
            ].map((dom) => (
              <button
                key={dom.code}
                onClick={() => {
                  setSelectedDomain(dom.code);
                  const first = tocflWords.find((w) => w.context === dom.code);
                  if (first) setActivePracticeWord(first);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                  selectedDomain === dom.code
                    ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50'
                }`}
              >
                {dom.label}
              </button>
            ))}
          </div>

          {/* Active Generated Conversation Sentence */}
          {activePracticeWord && generatedContextSentence && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-700 text-white">
                    {activePracticeWord.levelTag}
                  </span>
                  <span className="font-tc font-bold text-teal-900">
                    Từ khóa: {activePracticeWord.rawWord} ({activePracticeWord.pinyin} ·{' '}
                    {activePracticeWord.zhuyin}) —{' '}
                    {activePracticeWord.vietnamese || activePracticeWord.english}
                  </span>
                </div>
                <p className="font-tc text-2xl font-bold text-slate-900 pt-1">
                  「{generatedContextSentence.zh}」
                </p>
                <p className="text-sm text-teal-900">{generatedContextSentence.vi}</p>
              </div>

              <button
                onClick={() => speakTaiwanMandarin(generatedContextSentence.zh, 0.9)}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition"
              >
                <Volume2 className="w-4 h-4" /> Nghe câu giao tiếp này
              </button>
            </div>
          )}

          {/* Word Grid for Selected Domain */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-96 overflow-y-auto p-1">
            {domainWords.map((w) => {
              const isSelected = activePracticeWord?.id === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    setActivePracticeWord(w);
                    speakTaiwanMandarin(w.traditional);
                  }}
                  className={`text-left p-3 rounded-2xl border transition ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                      : 'bg-slate-50 hover:bg-teal-50/50 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-tc text-lg font-bold">{w.rawWord}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {w.levelCode.toUpperCase()}
                    </span>
                  </div>
                  <p
                    className={`text-xs font-medium mt-0.5 ${
                      isSelected ? 'text-teal-100' : 'text-teal-700'
                    }`}
                  >
                    {w.pinyin}
                  </p>
                  <p
                    className={`text-xs truncate mt-1 ${
                      isSelected ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    {w.vietnamese || w.english || w.hanViet}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TAIWANESE SLANG, HOKKIEN (台語) & TAIWAN VS MAINLAND */}
      {subTab === 'slang' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                Khẩu ngữ bản xứ & Đài ngữ (台語)
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1.5">
                10 Cụm Từ Cửa Miệng & Tiếng Lóng Người Đài Dùng Hàng Ngày
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TAIWAN_SLANG_DICTIONARY.map((sl) => (
                <div
                  key={sl.id}
                  onClick={() => speakTaiwanMandarin(sl.exampleZh)}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-400 transition cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-tc text-2xl font-bold text-teal-900">{sl.word}</span>
                      <span className="text-xs font-bold text-teal-700">
                        ({sl.pinyin} {showZhuyin && `· ${sl.zhuyin}`})
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      {sl.origin}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900">{sl.meaning}</p>
                  <p className="text-xs text-slate-600">{sl.usageNote}</p>

                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 mt-2">
                    <div className="flex items-center justify-between">
                      <p className="font-tc font-bold text-slate-900 text-sm">{sl.exampleZh}</p>
                      <Volume2 className="w-4 h-4 text-teal-600 shrink-0" />
                    </div>
                    <p className="text-xs text-teal-700 mt-0.5">{sl.examplePy}</p>
                    <p className="text-xs text-slate-600 mt-0.5">→ {sl.exampleVi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Taiwan vs Mainland Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Bảng đối chiếu Từ vựng & Phát âm: Đài Loan vs. Đại Lục
                </h3>
                <p className="text-xs text-slate-500">
                  Tránh dùng nhầm từ phương ngữ Đại Lục khi nói chuyện với người Đài Loan
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-500 bg-slate-50">
                    <th className="py-3 px-4 rounded-tl-xl">Nghĩa tiếng Việt</th>
                    <th className="py-3 px-4 text-teal-800">Chuẩn Đài Loan (TOCFL) 🇹🇼</th>
                    <th className="py-3 px-4 text-slate-500">Phương ngữ Đại Lục</th>
                    <th className="py-3 px-4 rounded-tr-xl">Ghi chú sử dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {TAIWAN_VS_MAINLAND.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-medium text-slate-800">{row.meaning}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => speakTaiwanMandarin(row.taiwan.split(' ')[0])}
                          className="inline-flex items-center gap-1.5 font-tc font-bold text-teal-700 hover:text-teal-900"
                        >
                          {row.taiwan}
                          <Volume2 className="w-3.5 h-3.5 opacity-70" />
                        </button>
                      </td>
                      <td className="py-3 px-4 font-tc text-slate-500">{row.mainland}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: INTERACTIVE BUBBLE TEA ORDER SIMULATOR */}
      {subTab === 'bubble-tea' && (
        <div className="bg-white rounded-3xl border border-amber-200/90 shadow-sm p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Máy tập Order Trà Sữa Đài Loan (手搖飲點餐模擬器)
              </h3>
              <p className="text-xs text-slate-500">
                Chọn món, mức đường & mức đá để ghép thành câu order chuẩn người bản xứ và nghe phát âm
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <label className="text-xs font-bold uppercase text-slate-500 block mb-2">
                1. Chọn thức uống (飲品)
              </label>
              <div className="space-y-1.5">
                {DRINKS.map((d, idx) => (
                  <button
                    key={d.zh}
                    onClick={() => setDrinkIdx(idx)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                      drinkIdx === idx
                        ? 'bg-amber-600 text-white font-semibold shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200/70'
                    }`}
                  >
                    <span className="font-tc text-sm">{d.zh}</span>
                    <span className="opacity-85">{d.vi}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <label className="text-xs font-bold uppercase text-slate-500 block mb-2">
                2. Chọn độ ngọt (甜度)
              </label>
              <div className="space-y-1.5">
                {SUGAR_LEVELS.map((s, idx) => (
                  <button
                    key={s.zh}
                    onClick={() => setSugarIdx(idx)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition flex items-center justify-between ${
                      sugarIdx === idx
                        ? 'bg-amber-600 text-white font-semibold shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200/70'
                    }`}
                  >
                    <span className="font-tc text-sm">{s.zh}</span>
                    <span className="opacity-85">{s.vi}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <label className="text-xs font-bold uppercase text-slate-500 block mb-2">
                3. Chọn mức đá (冰塊)
              </label>
              <div className="space-y-1.5">
                {ICE_LEVELS.map((ic, idx) => (
                  <button
                    key={ic.zh}
                    onClick={() => setIceIdx(idx)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition flex items-center justify-between ${
                      iceIdx === idx
                        ? 'bg-amber-600 text-white font-semibold shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200/70'
                    }`}
                  >
                    <span className="font-tc text-sm">{ic.zh}</span>
                    <span className="opacity-85">{ic.vi}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2.5 py-0.5 rounded-full">
                  Câu gọi món của bạn
                </span>
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={bringCup}
                    onChange={(e) => setBringCup(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  Mang bình cá nhân (環保杯 - giảm 5 Đài tệ)
                </label>
              </div>
              <p className="text-xl md:text-2xl font-tc font-bold text-slate-900 pt-1">
                {generatedOrderZh}
              </p>
              <p className="text-sm text-amber-900 font-medium">{generatedOrderPy}</p>
            </div>

            <button
              onClick={() => speakTaiwanMandarin(generatedOrderZh, 0.9)}
              className="shrink-0 inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-3 rounded-2xl shadow-sm transition"
            >
              <Volume2 className="w-5 h-5" /> Nghe giọng Đài Loan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
