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
      setStatusMsg(`Chữ「${selectedChar}」— Nét màu đỏ là bộ thủ`);
      writer.animateCharacter();
    } else {
      startQuiz(writer, selectedChar);
    }
  }, [selectedChar, mode]);

  const startQuiz = (writerInstance: HanziWriter, char: string) => {
    setCompleted(false);
    setMistakes(0);
    setStatusMsg(`Viết từng nét chữ「${char}」vào ô vuông`);
    writerInstance.quiz({
      onMistake: () => {
        setMistakes((prev) => prev + 1);
        setStatusMsg('Chưa đúng thứ tự nét, hãy thử lại!');
      },
      onCorrectStroke: (strokeData) => {
        setStatusMsg(`Đúng nét ${strokeData.strokeNum + 1}!`);
      },
      onComplete: (summaryData) => {
        setCompleted(true);
        setStatusMsg(`Hoàn thành chữ「${char}」(${summaryData.totalMistakes} lỗi)`);
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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase text-amber-700">
            <Sparkles className="w-3.5 h-3.5" /> Luyện viết nét chữ
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            <span className="font-tc text-red-700 text-xl">{word}</span>{' '}
            <span className="text-xs font-normal text-slate-500">({pinyin})</span>
          </h3>
        </div>

        {/* Character selector tabs */}
        <div className="flex items-center gap-1.5">
          {chars.map((ch, idx) => (
            <button
              key={`${ch}-${idx}`}
              onClick={() => setSelectedChar(ch)}
              className={`w-10 h-10 rounded-xl font-tc text-lg font-bold transition-all border ${
                selectedChar === ch
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center">
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
            <Play className="w-3.5 h-3.5" /> Xem mẫu
          </button>

          <button
            onClick={() => setMode('quiz')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              mode === 'quiz'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" /> Tập viết
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

      <div
        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
          completed
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2
            className={`w-4 h-4 shrink-0 ${
              completed ? 'text-emerald-600' : 'text-amber-600'
            }`}
          />
          <span className="font-semibold">{statusMsg}</span>
        </div>
        {mode === 'quiz' && mistakes > 0 && (
          <span className="text-[11px] font-bold">Lỗi: {mistakes}</span>
        )}
      </div>
    </div>
  );
};

