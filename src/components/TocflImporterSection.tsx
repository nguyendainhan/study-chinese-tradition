import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { VocabItem, TrackId } from '../data/courseData';
import { TOCFL_8000_PACKS, TocflPack } from '../data/tocfl8000Packs';
import {
  autoGeneratePinyinAndZhuyin,
  autoTranslateChineseToVietnamese,
} from '../utils/autoChineseHelper';
import {
  Upload,
  FileSpreadsheet,
  Download,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Search,
  Sparkles,
  AlertCircle,
  Database,
  Wand2,
  PackagePlus,
  ClipboardPaste,
  Loader2,
} from 'lucide-react';

interface TocflImporterSectionProps {
  allVocab: VocabItem[];
  customVocab: VocabItem[];
  onImportVocab: (newItems: VocabItem[]) => void;
  onClearCustomVocab: () => void;
  onSelectWordToStudy: (word: VocabItem) => void;
}

function inferTrackFromLevel(levelStr: string): TrackId {
  const upper = levelStr.toUpperCase();
  if (
    upper.includes('B1') ||
    upper.includes('B2') ||
    upper.includes('BAND B') ||
    upper.includes('進階') ||
    upper.includes('高階')
  ) {
    return 'tocfl-b1';
  }
  if (
    upper.includes('ĐÀI') ||
    upper.includes('KHẨU NGỮ') ||
    upper.includes('LIFE') ||
    upper.includes('GIAO TIẾP') ||
    upper.includes('台語')
  ) {
    return 'taiwan-life';
  }
  return 'tocfl-a';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToVocabItem(row: Record<string, any>, index: number): VocabItem | null {
  const getField = (keys: string[]): string => {
    for (const k of Object.keys(row)) {
      const normalizedKey = k.trim().toLowerCase();
      if (
        keys.some(
          (target) =>
            normalizedKey === target.toLowerCase() ||
            normalizedKey.includes(target.toLowerCase())
        )
      ) {
        const val = row[k];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
    return '';
  };

  const traditional = getField([
    'traditional',
    'phồn thể',
    'phon the',
    'chữ hán',
    'hanzi',
    'word',
    'từ vựng',
    '詞彙',
    '繁體',
  ]);
  if (!traditional) return null;

  const autoPhonetics = autoGeneratePinyinAndZhuyin(traditional);
  const simplified = getField(['simplified', 'giản thể', 'gian the', '簡體']) || traditional;
  const pinyin = getField(['pinyin', 'phiên âm', 'phien am', '漢語拼音']) || autoPhonetics.pinyin;
  const zhuyin = getField(['zhuyin', 'bopomofo', 'chú âm', 'chu am', '注音']) || autoPhonetics.zhuyin;
  const hanViet = getField(['hanviet', 'hán việt', 'han viet', 'âm hán việt']) || '—';
  const meaning =
    getField(['meaning', 'nghĩa', 'nghia', 'vietnamese', 'tiếng việt', 'dịch nghĩa', '解釋']) ||
    'Chưa có nghĩa';
  const levelTag =
    getField(['level', 'leveltag', 'cấp độ', 'cap do', 'band', 'tocfl', '等級']) || 'TOCFL A1';
  const radicalInfo =
    getField(['radical', 'radicalinfo', 'bộ thủ', 'bo thu', '部首']) ||
    'Chữ Hán Phồn thể chuẩn Bộ Giáo dục Đài Loan';
  const mnemonic =
    getField(['mnemonic', 'mẹo nhớ', 'meo nho', 'chiết tự', 'ghi chú']) ||
    `Từ vựng thuộc danh mục ${levelTag}.`;

  const exTrad =
    getField(['example', 'example_traditional', 'ví dụ', 'vi du', 'câu ví dụ', '例句']) ||
    `我今天學習「${traditional}」這個詞。`;
  const exAuto = autoGeneratePinyinAndZhuyin(exTrad);

  return {
    id: `imported-${Date.now()}-${index}`,
    track: inferTrackFromLevel(levelTag),
    levelTag,
    traditional,
    simplified,
    pinyin,
    zhuyin,
    hanViet,
    meaning,
    radicalInfo,
    mnemonic,
    example: {
      traditional: exTrad,
      pinyin: exAuto.pinyin,
      zhuyin: exAuto.zhuyin,
      vietnamese: `Hôm nay tôi học từ "${traditional}" (${meaning}).`,
    },
  };
}

export const TocflImporterSection: React.FC<TocflImporterSectionProps> = ({
  allVocab,
  customVocab,
  onImportVocab,
  onClearCustomVocab,
  onSelectWordToStudy,
}) => {
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Smart Bulk Text Paste State
  const [smartPasteText, setSmartPasteText] = useState<string>(
    '夜市 - Chợ đêm Đài Loan\n高鐵 - Tàu cao tốc THSR\n居留證 - Thẻ cư trú ARC\n臭豆腐 - Đậu phụ thối\n打工 - Làm thêm part-time'
  );
  const [smartPasteLevel, setSmartPasteLevel] = useState<string>('TOCFL A2');
  const [isSmartProcessing, setIsSmartProcessing] = useState<boolean>(false);

  // Single Word Auto-Fill State
  const [newTrad, setNewTrad] = useState('');
  const [newPinyin, setNewPinyin] = useState('');
  const [newZhuyin, setNewZhuyin] = useState('');
  const [newHanViet, setNewHanViet] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newLevel, setNewLevel] = useState('TOCFL A1');
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  // Auto-generate Pinyin & Zhuyin whenever user types Chinese characters
  const handleTradInputChange = (val: string) => {
    setNewTrad(val);
    if (/[\u4e00-\u9fff]/.test(val)) {
      const { pinyin, zhuyin } = autoGeneratePinyinAndZhuyin(val);
      setNewPinyin(pinyin);
      setNewZhuyin(zhuyin);
    }
  };

  const handleAutoLookupSingleWord = async () => {
    if (!newTrad.trim()) return;
    setIsAutoFilling(true);
    try {
      const { pinyin, zhuyin } = autoGeneratePinyinAndZhuyin(newTrad);
      setNewPinyin(pinyin);
      setNewZhuyin(zhuyin);
      const translated = await autoTranslateChineseToVietnamese(newTrad);
      setNewHanViet(translated.hanViet);
      setNewMeaning(translated.meaning);
      setNewLevel(translated.level);
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Smart Paste Handler: user just pastes Chinese words (with or without meanings), we auto-generate Pinyin, Zhuyin, and meanings!
  const handleSmartPasteImport = async () => {
    const raw = smartPasteText.trim();
    if (!raw) return;
    setIsSmartProcessing(true);
    setStatusMessage(null);

    try {
      const lines = raw
        .split(/\r?\n|,|，|;|；/)
        .map((l) => l.trim())
        .filter(Boolean);

      const newItems: VocabItem[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Split by -, =, :, or tab if user provided meaning
        const parts = line.split(/\s*[-=:：\t]\s*/);
        const rawChinese = parts[0]?.trim() || '';
        const userMeaning = parts.slice(1).join(' - ').trim();

        // Extract Chinese characters
        const matchChinese = rawChinese.match(/[\u4e00-\u9fff]+/g);
        const traditional = matchChinese ? matchChinese.join('') : rawChinese;
        if (!traditional) continue;

        const { pinyin, zhuyin } = autoGeneratePinyinAndZhuyin(traditional);
        let meaning = userMeaning;
        let hanViet = '—';
        let detectedLevel = smartPasteLevel;

        if (!meaning) {
          const lookedUp = await autoTranslateChineseToVietnamese(traditional);
          meaning = lookedUp.meaning;
          hanViet = lookedUp.hanViet;
          detectedLevel = lookedUp.level;
        } else {
          const lookedUp = await autoTranslateChineseToVietnamese(traditional);
          if (lookedUp.hanViet !== '—') {
            hanViet = lookedUp.hanViet;
          }
        }

        const exTrad = `我正在學習「${traditional}」這個詞。`;
        const exPhon = autoGeneratePinyinAndZhuyin(exTrad);

        newItems.push({
          id: `smart-${Date.now()}-${i}`,
          track: inferTrackFromLevel(detectedLevel),
          levelTag: detectedLevel,
          traditional,
          simplified: traditional,
          pinyin,
          zhuyin,
          hanViet,
          meaning,
          radicalInfo: 'Tự động phân tích nét bút & bộ thủ (HanziWriter)',
          mnemonic: `Từ vựng nạp nhanh qua Smart Paste (${detectedLevel})`,
          example: {
            traditional: exTrad,
            pinyin: exPhon.pinyin,
            zhuyin: exPhon.zhuyin,
            vietnamese: `Tôi đang học từ "${traditional}" (${meaning}).`,
          },
        });
      }

      if (newItems.length === 0) {
        setStatusMessage({
          type: 'error',
          text: 'Không tìm thấy chữ Hán nào trong đoạn văn bản bạn dán.',
        });
      } else {
        onImportVocab(newItems);
        setStatusMessage({
          type: 'success',
          text: `Tuyệt vời! Đã tự động tạo Pinyin, Chú âm (ㄅㄆㄇㄈ), nghĩa và nạp ${newItems.length} từ mới vào kho học!`,
        });
      }
    } finally {
      setIsSmartProcessing(false);
    }
  };

  const handleLoadBuiltInPack = (pack: TocflPack) => {
    onImportVocab(pack.words);
    setStatusMessage({
      type: 'success',
      text: `Đã nạp gói "${pack.title}" (${pack.words.length} từ chuẩn Phồn thể) vào danh sách học của bạn!`,
    });
  };

  const handleLoadAllPacks = () => {
    const allPackWords = TOCFL_8000_PACKS.flatMap((p) => p.words);
    onImportVocab(allPackWords);
    setStatusMessage({
      type: 'success',
      text: `Đã nạp toàn bộ ${allPackWords.length} từ vựng từ 4 gói TOCFL (A1, A2, B1 & Khẩu ngữ Đài Loan)!`,
    });
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrad.trim() || !newMeaning.trim()) return;

    const autoPhon = autoGeneratePinyinAndZhuyin(newTrad.trim());
    const exTrad = `我今天學會了「${newTrad.trim()}」這個詞。`;
    const exPhon = autoGeneratePinyinAndZhuyin(exTrad);

    const item: VocabItem = {
      id: `manual-${Date.now()}`,
      track: inferTrackFromLevel(newLevel),
      levelTag: newLevel,
      traditional: newTrad.trim(),
      simplified: newTrad.trim(),
      pinyin: newPinyin.trim() || autoPhon.pinyin,
      zhuyin: newZhuyin.trim() || autoPhon.zhuyin,
      hanViet: newHanViet.trim() || '—',
      meaning: newMeaning.trim(),
      radicalInfo: 'Tự động tạo bảng tập viết nét chữ Phồn thể',
      mnemonic: `Từ vựng cấp ${newLevel}`,
      example: {
        traditional: exTrad,
        pinyin: exPhon.pinyin,
        zhuyin: exPhon.zhuyin,
        vietnamese: `Hôm nay tôi đã học thuộc từ "${newTrad.trim()}" (${newMeaning.trim()}).`,
      },
    };

    onImportVocab([item]);
    setNewTrad('');
    setNewPinyin('');
    setNewZhuyin('');
    setNewHanViet('');
    setNewMeaning('');
    setStatusMessage({
      type: 'success',
      text: `Đã thêm từ「${item.traditional}」(${item.pinyin} · ${item.zhuyin}) vào kho học!`,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusMessage(null);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'json') {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const rows = Array.isArray(parsed)
          ? parsed
          : parsed.words || parsed.vocab || parsed.data || [];
        const mapped = rows
          .map((r: Record<string, unknown>, i: number) => mapRowToVocabItem(r, i))
          .filter((item: VocabItem | null): item is VocabItem => item !== null);
        onImportVocab(mapped);
        setStatusMessage({
          type: 'success',
          text: `Đã nhập ${mapped.length} từ vựng từ file JSON "${file.name}"!`,
        });
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const allMapped: VocabItem[] = [];

        // Loop through ALL sheets in the workbook (e.g. Novice 1, Novice 2, Level 1..5 in 華語八千詞表)
        for (const sheetName of workbook.SheetNames) {
          // Skip summary/comparison metadata sheets that don't have vocabulary columns
          if (
            sheetName.includes('Entry Number') ||
            sheetName.includes('詞條數') ||
            sheetName === 'Sheet1' ||
            sheetName.includes('差異表')
          ) {
            continue;
          }
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
          for (let i = 0; i < rows.length; i++) {
            const rowWithSheetLevel = {
              ...rows[i],
              level: rows[i]['level'] || rows[i]['Level'] || sheetName,
            };
            const item = mapRowToVocabItem(rowWithSheetLevel, allMapped.length + i);
            if (item) {
              allMapped.push(item);
            }
          }
        }

        if (allMapped.length === 0) {
          throw new Error('Không tìm thấy cột từ vựng hợp lệ trong file Excel.');
        }

        onImportVocab(allMapped);
        setStatusMessage({
          type: 'success',
          text: `Đã đọc toàn bộ các Sheet và nhập thành công ${allMapped.length} từ vựng từ file "${file.name}"!`,
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Lỗi khi đọc file.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportCurrentVocabExcel = () => {
    const rows = allVocab.map((v) => ({
      Traditional: v.traditional,
      Simplified: v.simplified,
      Pinyin: v.pinyin,
      Zhuyin: v.zhuyin,
      HanViet: v.hanViet,
      Meaning: v.meaning,
      Level: v.levelTag,
      Example: v.example.traditional,
      Example_Vietnamese: v.example.vietnamese,
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TOCFL_Vocab');
    XLSX.writeFile(workbook, 'Kho_Tu_Vung_Phonthe_TOCFL.xlsx');
  };

  const filteredLibrary = allVocab.filter((item) => {
    const matchesLevel =
      filterLevel === 'ALL' ||
      item.levelTag.toUpperCase().includes(filterLevel) ||
      item.track === filterLevel;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesLevel;
    return (
      matchesLevel &&
      (item.traditional.toLowerCase().includes(q) ||
        item.pinyin.toLowerCase().includes(q) ||
        item.hanViet.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full">
              <Wand2 className="w-3.5 h-3.5 text-amber-300" /> Không cần tìm file Excel bên ngoài!
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              3 Cách Thêm Từ Vựng Phồn Thể Cực Nhanh (Tự động tạo Pinyin & Chú âm ㄅㄆㄇㄈ)
            </h2>
            <p className="text-slate-200 text-sm md:text-base mt-1 max-w-2xl">
              Bạn chỉ cần <strong>1. Bấm nạp các Gói TOCFL dựng sẵn</strong>, hoặc{' '}
              <strong>2. Copy-paste bất kỳ chữ Hán nào</strong> (từ bài báo, tin nhắn LINE, sách Đương Đại) —
              Web sẽ tự động sinh Pinyin, Chú âm ㄅㄆㄇㄈ, tra nghĩa tiếng Việt và tạo bảng tập viết nét chữ!
            </p>
          </div>

          <div className="shrink-0 bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase font-bold text-amber-300 block">
              Tổng số từ trong kho
            </span>
            <span className="text-3xl font-bold">{allVocab.length}</span>
            <span className="text-xs text-slate-300 block mt-0.5">
              (Đã nạp thêm: {customVocab.length} từ)
            </span>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold underline opacity-75 hover:opacity-100"
          >
            Đóng
          </button>
        </div>
      )}

      {/* METHOD 1: BUILT-IN TOCFL 8000 PACKS (NO EXCEL FILE NEEDED!) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
              Cách 1 · Nhanh nhất (Không cần file)
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1.5 flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-red-600" />
              Kho Gói Từ Vựng TOCFL & Đời Sống Đài Loan Có Sẵn Trong Web
            </h3>
            <p className="text-xs text-slate-500">
              Bấm vào gói bất kỳ để nạp ngay vào Flashcard & Tập viết nét chữ
            </p>
          </div>

          <button
            onClick={handleLoadAllPacks}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Sparkles className="w-4 h-4" /> Nạp tất cả 4 gói cùng lúc (+17 từ)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOCFL_8000_PACKS.map((pack) => (
            <div
              key={pack.id}
              className="rounded-2xl border border-slate-200 p-4 flex flex-col justify-between bg-slate-50/60 hover:bg-white hover:border-red-300 transition space-y-3"
            >
              <div className="space-y-2">
                <span
                  className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${pack.badgeColor}`}
                >
                  {pack.level} · {pack.words.length} từ
                </span>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{pack.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{pack.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {pack.words.map((w) => (
                    <span
                      key={w.id}
                      className="font-tc text-xs font-bold px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-800"
                    >
                      {w.traditional}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleLoadBuiltInPack(pack)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-red-600 text-white text-xs font-semibold transition"
              >
                + Nạp gói này vào học ngay
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* METHOD 2 & 3: SMART PASTE & AUTO-LOOKUP SINGLE WORD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Method 2: Smart Text Paste */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-amber-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Cách 2 · Copy & Dán chữ Hán bất kỳ
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1.5 flex items-center gap-2">
                <ClipboardPaste className="w-5 h-5 text-amber-600" />
                Dán Danh Sách Từ → Tự Động Sinh Pinyin + Chú Âm ㄅㄆㄇㄈ + Nghĩa
              </h3>
              <p className="text-xs text-slate-500">
                Chỉ cần gõ hoặc dán các từ chữ Hán (cách nhau bằng dấu phẩy hoặc xuống dòng, có thể kèm nghĩa hoặc chỉ mỗi chữ Hán đều được!)
              </p>
            </div>
          </div>

          <textarea
            rows={5}
            value={smartPasteText}
            onChange={(e) => setSmartPasteText(e.target.value)}
            placeholder="Ví dụ:&#10;夜市 - Chợ đêm&#10;高鐵 - Tàu cao tốc&#10;Hoặc chỉ cần gõ: 珍珠奶茶, 小籠包, 居留證"
            className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 font-tc text-sm focus:bg-white focus:outline-none focus:border-amber-500 leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Xếp vào lộ trình:</label>
              <select
                value={smartPasteLevel}
                onChange={(e) => setSmartPasteLevel(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              >
                <option value="TOCFL A1">TOCFL A1 (Nhập môn)</option>
                <option value="TOCFL A2">TOCFL A2 (Cơ bản)</option>
                <option value="TOCFL B1">TOCFL B1 (Trung cấp)</option>
                <option value="Khẩu ngữ Đài">Giao tiếp Thực tế Đài Loan</option>
              </select>
            </div>

            <button
              onClick={handleSmartPasteImport}
              disabled={isSmartProcessing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition"
            >
              {isSmartProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tự động phiên âm & dịch...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" /> Tự động tạo Phiên âm & Nạp toàn bộ từ
                </>
              )}
            </button>
          </div>
        </div>

        {/* Method 3: Single Word Auto-Fill */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Cách 3 · Gõ 1 chữ Hán tự điền hết
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1.5 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              Thêm Từ Lẻ Có Tự Động Điền Pinyin & ㄅㄆㄇㄈ
            </h3>
          </div>

          <form onSubmit={handleManualAdd} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Nhập chữ Hán (Gõ xong bấm "Tự điền nghĩa") *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="VD: 牛肉麵, 小籠包, 面試..."
                  value={newTrad}
                  onChange={(e) => handleTradInputChange(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-tc text-base focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAutoLookupSingleWord}
                  disabled={isAutoFilling || !newTrad.trim()}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition"
                >
                  {isAutoFilling ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  Tự điền nghĩa
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Pinyin (Tự động)
                </label>
                <input
                  type="text"
                  placeholder="Tự động điền..."
                  value={newPinyin}
                  onChange={(e) => setNewPinyin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Chú âm ㄅㄆㄇㄈ (Tự động)
                </label>
                <input
                  type="text"
                  placeholder="Tự động điền..."
                  value={newZhuyin}
                  onChange={(e) => setNewZhuyin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-tc bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Cấp độ</label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold"
                >
                  <option value="TOCFL A1">TOCFL A1</option>
                  <option value="TOCFL A2">TOCFL A2</option>
                  <option value="TOCFL B1">TOCFL B1</option>
                  <option value="Khẩu ngữ Đài">Khẩu ngữ Đài Loan</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Âm Hán Việt</label>
                <input
                  type="text"
                  placeholder="Tự chọn / Tự điền"
                  value={newHanViet}
                  onChange={(e) => setNewHanViet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Nghĩa tiếng Việt *
              </label>
              <input
                type="text"
                required
                placeholder="Nghĩa tiếng Việt..."
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
            >
              + Lưu từ này & Mở bảng tập viết
            </button>
          </form>
        </div>
      </div>

      {/* Optional Excel/JSON Upload & Export Bar */}
      <div className="bg-slate-100/90 rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-slate-600" />
          <div className="text-xs text-slate-700">
            <strong>Tùy chọn nâng cao (Excel / JSON):</strong> Bạn cũng có thể xuất toàn bộ kho từ hiện tại ra file Excel để lưu trữ, hoặc tải file Excel lên nếu có.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold transition">
            <Upload className="w-3.5 h-3.5 text-red-600" />
            Nhập từ file .xlsx / .csv / .json
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExportCurrentVocabExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <Download className="w-3.5 h-3.5" /> Xuất toàn bộ {allVocab.length} từ ra Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Searchable TOCFL 8000 Dictionary & Library Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Danh sách Từ vựng trong Kho của bạn ({filteredLibrary.length} từ)
            </h3>
            <p className="text-xs text-slate-500">
              Bấm <strong>"Học & Viết chữ →"</strong> ở bất kỳ từ nào để mở Flashcard và Tập viết nét chữ HanziWriter
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm chữ Hán, Pinyin, nghĩa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-60 focus:outline-none focus:border-red-500"
              />
            </div>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold"
            >
              <option value="ALL">Tất cả cấp độ</option>
              <option value="A1">TOCFL A1</option>
              <option value="A2">TOCFL A2</option>
              <option value="B1">TOCFL B1</option>
              <option value="taiwan-life">Khẩu ngữ Đài Loan</option>
            </select>

            {customVocab.length > 0 && (
              <button
                onClick={onClearCustomVocab}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa {customVocab.length} từ thêm mới
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Chữ Phồn thể</th>
                <th className="py-3 px-4">Pinyin / Chú âm ㄅㄆㄇㄈ</th>
                <th className="py-3 px-4">Hán Việt</th>
                <th className="py-3 px-4">Nghĩa tiếng Việt</th>
                <th className="py-3 px-4">Cấp độ</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLibrary.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/40 transition">
                  <td className="py-3 px-4 font-tc text-xl font-bold text-slate-900">
                    {item.traditional}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-red-700 text-xs">{item.pinyin}</div>
                    {item.zhuyin && (
                      <div className="font-tc text-xs text-slate-500">{item.zhuyin}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold uppercase text-slate-600">
                    {item.hanViet}
                  </td>
                  <td className="py-3 px-4 text-slate-800">{item.meaning}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.levelTag}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectWordToStudy(item)}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"
                    >
                      Học & Viết chữ →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
