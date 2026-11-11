import React, { useState } from 'react';
import { speakTaiwanMandarin } from '../utils/speech';
import { Volume2, Sparkles, Keyboard, HelpCircle } from 'lucide-react';

interface ZhuyinSymbol {
  zhuyin: string;
  pinyin: string;
  exampleChar: string;
  exampleWord: string;
  examplePinyin: string;
  meaning: string;
  group: 'initials' | 'medials' | 'finals';
}

const ZHUYIN_DATA: ZhuyinSymbol[] = [
  // 21 Thanh mẫu (Initials - 聲母)
  { zhuyin: 'ㄅ', pinyin: 'b', exampleChar: '爸', exampleWord: '爸爸', examplePinyin: 'bàba', meaning: 'Bố, ba', group: 'initials' },
  { zhuyin: 'ㄆ', pinyin: 'p', exampleChar: '朋', exampleWord: '朋友', examplePinyin: 'péngyǒu', meaning: 'Bạn bè', group: 'initials' },
  { zhuyin: 'ㄇ', pinyin: 'm', exampleChar: '媽', exampleWord: '媽媽', examplePinyin: 'māma', meaning: 'Mẹ, má', group: 'initials' },
  { zhuyin: 'ㄈ', pinyin: 'f', exampleChar: '發', exampleWord: '發票', examplePinyin: 'fāpiào', meaning: 'Hóa đơn Đài Loan', group: 'initials' },
  { zhuyin: 'ㄉ', pinyin: 'd', exampleChar: '大', exampleWord: '大學', examplePinyin: 'dàxué', meaning: 'Đại học', group: 'initials' },
  { zhuyin: 'ㄊ', pinyin: 't', exampleChar: '臺', exampleWord: '臺灣', examplePinyin: 'Táiwān', meaning: 'Đài Loan', group: 'initials' },
  { zhuyin: 'ㄋ', pinyin: 'n', exampleChar: '奶', exampleWord: '奶茶', examplePinyin: 'nǎichá', meaning: 'Trà sữa', group: 'initials' },
  { zhuyin: 'ㄌ', pinyin: 'l', exampleChar: '來', exampleWord: '老闆', examplePinyin: 'lǎobǎn', meaning: 'Ông chủ', group: 'initials' },
  { zhuyin: 'ㄍ', pinyin: 'g', exampleChar: '高', exampleWord: '高鐵', examplePinyin: 'gāotiě', meaning: 'Tàu cao tốc (THSR)', group: 'initials' },
  { zhuyin: 'ㄎ', pinyin: 'k', exampleChar: '咖', exampleWord: '咖啡', examplePinyin: 'kāfēi', meaning: 'Cà phê', group: 'initials' },
  { zhuyin: 'ㄏ', pinyin: 'h', exampleChar: '好', exampleWord: '好吃', examplePinyin: 'hǎochī', meaning: 'Ngon miệng', group: 'initials' },
  { zhuyin: 'ㄐ', pinyin: 'j', exampleChar: '捷', exampleWord: '捷運', examplePinyin: 'jiéyùn', meaning: 'Tàu điện MRT', group: 'initials' },
  { zhuyin: 'ㄑ', pinyin: 'q', exampleChar: '請', exampleWord: '請問', examplePinyin: 'qǐngwèn', meaning: 'Xin hỏi', group: 'initials' },
  { zhuyin: 'ㄒ', pinyin: 'x', exampleChar: '謝', exampleWord: '謝謝', examplePinyin: 'xièxie', meaning: 'Cảm ơn', group: 'initials' },
  { zhuyin: 'ㄓ', pinyin: 'zh', exampleChar: '珍', exampleWord: '珍珠', examplePinyin: 'zhēnzhū', meaning: 'Trân châu', group: 'initials' },
  { zhuyin: 'ㄔ', pinyin: 'ch', exampleChar: '吃', exampleWord: '吃飯', examplePinyin: 'chīfàn', meaning: 'Ăn cơm', group: 'initials' },
  { zhuyin: 'ㄕ', pinyin: 'sh', exampleChar: '師', exampleWord: '老師', examplePinyin: 'lǎoshī', meaning: 'Giáo viên', group: 'initials' },
  { zhuyin: 'ㄖ', pinyin: 'r', exampleChar: '熱', exampleWord: '熱鬧', examplePinyin: 'rènào', meaning: 'Nhộn nhịp', group: 'initials' },
  { zhuyin: 'ㄗ', pinyin: 'z', exampleChar: '早', exampleWord: '早安', examplePinyin: 'zǎoān', meaning: 'Chào buổi sáng', group: 'initials' },
  { zhuyin: 'ㄘ', pinyin: 'c', exampleChar: '餐', exampleWord: '餐廳', examplePinyin: 'cāntīng', meaning: 'Nhà hàng', group: 'initials' },
  { zhuyin: 'ㄙ', pinyin: 's', exampleChar: '四', exampleWord: '四季', examplePinyin: 'sìjì', meaning: 'Bốn mùa', group: 'initials' },

  // 3 Giới âm (Medials - 介音)
  { zhuyin: 'ㄧ', pinyin: 'i / yi', exampleChar: '一', exampleWord: '衣服', examplePinyin: 'yīfú', meaning: 'Quần áo', group: 'medials' },
  { zhuyin: 'ㄨ', pinyin: 'u / wu', exampleChar: '五', exampleWord: '午餐', examplePinyin: 'wǔcān', meaning: 'Bữa trưa', group: 'medials' },
  { zhuyin: 'ㄩ', pinyin: 'ü / yu', exampleChar: '雨', exampleWord: '雨傘', examplePinyin: 'yǔsǎn', meaning: 'Cái ô (dù)', group: 'medials' },

  // 13 Vận mẫu (Finals - 韻母)
  { zhuyin: 'ㄚ', pinyin: 'a', exampleChar: '阿', exampleWord: '阿姨', examplePinyin: 'āyí', meaning: 'Cô, dì', group: 'finals' },
  { zhuyin: 'ㄛ', pinyin: 'o', exampleChar: '喔', exampleWord: '好喔', examplePinyin: 'hǎo ō', meaning: 'Ok nhé (khẩu ngữ Đài)', group: 'finals' },
  { zhuyin: 'ㄜ', pinyin: 'e', exampleChar: '餓', exampleWord: '肚子餓', examplePinyin: 'dùzi è', meaning: 'Đói bụng', group: 'finals' },
  { zhuyin: 'ㄝ', pinyin: 'ê / ie', exampleChar: '耶', exampleWord: '夜市', examplePinyin: 'yèshì', meaning: 'Chợ đêm', group: 'finals' },
  { zhuyin: 'ㄞ', pinyin: 'ai', exampleChar: '愛', exampleWord: '愛心', examplePinyin: 'àixīn', meaning: 'Tấm lòng nhân ái', group: 'finals' },
  { zhuyin: 'ㄟ', pinyin: 'ei', exampleChar: '杯', exampleWord: '環保杯', examplePinyin: 'huánbǎobēi', meaning: 'Bình nước cá nhân', group: 'finals' },
  { zhuyin: 'ㄠ', pinyin: 'ao', exampleChar: '包', exampleWord: '小籠包', examplePinyin: 'xiǎolóngbāo', meaning: 'Bánh bao súp', group: 'finals' },
  { zhuyin: 'ㄡ', pinyin: 'ou', exampleChar: '悠', exampleWord: '悠遊卡', examplePinyin: 'Yōuyóukǎ', meaning: 'Thẻ EasyCard', group: 'finals' },
  { zhuyin: 'ㄢ', pinyin: 'an', exampleChar: '安', exampleWord: '安全', examplePinyin: 'ānquán', meaning: 'An toàn', group: 'finals' },
  { zhuyin: 'ㄣ', pinyin: 'en', exampleChar: '恩', exampleWord: '感恩', examplePinyin: 'gǎnēn', meaning: 'Biết ơn', group: 'finals' },
  { zhuyin: 'ㄤ', pinyin: 'ang', exampleChar: '幫', exampleWord: '幫忙', examplePinyin: 'bāngmáng', meaning: 'Giúp đỡ', group: 'finals' },
  { zhuyin: 'ㄥ', pinyin: 'eng', exampleChar: '冷', exampleWord: '冷氣', examplePinyin: 'lěngqì', meaning: 'Máy lạnh / Điều hòa', group: 'finals' },
  { zhuyin: 'ㄦ', pinyin: 'er', exampleChar: '二', exampleWord: '待會兒', examplePinyin: 'dāihuǐr', meaning: 'Một lát nữa', group: 'finals' },
];

const TONES_DATA = [
  { name: 'Thanh 1 (陰平)', mark: 'Không dấu', example: '媽 (ㄇㄚ)', pinyin: 'mā', desc: 'Đọc cao và ngang đều' },
  { name: 'Thanh 2 (陽平)', mark: 'ˊ', example: '麻 (ㄇㄚˊ)', pinyin: 'má', desc: 'Đọc lên giọng giống dấu sắc' },
  { name: 'Thanh 3 (上聲)', mark: 'ˇ', example: '馬 (ㄇㄚˇ)', pinyin: 'mǎ', desc: 'Đọc trầm xuống (người Đài đọc thanh 3 ngắn và nhẹ)' },
  { name: 'Thanh 4 (去聲)', mark: 'ˋ', example: '罵 (ㄇㄚˋ)', pinyin: 'mà', desc: 'Đọc dứt khoát từ cao xuống thấp' },
  { name: 'Thanh nhẹ (輕聲)', mark: '˙ (đặt đầu/trên)', example: '嗎 (ㄇㄚ˙)', pinyin: 'ma', desc: 'Trong Chú âm, dấu chấm thanh nhẹ đặt ở phía trước/trên' },
];

export const ZhuyinChartSection: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<ZhuyinSymbol>(ZHUYIN_DATA[0]);
  const [filterGroup, setFilterGroup] = useState<'all' | 'initials' | 'medials' | 'finals'>('all');

  const visibleSymbols =
    filterGroup === 'all'
      ? ZHUYIN_DATA
      : ZHUYIN_DATA.filter((item) => item.group === filterGroup);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 text-white rounded-3xl p-6 md:p-8 shadow-md">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full">
          <Keyboard className="w-3.5 h-3.5 text-amber-200" /> Nền tảng Tiếng Trung Đài Loan (TOCFL Band A)
        </span>
        <h2 className="text-2xl md:text-3xl font-bold mt-2">
          Bảng 37 Ký Hiệu Chú Âm Phù Hiệu (注音符號 ㄅㄆㄇㄈ)
        </h2>
        <p className="text-amber-100 text-sm md:text-base mt-1 max-w-3xl">
          100% người Đài Loan dùng <strong>ㄅㄆㄇㄈ (Bopomofo)</strong> để học phát âm và gõ phím điện thoại/máy tính.
          Biết Chú âm giúp bạn phát âm chuẩn xác hơn Pinyin và đọc được sách/biển hiệu có phiên âm tại Đài Loan!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive 37 Symbols Grid */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Bấm vào ký hiệu để nghe phát âm & xem từ mẫu
              </h3>
              <p className="text-xs text-slate-500">
                Gồm 21 Thanh mẫu (phụ âm đầu) · 3 Giới âm · 13 Vận mẫu (vần)
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Tất cả (37)' },
                { id: 'initials', label: 'Thanh mẫu (21)' },
                { id: 'medials', label: 'Giới âm (3)' },
                { id: 'finals', label: 'Vận mẫu (13)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterGroup(tab.id as typeof filterGroup)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    filterGroup === tab.id
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
            {visibleSymbols.map((sym) => {
              const isSelected = selectedSymbol.zhuyin === sym.zhuyin;
              return (
                <button
                  key={sym.zhuyin}
                  onClick={() => {
                    setSelectedSymbol(sym);
                    speakTaiwanMandarin(sym.exampleChar, 0.85);
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-600 shadow-md scale-105'
                      : 'bg-slate-50 hover:bg-amber-50 text-slate-800 border-slate-200/90'
                  }`}
                >
                  <span className="font-tc text-2xl font-bold">{sym.zhuyin}</span>
                  <span
                    className={`text-xs font-semibold mt-0.5 ${
                      isSelected ? 'text-amber-100' : 'text-slate-500'
                    }`}
                  >
                    {sym.pinyin}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Symbol Detail Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-amber-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              Chi tiết ký hiệu
            </span>
            <button
              onClick={() => speakTaiwanMandarin(selectedSymbol.exampleWord, 0.85)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
            >
              <Volume2 className="w-4 h-4" /> Nghe phát âm
            </button>
          </div>

          <div className="text-center py-6 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="font-tc text-6xl font-bold text-red-700">{selectedSymbol.zhuyin}</div>
            <p className="text-base font-bold text-slate-700 mt-2">
              Tương đương Pinyin: <span className="text-red-600">{selectedSymbol.pinyin}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Từ vựng mẫu dễ nhớ</span>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-tc text-3xl font-bold text-slate-900">
                  {selectedSymbol.exampleWord}
                </p>
                <p className="text-sm text-amber-800 font-medium">{selectedSymbol.examplePinyin}</p>
              </div>
              <button
                onClick={() => speakTaiwanMandarin(selectedSymbol.exampleWord)}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-amber-700 hover:bg-amber-50"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-700 pt-1 border-t border-slate-200/60">
              Nghĩa: {selectedSymbol.meaning}
            </p>
          </div>
        </div>
      </div>

      {/* 5 Tones in Taiwan Mandarin */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-bold text-slate-900">
            5 Thanh Điệu trong Chú Âm & Đặc trưng Giọng Đài Loan
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {TONES_DATA.map((t, i) => (
            <div
              key={i}
              onClick={() => speakTaiwanMandarin(t.example.split(' ')[0])}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 cursor-pointer transition space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800">{t.name}</span>
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="font-tc text-xl font-bold text-slate-900">{t.example}</p>
              <p className="text-xs font-semibold text-red-700">
                Dấu: {t.mark} ({t.pinyin})
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

