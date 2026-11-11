import { pinyin } from 'pinyin-pro';

// Pinyin syllable (without tone) to Zhuyin (Bopomofo) converter table
const INITIAL_MAP: Record<string, string> = {
  b: 'ㄅ', p: 'ㄆ', m: 'ㄇ', f: 'ㄈ',
  d: 'ㄉ', t: 'ㄊ', n: 'ㄋ', l: 'ㄌ',
  g: 'ㄍ', k: 'ㄎ', h: 'ㄏ',
  j: 'ㄐ', q: 'ㄑ', x: 'ㄒ',
  zh: 'ㄓ', ch: 'ㄔ', sh: 'ㄕ', r: 'ㄖ',
  z: 'ㄗ', c: 'ㄘ', s: 'ㄙ',
};

const FINAL_MAP: Record<string, string> = {
  a: 'ㄚ', o: 'ㄛ', e: 'ㄜ', ai: 'ㄞ', ei: 'ㄟ', ao: 'ㄠ', ou: 'ㄡ',
  an: 'ㄢ', en: 'ㄣ', ang: 'ㄤ', eng: 'ㄥ', er: 'ㄦ',
  i: 'ㄧ', ia: 'ㄧㄚ', io: 'ㄧㄛ', ie: 'ㄧㄝ', iai: 'ㄧㄞ', iao: 'ㄧㄠ',
  iu: 'ㄧㄡ', iou: 'ㄧㄡ', ian: 'ㄧㄢ', in: 'ㄧㄣ', iang: 'ㄧㄤ', ing: 'ㄧㄥ',
  u: 'ㄨ', ua: 'ㄨㄚ', uo: 'ㄨㄛ', uai: 'ㄨㄞ', ui: 'ㄨㄟ', uei: 'ㄨㄟ',
  uan: 'ㄨㄢ', un: 'ㄨㄣ', uen: 'ㄨㄣ', uang: 'ㄨㄤ', ueng: 'ㄨㄥ', ong: 'ㄨㄥ',
  v: 'ㄩ', ü: 'ㄩ', ue: 'ㄩㄝ', üe: 'ㄩㄝ', van: 'ㄩㄢ', üan: 'ㄩㄢ',
  vn: 'ㄩㄣ', ün: 'ㄩㄣ', iong: 'ㄩㄥ',
};

const WHOLE_SYLLABLES: Record<string, string> = {
  zhi: 'ㄓ', chi: 'ㄔ', shi: 'ㄕ', ri: 'ㄖ',
  zi: 'ㄗ', ci: 'ㄘ', si: 'ㄙ',
  yi: 'ㄧ', ya: 'ㄧㄚ', yo: 'ㄧㄛ', ye: 'ㄧㄝ', yai: 'ㄧㄞ', yao: 'ㄧㄠ',
  you: 'ㄧㄡ', yan: 'ㄧㄢ', yin: 'ㄧㄣ', yang: 'ㄧㄤ', ying: 'ㄧㄥ',
  wu: 'ㄨ', wa: 'ㄨㄚ', wo: 'ㄨㄛ', wai: 'ㄨㄞ', wei: 'ㄨㄟ',
  wan: 'ㄨㄢ', wen: 'ㄨㄣ', wang: 'ㄨㄤ', weng: 'ㄨㄥ',
  yu: 'ㄩ', yue: 'ㄩㄝ', yuan: 'ㄩㄢ', yun: 'ㄩㄣ', yong: 'ㄩㄥ',
};

const TONE_MARKS: Record<number, string> = {
  1: '',
  2: 'ˊ',
  3: 'ˇ',
  4: 'ˋ',
  5: '˙',
  0: '˙',
};

// Common Simplified -> Traditional character map so if a user pastes Simplified Chinese from Mainland websites, we automatically convert it to Taiwan Traditional Chinese!
const SIMP_TO_TRAD_CHAR_MAP: Record<string, string> = {
  台: '臺', 湾: '灣', 运: '運', 机: '機', 车: '車', 厅: '廳',
  准: '準', 备: '備', 环: '環', 适: '適', 应: '應', 请: '請',
  压: '壓', 沟: '溝', 质: '質', 载: '載', 龟: '龜', 内: '內', 带: '帶', 奖: '獎',
  学: '學', 铁: '鐵', 发: '發', 面: '麵', 笼: '籠', 证: '證', 试: '試',
  历: '歷', 诊: '診', 没: '沒', 问: '問', 题: '題', 图: '圖',
  书: '書', 馆: '館', 脚: '腳', 计: '計', 气: '氣', 风: '風', 东: '東',
  报: '報', 资: '資', 响: '響', 夸: '誇', 张: '張', 势: '勢', 电: '電',
  脑: '腦', 软: '軟', 体: '體', 网: '網', 络: '絡', 视: '視', 频: '頻', 欢: '歡',
  买: '買', 卖: '賣', 钱: '錢', 块: '塊', 饭: '飯', 饮: '飲',
  鸡: '雞', 猪: '豬', 鱼: '魚', 虾: '蝦', 热: '熱', 凉: '涼', 温: '溫',
  医: '醫', 药: '藥', 师: '師', 课: '課', 级: '級', 业: '業', 务: '務', 经: '經',
  办: '辦', 签: '簽', 约: '約', 费: '費', 银: '銀', 账: '帳', 户: '戶', 汇: '匯',
  飞: '飛', 场: '場', 护: '護', 游: '遊', 导: '導', 桥: '橋',
  区: '區', 国: '國', 语: '語', 词: '詞', 听: '聽', 说: '說', 读: '讀', 写: '寫',
  练: '練', 习: '習', 复: '複',
};

export function convertToTaiwanTraditional(text: string): string {
  return Array.from(text)
    .map((ch) => SIMP_TO_TRAD_CHAR_MAP[ch] || ch)
    .join('');
}

export function singlePinyinToZhuyin(pyWithNumber: string): string {
  const cleaned = pyWithNumber.trim().toLowerCase();
  if (!cleaned) return '';

  const match = cleaned.match(/^([a-züv]+?)([0-5])?$/);
  if (!match) return '';

  const base = match[1];
  const tone = match[2] ? parseInt(match[2], 10) : 1;
  const toneMark = TONE_MARKS[tone] ?? '';

  if (WHOLE_SYLLABLES[base]) {
    return tone === 5 || tone === 0
      ? `˙${WHOLE_SYLLABLES[base]}`
      : `${WHOLE_SYLLABLES[base]}${toneMark}`;
  }

  let initial = '';
  let finalPart = base;

  if (base.startsWith('zh') || base.startsWith('ch') || base.startsWith('sh')) {
    initial = base.slice(0, 2);
    finalPart = base.slice(2);
  } else if (INITIAL_MAP[base[0]]) {
    initial = base[0];
    finalPart = base.slice(1);
  }

  if (['j', 'q', 'x'].includes(initial) && finalPart.startsWith('u')) {
    finalPart = 'ü' + finalPart.slice(1);
  }

  const zyInitial = INITIAL_MAP[initial] || '';
  const zyFinal = FINAL_MAP[finalPart] || '';
  const combined = `${zyInitial}${zyFinal}`;
  if (!combined) return '';

  return tone === 5 || tone === 0 ? `˙${combined}` : `${combined}${toneMark}`;
}

export function autoGeneratePinyinAndZhuyin(chineseText: string): {
  pinyin: string;
  zhuyin: string;
} {
  const clean = chineseText.trim();
  if (!clean) return { pinyin: '', zhuyin: '' };

  const pyTone = pinyin(clean, { toneType: 'symbol', type: 'array' }).join(' ');
  const pyNumArray = pinyin(clean, { toneType: 'num', type: 'array' });
  const zyArray = pyNumArray.map((item) => singlePinyinToZhuyin(item)).filter(Boolean);

  return {
    pinyin: pyTone,
    zhuyin: zyArray.join(' '),
  };
}

export interface QuickDictEntry {
  traditional: string;
  simplified: string;
  hanViet: string;
  meaning: string;
  level: string;
  category: string;
}

// Comprehensive Built-in Taiwan & TOCFL Dictionary searchable by Vietnamese OR Chinese!
export const TAIWAN_TOPIC_DICTIONARY: QuickDictEntry[] = [
  // Chủ đề: Du học & Trường học
  { traditional: '獎學金', simplified: '奖学金', hanViet: 'thưởng học kim', meaning: 'Học bổng', level: 'TOCFL B1', category: 'Du học & Trường học' },
  { traditional: '學費', simplified: '学费', hanViet: 'học phí', meaning: 'Học phí', level: 'TOCFL A2', category: 'Du học & Trường học' },
  { traditional: '宿舍', simplified: '宿舍', hanViet: 'túc xá', meaning: 'Ký túc xá sinh viên', level: 'TOCFL A1', category: 'Du học & Trường học' },
  { traditional: '圖書館', simplified: '图书馆', hanViet: 'đồ thư quán', meaning: 'Thư viện', level: 'TOCFL A1', category: 'Du học & Trường học' },
  { traditional: '學長姐', simplified: '学长姐', hanViet: 'học trưởng tỷ', meaning: 'Đàn anh, đàn chị khóa trên', level: 'Khẩu ngữ Đài', category: 'Du học & Trường học' },
  { traditional: '選課', simplified: '选课', hanViet: 'tuyển khóa', meaning: 'Đăng ký tín chỉ / Chọn môn học', level: 'TOCFL A2', category: 'Du học & Trường học' },
  { traditional: '報告', simplified: '报告', hanViet: 'báo cáo', meaning: 'Bài thuyết trình, báo cáo môn học', level: 'TOCFL A2', category: 'Du học & Trường học' },
  { traditional: '畢業', simplified: '毕业', hanViet: 'tốt nghiệp', meaning: 'Tốt nghiệp', level: 'TOCFL A2', category: 'Du học & Trường học' },

  // Chủ đề: Ẩm thực & Chợ đêm Đài Loan
  { traditional: '夜市', simplified: '夜市', hanViet: 'dạ thị', meaning: 'Chợ đêm Đài Loan', level: 'TOCFL A1', category: 'Ẩm thực & Chợ đêm' },
  { traditional: '牛肉麵', simplified: '牛肉面', hanViet: 'ngưu nhục miến', meaning: 'Mì bò Đài Loan', level: 'TOCFL A1', category: 'Ẩm thực & Chợ đêm' },
  { traditional: '滷肉飯', simplified: '卤肉饭', hanViet: 'lỗ nhục phạn', meaning: 'Cơm thịt kho tàu kiểu Đài Loan', level: 'Khẩu ngữ Đài', category: 'Ẩm thực & Chợ đêm' },
  { traditional: '雞排', simplified: '鸡排', hanViet: 'kê bài', meaning: 'Gà rán miếng khổng lồ chợ đêm', level: 'Khẩu ngữ Đài', category: 'Ẩm thực & Chợ đêm' },
  { traditional: '臭豆腐', simplified: '臭豆腐', hanViet: 'xú đậu hũ', meaning: 'Đậu phụ thối', level: 'Khẩu ngữ Đài', category: 'Ẩm thực & Chợ đêm' },
  { traditional: '小籠包', simplified: '小笼包', hanViet: 'tiểu lồng bao', meaning: 'Bánh bao súp Xiao Long Bao', level: 'TOCFL A1', category: 'Ẩm thực & Chợ đêm' },
  { traditional: '珍珠奶茶', simplified: '珍珠奶茶', hanViet: 'trân châu nãi trà', meaning: 'Trà sữa trân châu', level: 'TOCFL A1', category: 'Ẩm thực & Chợ đêm' },
  { traditional: '便當', simplified: '便当', hanViet: 'tiện đương', meaning: 'Cơm hộp Đài Loan', level: 'TOCFL A1', category: 'Ẩm thực & Chợ đêm' },
  { traditional: '宵夜', simplified: '宵夜', hanViet: 'tiêu dạ', meaning: 'Bữa ăn đêm / Đồ ăn khuya', level: 'Khẩu ngữ Đài', category: 'Ẩm thực & Chợ đêm' },

  // Chủ đề: Giao thông & Đi lại
  { traditional: '高鐵', simplified: '高铁', hanViet: 'cao thiết', meaning: 'Tàu cao tốc Đài Loan (THSR)', level: 'TOCFL A2', category: 'Giao thông & Đi lại' },
  { traditional: '臺鐵', simplified: '台铁', hanViet: 'đài thiết', meaning: 'Tàu hỏa thường Đài Loan (TRA)', level: 'TOCFL A2', category: 'Giao thông & Đi lại' },
  { traditional: '公車', simplified: '公车', hanViet: 'công xa', meaning: 'Xe buýt công cộng', level: 'TOCFL A1', category: 'Giao thông & Đi lại' },
  { traditional: '悠遊卡', simplified: '悠游卡', hanViet: 'du du tạp', meaning: 'Thẻ EasyCard quẹt tàu xe & 7-Eleven', level: 'Khẩu ngữ Đài', category: 'Giao thông & Đi lại' },
  { traditional: '安全帽', simplified: '安全帽', hanViet: 'an toàn mạo', meaning: 'Mũ bảo hiểm đi xe máy', level: 'TOCFL A2', category: 'Giao thông & Đi lại' },
  { traditional: '轉乘', simplified: '转乘', hanViet: 'chuyển thừa', meaning: 'Chuyển tuyến tàu/xe buýt', level: 'TOCFL B1', category: 'Giao thông & Đi lại' },

  // Chủ đề: Thuê nhà, Y tế & Giấy tờ ở Đài
  { traditional: '居留證', simplified: '居留证', hanViet: 'cư lưu chứng', meaning: 'Thẻ cư trú (ARC) tại Đài Loan', level: 'TOCFL B1', category: 'Thuê nhà, Y tế & Giấy tờ' },
  { traditional: '工作證', simplified: '工作证', hanViet: 'công tác chứng', meaning: 'Giấy phép lao động / làm thêm (Work Permit)', level: 'TOCFL B1', category: 'Thuê nhà, Y tế & Giấy tờ' },
  { traditional: '健保卡', simplified: '医保卡', hanViet: 'kiện bảo tạp', meaning: 'Thẻ bảo hiểm y tế Đài Loan', level: 'TOCFL A2', category: 'Thuê nhà, Y tế & Giấy tờ' },
  { traditional: '診所', simplified: '诊所', hanViet: 'chẩn sở', meaning: 'Phòng khám tư nhân', level: 'TOCFL A2', category: 'Thuê nhà, Y tế & Giấy tờ' },
  { traditional: '掛號', simplified: '挂号', hanViet: 'quải hiệu', meaning: 'Đăng ký lấy số khám bệnh / gửi thư bảo đảm', level: 'TOCFL B1', category: 'Thuê nhà, Y tế & Giấy tờ' },
  { traditional: '押金', simplified: '押金', hanViet: 'áp kim', meaning: 'Tiền đặt cọc thuê nhà', level: 'TOCFL B1', category: 'Thuê nhà, Y tế & Giấy tờ' },
  { traditional: '套房', simplified: '套房', hanViet: 'tháo phòng', meaning: 'Phòng trọ khép kín (có nhà vệ sinh riêng)', level: 'TOCFL A2', category: 'Thuê nhà, Y tế & Giấy tờ' },
  { traditional: '雅房', simplified: '雅房', hanViet: 'nhã phòng', meaning: 'Phòng trọ dùng chung nhà vệ sinh', level: 'Khẩu ngữ Đài', category: 'Thuê nhà, Y tế & Giấy tờ' },
  { traditional: '垃圾車', simplified: '垃圾车', hanViet: 'lạp sạp xa', meaning: 'Xe chở rác phát nhạc ở Đài Loan (đọc là lèsèchē)', level: 'Khẩu ngữ Đài', category: 'Thuê nhà, Y tế & Giấy tờ' },

  // Chủ đề: Làm thêm & Công sở (B1)
  { traditional: '打工', simplified: '打工', hanViet: 'đả công', meaning: 'Làm thêm (Part-time)', level: 'TOCFL A2', category: 'Làm thêm & Công sở' },
  { traditional: '時薪', simplified: '时薪', hanViet: 'thời tân', meaning: 'Lương tính theo giờ', level: 'TOCFL B1', category: 'Làm thêm & Công sở' },
  { traditional: '面試', simplified: '面试', hanViet: 'diện thí', meaning: 'Phỏng vấn xin việc / học bổng', level: 'TOCFL B1', category: 'Làm thêm & Công sở' },
  { traditional: '履歷', simplified: '简历', hanViet: 'lý lịch', meaning: 'Sơ yếu lý lịch (CV)', level: 'TOCFL B1', category: 'Làm thêm & Công sở' },
  { traditional: '加班', simplified: '加班', hanViet: 'gia ban', meaning: 'Tăng ca, làm thêm giờ', level: 'TOCFL B1', category: 'Làm thêm & Công sở' },
  { traditional: '請假', simplified: '请假', hanViet: 'thỉnh giả', meaning: 'Xin nghỉ phép', level: 'TOCFL A2', category: 'Làm thêm & Công sở' },
  { traditional: '行銷', simplified: '营销', hanViet: 'hành tiêu', meaning: 'Marketing, tiếp thị (Từ chuẩn Đài Loan)', level: 'TOCFL B1', category: 'Làm thêm & Công sở' },
  { traditional: '專案', simplified: '项目', hanViet: 'chuyên án', meaning: 'Dự án công việc (Project - chuẩn Đài)', level: 'TOCFL B1', category: 'Làm thêm & Công sở' },
];

export async function autoTranslateChineseToVietnamese(word: string): Promise<{
  hanViet: string;
  meaning: string;
  level: string;
}> {
  const clean = convertToTaiwanTraditional(word.trim());
  const found = TAIWAN_TOPIC_DICTIONARY.find(
    (entry) => entry.traditional === clean || entry.simplified === word.trim()
  );
  if (found) {
    return {
      hanViet: found.hanViet,
      meaning: found.meaning,
      level: found.level,
    };
  }

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=zh-TW|vi`
    );
    if (res.ok) {
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (translated && typeof translated === 'string') {
        return {
          hanViet: 'Tự động tra',
          meaning: translated,
          level: clean.length >= 2 ? 'TOCFL B1' : 'TOCFL A1',
        };
      }
    }
  } catch {
    // Fallback if offline
  }

  return {
    hanViet: '—',
    meaning: 'Từ vựng tiếng Trung Phồn thể (Bạn có thể sửa lại nghĩa tiếng Việt)',
    level: 'TOCFL A2',
  };
}
