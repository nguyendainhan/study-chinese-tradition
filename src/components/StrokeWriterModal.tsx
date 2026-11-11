import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { Play, PenTool, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';

interface StrokeWriterProps {
  word: string;
  pinyin: string;
  zhuyin: string;
  meaning: string;
  radicalInfo: string;
  mnemonic: string;
}

export const StrokeWriterPanel: React.FC<StrokeWriterProps> = ({
  word,
  pinyin,
  zhuyin,
  meaning,
  radicalInfo,
  mnemonic,
}) => {
  const chars = Array.from(word).filter((ch) => /[\u4e00-\u9fff]/.test(ch));
  const [selectedChar, setSelectedChar] = useState<string>(chars[0] || '臺');
  const [mode, setMode] = useState<'animate' | 'quiz'>('animate');
  const [statusMsg, setStatusMsg] = useState<string>('Bấm "Xem nét mẫu" hoặc "Tự tay tập viết"');
  const [mistakes, setMistakes] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  useEffect(() => {
    const newChars = Array.from(word).filter((ch) => /[\u4e00-\u9fff]/.test(ch));
    if (newChars.length > 0) {
      setSelectedChar(newChars[0]);
    }
  }, [word]);

  useEffect(() => {
    if (!containerRef.current || !selectedChar) return;
    containerRef.current.innerHTML = '';
    setCompleted(false);
    setMistakes(0);

    const writer = HanziWriter.create(containerRef.current, selectedChar, {
      width: 220,
      height: 220,
      padding: 16,
      showOutline: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 180,
      strokeColor: '#0f172a',
      radicalColor: '#dc2626',
      outlineColor: '#cbd5e1',
      drawingColor: '#2563eb',
      drawingWidth: 18,
      showHintAfterMisses: 2,
    });

    writerRef.current = writer;

    if (mode === 'animate') {
      setStatusMsg(`Đang hiển thị chữ「${selectedChar}」— Màu đỏ là bộ thủ/nét chính`);
      writer.animateCharacter();
    } else {
      startQuiz(writer, selectedChar);
    }
  }, [selectedChar, mode]);

  const startQuiz = (writerInstance: HanziWriter, char: string) => {
    setCompleted(false);
    setMistakes(0);
    setStatusMsg(`Hãy dùng chuột hoặc ngón tay viết từng nét chữ「${char}」vào ô vuông!`);
    writerInstance.quiz({
      onMistake: () => {
        setMistakes((prev) => prev + 1);
        setStatusMsg('Chưa đúng thứ tự hoặc hướng nét, hãy thử lại theo gợi ý màu xanh!');
      },
      onCorrectStroke: (strokeData) => {
        setStatusMsg(`Chính xác nét thứ ${strokeData.strokeNum + 1}! Tiếp tục nét tiếp theo...`);
      },
      onComplete: (summaryData) => {
        setCompleted(true);
        setStatusMsg(
          `Tuyệt vời! Bạn đã viết完 chữ「${char}」với ${summaryData.totalMistakes} lỗi sai.`
        );
      },
    });
  };

  const handleReplay = () => {
    if (!writerRef.current) return;
    if (mode === 'animate') {
      writerRef.current.animateCharacter();
    } else {
      startQuiz(writerRef.current, selectedChar);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-200/80 shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Sparkles className="w-3.5 h-3.5" /> Luyện viết chữ Phồn thể & Chiết tự
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Thứ tự nét bút: <span className="font-tc text-red-700">{word}</span> ({pinyin} · {zhuyin})
          </h3>
        </div>

        {/* Character selector tabs */}
        <div className="flex items-center gap-1.5">
          {chars.map((ch, idx) => (
            <button
              key={`${ch}-${idx}`}
              onClick={() => setSelectedChar(ch)}
              className={`w-11 h-11 rounded-xl font-tc text-xl font-bold transition-all border ${
                selectedChar === ch
                  ? 'bg-red-600 text-white border-red-600 shadow-sm scale-105'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Tianzige Canvas */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative rounded-2xl border-2 border-amber-600/40 tianzige-grid shadow-inner p-1">
            <div ref={containerRef} className="cursor-crosshair select-none" />
          </div>

          <div className="flex items-center gap-2 mt-3 w-full justify-center">
            <button
              onClick={() => {
                setMode('animate');
                writerRef.current?.animateCharacter();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                mode === 'animate'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Play className="w-3.5 h-3.5" /> Xem nét mẫu
            </button>

            <button
              onClick={() => setMode('quiz')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                mode === 'quiz'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" /> Tự tay tập viết
            </button>

            <button
              onClick={handleReplay}
              title="Làm lại"
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Breakdown & Mnemonics */}
        <div className="md:col-span-7 space-y-3">
          <div
            className={`p-3.5 rounded-xl border text-sm flex items-start gap-2.5 ${
              completed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <CheckCircle2
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                completed ? 'text-emerald-600' : 'text-amber-600'
              }`}
            />
            <div>
              <p className="font-semibold">{statusMsg}</p>
              {mode === 'quiz' && (
                <p className="text-xs opacity-80 mt-0.5">
                  Số lần lệch nét: <strong>{mistakes}</strong> (Nếu quên nét, viết sai 2 lần sẽ hiện gợi ý)
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Nghĩa tiếng Việt</span>
              <p className="text-sm font-semibold text-slate-800">{meaning}</p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Cấu tạo Bộ thủ</span>
              <p className="text-sm text-slate-700">{radicalInfo}</p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Mẹo nhớ chữ Phồn thể (Chiết tự)</span>
              <p className="text-sm text-slate-700 leading-relaxed">{mnemonic}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

