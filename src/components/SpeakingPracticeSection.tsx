import React, { useState } from 'react';
import { speakTaiwanMandarin } from '../utils/speech';
import { Mic, MicOff, Volume2, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface PracticeSentence {
  id: string;
  level: string;
  traditional: string;
  pinyin: string;
  zhuyin: string;
  vietnamese: string;
  situation: string;
}

const PRACTICE_SENTENCES: PracticeSentence[] = [
  {
    id: 'sp-1',
    level: 'TOCFL A1 · Giao tiếp cơ bản',
    traditional: '不好意思，請問捷運站在哪裡？',
    pinyin: 'Bù hǎoyìsi, qǐngwèn jiéyùuzhàn zài nǎlǐ?',
    zhuyin: 'ㄅㄨˋ ㄏㄠˇ ㄧˋ ㄙ˙，ㄑㄧㄥˇ ㄨㄣˋ ㄐㄧㄝˊ ㄩㄣˋ ㄓㄢˋ ㄗㄞˋ ㄋㄚˇ ㄌㄧˇ？',
    vietnamese: 'Xin lỗi cho hỏi thăm, trạm tàu điện ngầm MRT ở đâu ạ?',
    situation: 'Hỏi đường người Đài Loan trên phố'
  },
  {
    id: 'sp-2',
    level: 'Thực tế · Order Trà sữa',
    traditional: '我要一杯珍珠奶茶，微糖去冰，謝謝。',
    pinyin: 'Wǒ yào yì bēi zhēnzhū nǎichá, wéitáng qùbīng, xièxie.',
    zhuyin: 'ㄨㄛˇ ㄧㄠˋ ㄧˋ ㄅㄟ ㄓㄣ ㄓㄨ ㄋㄞˇ ㄔㄚˊ，ㄨㄟˊ ㄊㄤˊ ㄑㄩˋ ㄅㄧㄥ，ㄒㄧㄝˋ ㄒㄧㄝ˙。',
    vietnamese: 'Cho mình một ly trà sữa trân châu, 30% đường không đá, cảm ơn.',
    situation: 'Gọi đồ uống tại quán trà sữa Đài Loan'
  },
  {
    id: 'sp-3',
    level: 'Thực tế · Cửa hàng 7-Eleven',
    traditional: '我用悠遊卡付錢，發票存載具。',
    pinyin: 'Wǒ yòng Yōuyóukǎ fùqián, fāpiào cún zǎijù.',
    zhuyin: 'ㄨㄛˇ ㄩㄥˋ ㄧㄡ ㄧㄡˊ ㄎㄚˇ ㄈㄨˋ ㄑㄧㄢˊ，ㄈㄚ ㄆㄧㄠˋ ㄘㄨㄣˊ ㄗㄞˇ ㄐㄩˋ。',
    vietnamese: 'Mình thanh toán bằng thẻ EasyCard, hóa đơn lưu vào mã 載具.',
    situation: 'Thanh toán tại quầy thu ngân siêu thị/cửa hàng tiện lợi'
  },
  {
    id: 'sp-4',
    level: 'TOCFL B1 · Phỏng vấn & Học tập',
    traditional: '我已經通過華語文能力測驗進階級了。',
    pinyin: 'Wǒ yǐjīng tōngguò Huáyǔwén Nénglì Cèyàn Jìnjiējí le.',
    zhuyin: 'ㄨㄛˇ ㄧˇ ㄐㄧㄥ ㄊㄨㄥ ㄍㄨㄛˋ ㄏㄨㄚˊ ㄩˇ ㄨㄣˊ ㄋㄥˊ ㄌㄧˋ ㄘㄜˋ ㄧㄢˋ ㄐㄧㄣˋ ㄐㄧㄝ ㄐㄧˊ ㄌㄜ˙。',
    vietnamese: 'Tôi đã thi đỗ Kỳ thi năng lực Hoa ngữ (TOCFL) cấp Tiến giai (B1) rồi.',
    situation: 'Giới thiệu bản thân khi phỏng vấn xin học bổng/việc làm'
  }
];

export const SpeakingPracticeSection: React.FC<{ showZhuyin: boolean }> = ({ showZhuyin }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentSentence = PRACTICE_SENTENCES[selectedIdx];

  const calculateSimilarity = (target: string, spoken: string): number => {
    const cleanTarget = target.replace(/[，。？！、\s]/g, '');
    const cleanSpoken = spoken.replace(/[，。？！、\s]/g, '');
    if (!cleanSpoken) return 0;
    let matches = 0;
    for (const ch of cleanTarget) {
      if (cleanSpoken.includes(ch)) matches++;
    }
    return Math.min(100, Math.round((matches / cleanTarget.length) * 100));
  };

  const handleStartListening = () => {
    setErrorMsg(null);
    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setErrorMsg(
        'Trình duyệt của bạn chưa hỗ trợ Web Speech Recognition (Hãy dùng Chrome hoặc Edge để thu âm trực tiếp).'
      );
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognitionAPI as any)();
      recognition.lang = 'zh-TW';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setTranscript('');
      setMatchScore(null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setMatchScore(calculateSimilarity(currentSentence.traditional, text));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setErrorMsg('Không nhận diện được giọng nói. Hãy kiểm tra quyền Micro và thử lại nhé!');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setErrorMsg('Không thể khởi động Micro.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            <Sparkles className="w-3.5 h-3.5" /> Luyện phát âm giọng Đài Loan (zh-TW Speech AI)
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">
            Phòng Luyện Nói & Chấm Điểm Phát Âm Thực Chiến
          </h3>
          <p className="text-xs text-slate-500">
            Nghe mẫu giọng Đài Loan trước, sau đó bấm nút Micro và đọc to câu tiếng Trung để máy nhận diện chữ Phồn thể
          </p>
        </div>
      </div>

      {/* Sentence selector tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {PRACTICE_SENTENCES.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => {
              setSelectedIdx(idx);
              setTranscript('');
              setMatchScore(null);
              setErrorMsg(null);
            }}
            className={`text-left p-3.5 rounded-2xl border transition ${
              selectedIdx === idx
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-rose-50/50'
            }`}
          >
            <span
              className={`text-[11px] font-bold uppercase block ${
                selectedIdx === idx ? 'text-rose-100' : 'text-rose-600'
              }`}
            >
              {item.level}
            </span>
            <p className="font-tc font-bold text-sm truncate mt-1">{item.traditional}</p>
            <p
              className={`text-xs truncate mt-0.5 ${
                selectedIdx === idx ? 'text-rose-100' : 'text-slate-500'
              }`}
            >
              {item.situation}
            </p>
          </button>
        ))}
      </div>

      {/* Active Practice Box */}
      <div className="rounded-3xl bg-gradient-to-b from-rose-50/60 to-white border border-rose-200/80 p-6 text-center space-y-4">
        <span className="text-xs font-bold uppercase text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
          Tình huống: {currentSentence.situation}
        </span>

        <p className="font-tc text-3xl md:text-4xl font-bold text-slate-900 leading-snug">
          {currentSentence.traditional}
        </p>

        <div className="space-y-1">
          <p className="text-base font-semibold text-rose-700">{currentSentence.pinyin}</p>
          {showZhuyin && (
            <p className="text-sm font-tc text-slate-600">{currentSentence.zhuyin}</p>
          )}
          <p className="text-sm text-slate-700 pt-1">Nghĩa: “{currentSentence.vietnamese}”</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => speakTaiwanMandarin(currentSentence.traditional, 0.88)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-sm"
          >
            <Volume2 className="w-4 h-4" /> 1. Nghe mẫu giọng Đài
          </button>

          <button
            onClick={handleStartListening}
            disabled={isListening}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition shadow-sm ${
              isListening
                ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" /> Đang nghe bạn nói (zh-TW)...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" /> 2. Bấm để đọc thử
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="max-w-lg mx-auto p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {transcript && (
          <div className="max-w-lg mx-auto p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">
                Máy nhận diện giọng của bạn:
              </span>
              {matchScore !== null && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    matchScore >= 75
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Độ khớp: {matchScore}%
                </span>
              )}
            </div>
            <p className="font-tc text-2xl font-bold text-slate-900">{transcript}</p>
          </div>
        )}
      </div>
    </div>
  );
};

