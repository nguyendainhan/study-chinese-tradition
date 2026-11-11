export type TrackId = 'tocfl-a' | 'tocfl-b1' | 'taiwan-life';

export interface VocabItem {
  id: string;
  track: TrackId;
  levelTag: string; // e.g., "TOCFL A1", "TOCFL A2", "TOCFL B1", "Khẩu ngữ Đài"
  traditional: string;
  simplified: string;
  pinyin: string;
  zhuyin: string;
  hanViet: string;
  meaning: string;
  radicalInfo: string;
  mnemonic: string;
  mainlandDiff?: string; // Difference vs Mainland Chinese if applicable
  example: {
    traditional: string;
    pinyin: string;
    zhuyin: string;
    vietnamese: string;
  };
}

export interface DialogueLine {
  speaker: string;
  role: 'staff' | 'user' | 'friend';
  traditional: string;
  pinyin: string;
  zhuyin: string;
  vietnamese: string;
  note?: string;
}

export interface ScenarioItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  culturalTip: string;
  keyPhrases: {
    traditional: string;
    pinyin: string;
    zhuyin: string;
    meaning: string;
  }[];
  dialogue: DialogueLine[];
}

export interface GrammarPoint {
  id: string;
  level: 'TOCFL A2' | 'TOCFL B1';
  pattern: string;
  pinyin: string;
  meaning: string;
  explanation: string;
  examples: {
    traditional: string;
    pinyin: string;
    vietnamese: string;
  }[];
}

export interface ReadingPassage {
  id: string;
  level: 'TOCFL A2' | 'TOCFL B1';
  title: string;
  category: string;
  paragraphs: {
    traditional: string;
    pinyin: string;
    vietnamese: string;
  }[];
  glossary: {
    word: string;
    pinyin: string;
    zhuyin: string;
    hanViet: string;
    meaning: string;
  }[];
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export const VOCAB_LIST: VocabItem[] = [
  // === TRACK 1: TOCFL BAND A (A1 - A2) ===
  {
    id: 'a1-1',
    track: 'tocfl-a',
    levelTag: 'TOCFL A1',
    traditional: '臺灣',
    simplified: '台湾',
    pinyin: 'Táiwān',
    zhuyin: 'ㄊㄞˊ ㄨㄢ',
    hanViet: 'Đài Loan',
    meaning: 'Đài Loan (chữ 臺/灣 chuẩn Phồn thể chính thức)',
    radicalInfo: 'Bộ 至 (Chí - đến) & Bộ 水 (Thủy - nước 氵)',
    mnemonic: 'Chữ 灣 gồm bộ Thủy (氵) bên trái + chữ 彎 (uốn cong) bên phải: vùng vịnh nước uốn cong.',
    example: {
      traditional: '我打算明年去臺灣學中文。',
      pinyin: 'Wǒ dǎsuàn míngnián qù Táiwān xué Zhōngwén.',
      zhuyin: 'ㄨㄛˇ ㄉㄚˇ ㄙㄨㄢˋ ㄇㄧㄥˊ ㄋㄧㄢˊ ㄑㄩˋ ㄊㄞˊ ㄨㄢ ㄒㄩㄝˊ ㄓㄨㄥ ㄨㄣˊ。',
      vietnamese: 'Tôi dự định năm sau đi Đài Loan học tiếng Trung.'
    }
  },
  {
    id: 'a1-2',
    track: 'tocfl-a',
    levelTag: 'TOCFL A1',
    traditional: '捷運',
    simplified: '捷运',
    pinyin: 'jiéyùn',
    zhuyin: 'ㄐㄧㄝˊ ㄩㄣˋ',
    hanViet: 'tiệp vận',
    meaning: 'Tàu điện ngầm (MRT tại Đài Loan)',
    radicalInfo: 'Bộ 手 (Thủ 扌 - tay) & Bộ 辵 (Sước 辶 - bước đi)',
    mnemonic: '捷 (nhanh nhẹn) + 運 (vận chuyển) = Hệ thống vận chuyển nhanh (MRT).',
    mainlandDiff: 'Đại Lục dùng 地鐵 (dìtiě), người Đài Loan luôn gọi là 捷運 (jiéyùn).',
    example: {
      traditional: '在臺北搭捷運非常方便。',
      pinyin: 'Zài Táiběi dā jiéyùn fēicháng fāngbiàn.',
      zhuyin: 'ㄗㄞˋ ㄊㄞˊ ㄅㄟˇ ㄉㄚ ㄐㄧㄝˊ ㄩㄣˋ ㄈㄟ ㄔㄤˊ ㄈㄤ ㄅㄧㄢˋ。',
      vietnamese: 'Ở Đài Bắc đi tàu điện ngầm MRT cực kỳ tiện lợi.'
    }
  },
  {
    id: 'a1-3',
    track: 'tocfl-a',
    levelTag: 'TOCFL A1',
    traditional: '機車',
    simplified: '机车',
    pinyin: 'jīchē',
    zhuyin: 'ㄐㄧ ㄔㄜ',
    hanViet: 'cơ xa',
    meaning: 'Xe máy (Nghĩa lóng ở Đài: người khó tính, hay gây chuyện)',
    radicalInfo: 'Bộ 木 (Mộc - cây) & Bộ 車 (Xa - xe cộ)',
    mnemonic: 'Chữ 車 Phồn thể giữ nguyên hình bánh xe ở giữa với trục trên dưới.',
    mainlandDiff: 'Đại Lục gọi xe máy là 摩托車 (mótuōchē). Ở Đài Loan còn dùng 機車 làm tính từ chỉ người "củ chuối/khó ưa".',
    example: {
      traditional: '很多臺灣大學生騎機車上學。',
      pinyin: 'Hěn duō Táiwān dàxuéshēng qí jīchē shàngxué.',
      zhuyin: 'ㄏㄣˇ ㄉㄨㄛ ㄊㄞˊ ㄨㄢ ㄉㄚˋ ㄒㄩㄝˊ ㄕㄥ ㄑㄧˊ ㄐㄧ ㄔㄜ ㄕㄤˋ ㄒㄩㄝˊ。',
      vietnamese: 'Rất nhiều sinh viên đại học Đài Loan đi xe máy đến trường.'
    }
  },
  {
    id: 'a1-4',
    track: 'tocfl-a',
    levelTag: 'TOCFL A2',
    traditional: '餐廳',
    simplified: '餐厅',
    pinyin: 'cāntīng',
    zhuyin: 'ㄘㄢ ㄊㄧㄥ',
    hanViet: 'xan sảnh',
    meaning: 'Nhà hàng, quán ăn',
    radicalInfo: 'Bộ 食 (Thực - ăn uống) & Bộ 广 (Nghiễm - mái nhà)',
    mnemonic: 'Chữ 廳 có chữ 聽 (thính - lắng nghe) bên dưới mái nhà 广.',
    example: {
      traditional: '這家餐廳的牛肉麵非常有名。',
      pinyin: 'Zhè jiā cāntīng de niúròumiàn fēicháng yǒumíng.',
      zhuyin: 'ㄓㄜˋ ㄐㄧㄚ ㄘㄢ ㄊㄧㄥ ㄉㄜ˙ ㄋㄧㄡˊ ㄖㄡˋ ㄇㄧㄢˋ ㄈㄟ ㄔㄤˊ ㄧㄡˇ ㄇㄧㄥˊ。',
      vietnamese: 'Mì bò của nhà hàng này vô cùng nổi tiếng.'
    }
  },
  {
    id: 'a1-5',
    track: 'tocfl-a',
    levelTag: 'TOCFL A2',
    traditional: '準備',
    simplified: '准备',
    pinyin: 'zhǔnbèi',
    zhuyin: 'ㄓㄨㄣˇ ㄅㄟˋ',
    hanViet: 'chuẩn bị',
    meaning: 'Chuẩn bị, sẵn sàng',
    radicalInfo: 'Bộ 水 (Thủy 氵) + 隹 (Chuy) & Bộ 人 (Nhân 亻)',
    mnemonic: 'Chữ 準 Phồn thể có bộ Thủy (氵), chim 隹 đậu trên chữ 十 (thập) giữ thăng bằng chuẩn xác.',
    example: {
      traditional: '我正在準備華語文能力測驗。',
      pinyin: 'Wǒ zhèngzài zhǔnbèi Huáyǔwén Nénglì Cèyàn.',
      zhuyin: 'ㄨㄛˇ ㄓㄥˋ ㄗㄞˋ ㄓㄨㄣˇ ㄅㄟˋ ㄏㄨㄚˊ ㄩˇ ㄨㄣˊ ㄋㄥˊ ㄌㄧˋ ㄘㄜˋ ㄧㄢˋ。',
      vietnamese: 'Tôi đang chuẩn bị cho kỳ thi năng lực Hoa ngữ (TOCFL).'
    }
  },
  {
    id: 'a1-6',
    track: 'tocfl-a',
    levelTag: 'TOCFL A2',
    traditional: '環境',
    simplified: '环境',
    pinyin: 'huánjìng',
    zhuyin: 'ㄏㄨㄢˊ ㄐㄧㄥˋ',
    hanViet: 'hoàn cảnh',
    meaning: 'Môi trường, hoàn cảnh xung quanh',
    radicalInfo: 'Bộ 玉 (Ngọc 王) & Bộ 土 (Thổ - đất)',
    mnemonic: '環 (vòng ngọc bao quanh) + 境 (biên giới vùng đất) = Môi trường xung quanh.',
    example: {
      traditional: '這間學校的學習環境很舒服。',
      pinyin: 'Zhè jiān xuéxiào de xuéxí huánjìng hěn shūfú.',
      zhuyin: 'ㄓㄜˋ ㄐㄧㄢ ㄒㄩㄝˊ ㄒㄧㄠˋ ㄉㄜ˙ ㄒㄩㄝˊ ㄒㄧˊ ㄏㄨㄢˊ ㄐㄧㄥˋ ㄏㄣˇ ㄕㄨ ㄈㄨˊ。',
      vietnamese: 'Môi trường học tập của ngôi trường này rất thoải mái.'
    }
  },

  // === TRACK 2: TOCFL BAND B1 (TRUNG CẤP ĐƯƠNG ĐẠI 3-4) ===
  {
    id: 'b1-1',
    track: 'tocfl-b1',
    levelTag: 'TOCFL B1',
    traditional: '適應',
    simplified: '适应',
    pinyin: 'shìyìng',
    zhuyin: 'ㄕˋ ㄧㄥˋ',
    hanViet: 'thích ứng',
    meaning: 'Thích nghi, thích ứng (với cuộc sống/công việc)',
    radicalInfo: 'Bộ 辵 (Sước 辶) & Bộ 心 (Tâm - tấm lòng)',
    mnemonic: '應 có bộ Tâm (心) ở đáy: Thích ứng cần sự điều chỉnh từ trong tâm.',
    example: {
      traditional: '剛來臺灣的時候，我花了一個月才適應這裡的天氣。',
      pinyin: 'Gāng lái Táiwān de shíhòu, wǒ huāle yí gè yuè cái shìyìng zhèlǐ de tiānqì.',
      zhuyin: 'ㄍㄤ ㄌㄞˊ ㄊㄞˊ ㄨㄢ ㄉㄜ˙ ㄕˊ ㄏㄡˋ，ㄨㄛˇ ㄏㄨㄚ ㄌㄜ˙ ㄧˊ ㄍㄜˋ ㄩㄝˋ ㄘㄞˊ ㄕˋ ㄧㄥˋ ㄓㄜˋ ㄌㄧˇ ㄉㄜ˙ ㄊㄧㄢ ㄑㄧˋ。',
      vietnamese: 'Lúc mới sang Đài Loan, tôi mất một tháng mới thích nghi được với thời tiết ở đây.'
    }
  },
  {
    id: 'b1-2',
    track: 'tocfl-b1',
    levelTag: 'TOCFL B1',
    traditional: '薪水',
    simplified: '薪水',
    pinyin: 'xīnshuǐ',
    zhuyin: 'ㄒㄧㄣ ㄕㄨㄟˇ',
    hanViet: 'tân thủy',
    meaning: 'Tiền lương, thu nhập hàng tháng',
    radicalInfo: 'Bộ 艸 (Thảo 艹 - cỏ cây) & Bộ 水 (Thủy - nước)',
    mnemonic: 'Ngày xưa tiền công dùng để mua củi (薪) và nước (水), nay chỉ tiền lương.',
    mainlandDiff: 'Ở Đài Loan thông dụng nhất là 薪水 (xīnshuǐ) hoặc 薪資 (xīnzī), trong khi Đại Lục hay dùng 工資 (gōngzī).',
    example: {
      traditional: '這份工作的薪水雖然不高，但福利很好。',
      pinyin: 'Zhè fèn gōngzuò de xīnshuǐ suīrán bù gāo, dàn fúlì hěn hǎo.',
      zhuyin: 'ㄓㄜˋ ㄈㄣˋ ㄍㄨㄥ ㄗㄨㄛˋ ㄉㄜ˙ ㄒㄧㄣ ㄕㄨㄟˇ ㄙㄨㄟ ㄖㄢˊ ㄅㄨˋ ㄍㄠ，ㄉㄢˋ ㄈㄨˊ ㄌㄧˋ ㄏㄣˇ ㄏㄠˇ。',
      vietnamese: 'Mức lương của công việc này tuy không cao nhưng phúc lợi rất tốt.'
    }
  },
  {
    id: 'b1-3',
    track: 'tocfl-b1',
    levelTag: 'TOCFL B1',
    traditional: '申請',
    simplified: '申请',
    pinyin: 'shēnqǐng',
    zhuyin: 'ㄕㄣ ㄑㄧㄥˇ',
    hanViet: 'thân thỉnh',
    meaning: 'Nộp đơn xin (học bổng, visa, việc làm)',
    radicalInfo: 'Bộ 田 (Điền) & Bộ 言 (Ngôn - lời nói)',
    mnemonic: 'Chữ 請 giữ nguyên bộ Ngôn (言) 7 nét đầy đủ bên trái + chữ 青 (thanh) bên phải.',
    example: {
      traditional: '如果你想申請臺灣獎學金，必須先考過 TOCFL B1。',
      pinyin: 'Rúguǒ nǐ xiǎng shēnqǐng Táiwān jiǎngxuéjīn, bìxū xiān kǎoguò TOCFL B1.',
      zhuyin: 'ㄖㄨˊ ㄍㄨㄛˇ ㄋㄧˇ ㄒㄧㄤˇ ㄕㄣ ㄑㄧㄥˇ ㄊㄞˊ ㄨㄢ ㄐㄧㄤˇ ㄒㄩㄝˊ ㄐㄧㄣ，ㄅㄧˋ ㄒㄩ ㄒㄧㄢ ㄎㄠˇ ㄍㄨㄛˋ TOCFL B1。',
      vietnamese: 'Nếu bạn muốn nộp đơn xin học bổng Đài Loan, bắt buộc phải thi đỗ TOCFL B1 trước.'
    }
  },
  {
    id: 'b1-4',
    track: 'tocfl-b1',
    levelTag: 'TOCFL B1',
    traditional: '壓力',
    simplified: '压力',
    pinyin: 'yālì',
    zhuyin: 'ㄧㄚ ㄌㄧˋ',
    hanViet: 'áp lực',
    meaning: 'Áp lực (công việc, học tập, cuộc sống)',
    radicalInfo: 'Bộ 土 (Thổ) dưới vách đá 厂 & Bộ 力 (Lực)',
    mnemonic: '壓 (đè nén xuống đất 土) + 力 (sức mạnh) = Áp lực.',
    example: {
      traditional: '現代人工作壓力大，週末常去山上露營放鬆。',
      pinyin: 'Xiàndàirén gōngzuò yālì dà, zhōumò cháng qù shānshàng lùyíng fàngsōng.',
      zhuyin: 'ㄒㄧㄢˋ ㄉㄞˋ ㄖㄣˊ ㄍㄨㄥ ㄗㄨㄛˋ ㄧㄚ ㄌㄧˋ ㄉㄚˋ，ㄓㄡ ㄇㄛˋ ㄔㄤˊ ㄑㄩˋ ㄕㄢ ㄕㄤˋ ㄌㄨˋ ㄧㄥˊ ㄈㄤˋ ㄙㄨㄥ。',
      vietnamese: 'Người hiện đại áp lực công việc lớn, cuối tuần thường lên núi cắm trại thư giãn.'
    }
  },
  {
    id: 'b1-5',
    track: 'tocfl-b1',
    levelTag: 'TOCFL B1',
    traditional: '溝通',
    simplified: '沟通',
    pinyin: 'gōutōng',
    zhuyin: 'ㄍㄡ ㄊㄨㄥ',
    hanViet: 'câu thông',
    meaning: 'Giao tiếp, trao đổi, đàm phán để hiểu nhau',
    radicalInfo: 'Bộ 水 (Thủy 氵) & Bộ 辵 (Sước 辶)',
    mnemonic: 'Khơi dòng nước (溝) cho thông suốt (通) = Trao đổi, tháo gỡ khúc mắc.',
    example: {
      traditional: '跟臺灣同事合作時，保持良好的溝通非常重要。',
      pinyin: 'Gēn Táiwān tóngshì hézuò shí, bǎochí liánghǎo de gōutōng fēicháng zhòngyào.',
      zhuyin: 'ㄍㄣ ㄊㄞˊ ㄨㄢ ㄊㄨㄥˊ ㄕˋ ㄏㄜˊ ㄗㄨㄛˋ ㄕˊ，ㄅㄠˇ ㄔˊ ㄌㄧㄤˊ ㄏㄠˇ ㄉㄜ˙ ㄍㄡ ㄊㄨㄥ ㄈㄟ ㄔㄤˊ ㄓㄨㄥˋ ㄧㄠˋ。',
      vietnamese: 'Khi hợp tác với đồng nghiệp Đài Loan, duy trì giao tiếp tốt là vô cùng quan trọng.'
    }
  },
  {
    id: 'b1-6',
    track: 'tocfl-b1',
    levelTag: 'TOCFL B1',
    traditional: '品質',
    simplified: '品质',
    pinyin: 'pǐnzhí',
    zhuyin: 'ㄆㄧㄣˇ ㄓˊ',
    hanViet: 'phẩm chất',
    meaning: 'Chất lượng (sản phẩm, cuộc sống, dịch vụ)',
    radicalInfo: 'Bộ 口 (Khẩu) & Bộ 貝 (Bối - tiền bạc/vỏ sò)',
    mnemonic: 'Chú ý: Người Đài Loan đọc 質 là thanh 2 (zhí - ㄓˊ), khác Đại Lục đọc thanh 4 (zhì).',
    mainlandDiff: 'Đài Loan rất chuộng dùng 品質 (pǐnzhí - đọc thanh 2) cho cả "chất lượng cuộc sống (生活品質)" và "chất lượng hàng hóa", thay vì 質量 (zhìliàng).',
    example: {
      traditional: '臺灣人很重視生活品質與醫療服務。',
      pinyin: 'Táiwānrén hěn zhòngshì shēnghuó pǐnzhí yǔ yīliáo fúwù.',
      zhuyin: 'ㄊㄞˊ ㄨㄢ ㄖㄣˊ ㄏㄣˇ ㄓㄨㄥˋ ㄕˋ ㄕㄥ ㄏㄨㄛˊ ㄆㄧㄣˇ ㄓˊ ㄩˇ ㄧ ㄌㄧㄠˊ ㄈㄨˊ ㄨˋ。',
      vietnamese: 'Người Đài Loan rất coi trọng chất lượng cuộc sống và dịch vụ y tế.'
    }
  },

  // === TRACK 3: GIAO TIẾP THỰC TẾ ĐÀI LOAN (TAIWAN DAILY LIFE & SLANG) ===
  {
    id: 'tw-1',
    track: 'taiwan-life',
    levelTag: 'Khẩu ngữ Đài',
    traditional: '不好意思',
    simplified: '不好意思',
    pinyin: 'bù hǎoyìsi',
    zhuyin: 'ㄅㄨˋ ㄏㄠˇ ㄧˋ ㄙ˙',
    hanViet: 'bất hảo ý tứ',
    meaning: 'Xin lỗi làm phiền / Ngại quá / Cho hỏi thăm (Câu cửa miệng số 1 của người Đài)',
    radicalInfo: 'Bộ 心 (Tâm - tấm lòng, ý nghĩ)',
    mnemonic: 'Người Đài dùng câu này ở mọi nơi: khi gọi nhân viên, khi lỡ chạm vào ai, khi nhờ giúp đỡ.',
    mainlandDiff: 'Tần suất người Đài dùng 不好意思 cao gấp nhiều lần 對不起. Ngoài ra người Đài còn hay nói "歹勢 (phái-sè)" bằng tiếng Đài (台語).',
    example: {
      traditional: '不好意思，請問洗手間在哪裡？',
      pinyin: 'Bù hǎoyìsi, qǐngwèn xǐshǒujiān zài nǎlǐ?',
      zhuyin: 'ㄅㄨˋ ㄏㄠˇ ㄧˋ ㄙ˙，ㄑㄧㄥˇ ㄨㄣˋ ㄒㄧˇ ㄕㄡˇ ㄐㄧㄢ ㄗㄞˋ ㄋㄚˇ ㄌㄧˇ？',
      vietnamese: 'Xin lỗi cho hỏi thăm, nhà vệ sinh ở đâu ạ?'
    }
  },
  {
    id: 'tw-2',
    track: 'taiwan-life',
    levelTag: 'Khẩu ngữ Đài',
    traditional: '載具',
    simplified: '载具',
    pinyin: 'zǎijù',
    zhuyin: 'ㄗㄞˇ ㄐㄩˋ',
    hanViet: 'tải cụ',
    meaning: 'Mã lưu hóa đơn điện tử (để dò xổ số hóa đơn Đài Loan)',
    radicalInfo: 'Bộ 車 (Xa - xe) & Bộ 八 (Bát)',
    mnemonic: 'Đi 7-Eleven hay quán nước ở Đài,收銀員 (thu ngân) luôn hỏi: "發票存載具嗎？" (Có lưu hóa đơn vào app mã vạch không?).',
    mainlandDiff: 'Đặc sản văn hóa tiêu dùng tại Đài Loan (hóa đơn 發票 có mã số trúng thưởng tới 10 triệu Đài tệ).',
    example: {
      traditional: '店員問：「請問發票要存載具嗎？」',
      pinyin: 'Diànyuán wèn: "Qǐngwèn fāpiào yào cún zǎijù ma?"',
      zhuyin: 'ㄉㄧㄢˋ ㄩㄢˊ ㄨㄣˋ：「ㄑㄧㄥˇ ㄨㄣˋ ㄈㄚ ㄆㄧㄠˋ ㄧㄠˋ ㄘㄨㄣˊ ㄗㄞˇ ㄐㄩˋ ㄇㄚ˙？」',
      vietnamese: 'Nhân viên hỏi: "Cho hỏi hóa đơn của bạn có muốn lưu vào mã載具 (app điện thoại) không?"'
    }
  },
  {
    id: 'tw-3',
    track: 'taiwan-life',
    levelTag: 'Trà sữa & Ăn uống',
    traditional: '微糖去冰',
    simplified: '微糖去冰',
    pinyin: 'wéitáng qùbīng',
    zhuyin: 'ㄨㄟˊ ㄊㄤˊ ㄑㄩˋ ㄅㄧㄥ',
    hanViet: 'vi đường khứ băng',
    meaning: '30% đường, không đá (Công thức gọi trà sữa quốc dân tại Đài Loan)',
    radicalInfo: 'Bộ 米 (Mễ - gạo/đường) & Bộ 冫 (Băng - nước đá)',
    mnemonic: '全糖 (100%) → 少糖 (70%) → 半糖 (50%) → 微糖 (30%) → 無糖 (0%). 正常冰 → 少冰 → 微冰 → 去冰.',
    example: {
      traditional: '我要一杯珍珠奶茶，微糖去冰，謝謝！',
      pinyin: 'Wǒ yào yì bēi zhēnzhū nǎichá, wéitáng qùbīng, xièxie!',
      zhuyin: 'ㄨㄛˇ ㄧㄠˋ ㄧˋ ㄅㄟ ㄓㄣ ㄓㄨ ㄋㄞˇ ㄔㄚˊ，ㄨㄟˊ ㄊㄤˊ ㄑㄩˋ ㄅㄧㄥ，ㄒㄧㄝˋ ㄒㄧㄝ˙！',
      vietnamese: 'Cho mình một ly trà sữa trân châu, 30% đường không đá, cảm ơn!'
    }
  },
  {
    id: 'tw-4',
    track: 'taiwan-life',
    levelTag: 'Khẩu ngữ Đài',
    traditional: '傻眼',
    simplified: '傻眼',
    pinyin: 'shǎyǎn',
    zhuyin: 'ㄕㄚˇ ㄧㄢˇ',
    hanViet: 'sả nhãn',
    meaning: 'Đứng hình, cạn lời, bó tay (khi gặp chuyện bất ngờ/vô lý)',
    radicalInfo: 'Bộ 人 (Nhân 亻) & Bộ 目 (Mục - mắt)',
    mnemonic: 'Mắt (眼) đơ ra như người ngốc (傻) vì quá bất ngờ = Cạn lời / Đứng hình.',
    example: {
      traditional: '他居然忘記今天要考試，真的讓我很傻眼！',
      pinyin: 'Tā jūrán wàngjì jīntiān yào kǎoshì, zhēnde ràng wǒ hěn shǎyǎn!',
      zhuyin: 'ㄊㄚ ㄐㄩ ㄖㄢˊ ㄨㄤˋ ㄐㄧˋ ㄐㄧㄣ ㄊㄧㄢ ㄧㄠˋ ㄎㄠˇ ㄕˋ，ㄓㄣ ㄉㄜ˙ ㄖㄤˋ ㄨㄛˇ ㄏㄣˇ ㄕㄚˇ ㄧㄢˇ！',
      vietnamese: 'Cậu ấy vậy mà lại quên hôm nay thi, thật sự làm mình đứng hình luôn!'
    }
  },
  {
    id: 'tw-5',
    track: 'taiwan-life',
    levelTag: 'Khẩu ngữ Đài',
    traditional: '龜毛',
    simplified: '龟毛',
    pinyin: 'guīmáo',
    zhuyin: 'ㄍㄨㄟ ㄇㄠˊ',
    hanViet: 'quy mao',
    meaning: 'Kỹ tính quá mức, cầu toàn, soi mói từng chi tiết nhỏ (Từ gốc Đài ngữ)',
    radicalInfo: 'Bộ 龜 (Quy - con rùa 16 nét) & Bộ 毛 (Mao - lông)',
    mnemonic: 'Con rùa (龜) vốn không có lông (毛), ai cứ đòi tìm lông rùa tức là cực kỳ kỹ tính, bắt bẻ.',
    mainlandDiff: 'Từ đặc trưng chỉ có ở Đài Loan (bắt nguồn từ tiếng Mân Nam/Đài ngữ).',
    example: {
      traditional: '我們老闆對報告格式很龜毛，你一定要檢查清楚。',
      pinyin: 'Wǒmen lǎobǎn duì bàogào géshì hěn guīmáo, nǐ yídìng yào jiǎnchá qīngchǔ.',
      zhuyin: 'ㄨㄛˇ ㄇㄣ˙ ㄌㄠˇ ㄅㄢˇ ㄉㄨㄟˋ ㄅㄠˋ ㄍㄠˋ ㄍㄜˊ ㄕˋ ㄏㄣˇ ㄍㄨㄟ ㄇㄠˊ，ㄋㄧˇ ㄧˊ ㄉㄧㄥˋ ㄧㄠˋ ㄐㄧㄢˇ ㄔㄚˊ ㄑㄧㄥ ㄔㄨˇ。',
      vietnamese: 'Sếp tụi mình cực kỳ kỹ tínhเรื่อง format báo cáo, bạn nhất định phải kiểm tra kỹ nhé.'
    }
  },
  {
    id: 'tw-6',
    track: 'taiwan-life',
    levelTag: 'Sinh hoạt Đài Loan',
    traditional: '內用外帶',
    simplified: '内用外带',
    pinyin: 'nèiyòng wàidài',
    zhuyin: 'ㄋㄟˋ ㄩㄥˋ ㄨㄞˋ ㄉㄞˋ',
    hanViet: 'nội dụng ngoại đới',
    meaning: 'Ăn tại quán (內用) hay Mang về (外帶)',
    radicalInfo: 'Bộ 入 (Nhập) & Bộ 巾 (Cân - khăn/đai)',
    mnemonic: 'Bước vào bất kỳ quán ăn nào ở Đài Loan, câu đầu tiên chủ quán hỏi là: "請問內用還是外帶？"',
    mainlandDiff: 'Đài Loan nói 內用 / 外帶, trong khi Đại Lục thường nói 堂食 (tángshí) / 打包 (dǎbāo).',
    example: {
      traditional: '老闆：「帥哥，請問今天內用還是外帶？」',
      pinyin: 'Lǎobǎn: "Shuàigē, qǐngwèn jīntiān nèiyòng háishì wàidài?"',
      zhuyin: 'ㄌㄠˇ ㄅㄢˇ：「ㄕㄨㄞˋ ㄍㄜ，ㄑㄧㄥˇ ㄨㄣˋ ㄐㄧㄣ ㄊㄧㄢ ㄋㄟˋ ㄩㄥˋ ㄏㄞˊ ㄕˋ ㄨㄞˋ ㄉㄞˋ？」',
      vietnamese: 'Chủ quán: "Đẹp trai ơi, hôm nay ăn tại quán hay mang về?"'
    }
  }
];

export const TAIWAN_SCENARIOS: ScenarioItem[] = [
  {
    id: '7eleven',
    title: 'Đi cửa hàng tiện lợi 7-Eleven / FamilyMart',
    subtitle: 'Mua đồ ăn, hâm nóng, tích điểm & lưu hóa đơn điện tử (載具)',
    category: 'Sinh hoạt hàng ngày',
    badge: 'Bắt buộc phải biết ở Đài',
    culturalTip: 'Ở Đài Loan, 7-Eleven (小七) và FamilyMart (全家) làm được mọi thứ: nhận hàng Shopee (取貨), đóng tiền học, mua vé tàu, hâm nóng cơm hộp. Thu ngân sẽ hỏi liên hoàn 3 câu cực nhanh về hâm nóng, túi đựng và mã hóa đơn 載具!',
    keyPhrases: [
      { traditional: '需要微波嗎？', pinyin: 'Xūyào wéibō ma?', zhuyin: 'ㄒㄩ ㄧㄠˋ ㄨㄟˊ ㄅㄛ ㄇㄚ˙？', meaning: 'Có cần quay lò vi sóng (hâm nóng) không?' },
      { traditional: '有會員或載具嗎？', pinyin: 'Yǒu huìyuán huò zǎijù ma?', zhuyin: 'ㄧㄡˇ ㄏㄨㄟˋ ㄩㄢˊ ㄏㄨㄛˋ ㄗㄞˇ ㄐㄩˋ ㄇㄚ˙？', meaning: 'Có thẻ thành viên hay mã lưu hóa đơn không?' },
      { traditional: '我要領包裹（取貨）', pinyin: 'Wǒ yào lǐng bāoguǒ (qǔhuò)', zhuyin: 'ㄨㄛˇ ㄧㄠˋ ㄌㄧㄥˇ ㄅㄠ ㄍㄨㄛˇ', meaning: 'Tôi muốn nhận kiện hàng đặt mạng (Shopee...)' }
    ],
    dialogue: [
      {
        speaker: 'Nhân viên 7-11',
        role: 'staff',
        traditional: '歡迎光臨！請問這個便當需要幫您微波嗎？',
        pinyin: 'Huānyíng guānglín! Qǐngwèn zhège biàndāng xūyào bāng nín wéibō ma?',
        zhuyin: 'ㄏㄨㄢ ㄧㄥˊ ㄍㄨㄤ ㄌㄧㄣˊ！ㄑㄧㄥˇ ㄨㄣˋ ㄓㄜˋ ㄍㄜ˙ ㄅㄧㄢˋ ㄉㄤ ㄒㄩ ㄧㄠˋ ㄅㄤ ㄋㄧㄣˊ ㄨㄟˊ ㄅㄛ ㄇㄚ˙？',
        vietnamese: 'Chào mừng quý khách! Cho hỏi hộp cơm này có cần hâm nóng giúp bạn không?',
        note: '便當 (biàndāng): Cơm hộp; 微波 (wéibō): Hâm nóng lò vi sóng'
      },
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '好，請幫我加熱。另外我要領包裹。',
        pinyin: 'Hǎo, qǐng bāng wǒ jiārè. Lìngwài wǒ yào lǐng bāoguǒ.',
        zhuyin: 'ㄏㄠˇ，ㄑㄧㄥˇ ㄅㄤ ㄨㄛˇ ㄐㄧㄚ ㄖㄜˋ。ㄌㄧㄥˋ ㄨㄞˋ ㄨㄛˇ ㄧㄠˋ ㄌㄧㄥˇ ㄅㄠ ㄍㄨㄛˇ。',
        vietnamese: 'Vâng, làm ơn hâm nóng giúp mình. Ngoài ra mình muốn lấy kiện hàng.',
        note: '加熱 (jiārè) hoặc 微波 đều dùng được'
      },
      {
        speaker: 'Nhân viên 7-11',
        role: 'staff',
        traditional: '好的，請問電話末三碼是多少？如果是零元包裹，請給我看證件喔！',
        pinyin: 'Hǎo de, qǐngwèn diànhuà mò sān mǎ shì duōshǎo? Rúguǒ shì líng yuán bāoguǒ, qǐng gěi wǒ kàn zhèngjiàn ō!',
        zhuyin: 'ㄏㄠˇ ㄉㄜ˙，ㄑㄧㄥˇ ㄨㄣˋ ㄉㄧㄢˋ ㄏㄨㄚˋ ㄇㄛˋ ㄙㄢ ㄇㄚˇ ㄕˋ ㄉㄨㄛ ㄕㄠˇ？ㄖㄨˊ ㄍㄨㄛˇ ㄕˋ ㄌㄧㄥˊ ㄩㄢˊ ㄅㄠ ㄍㄨㄛˇ，ㄑㄧㄥˇ ㄍㄟˇ ㄨㄛˇ ㄎㄢˋ ㄓㄥˋ ㄐㄧㄢˋ ㄛ！',
        vietnamese: 'Vâng, cho hỏi 3 số cuối điện thoại là gì ạ? Nếu là đơn đã thanh toán trước (0 đồng), vui lòng cho mình xem giấy tờ tùy thân (thẻ cư trú ARC) nhé!',
        note: '電話末三碼: 3 số cuối SĐT — Câu hỏi kinh điển khi lấy hàng ở Đài!'
      },
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '末三碼是 568。我用悠遊卡付錢，發票存載具，謝謝！',
        pinyin: 'Mò sān mǎ shì wǔ-liù-bā. Wǒ yòng Yōuyóukǎ fùqián, fāpiào cún zǎijù, xièxie!',
        zhuyin: 'ㄇㄛˋ ㄙㄢ ㄇㄚˇ ㄕˋ 568。ㄨㄛˇ ㄩㄥˋ ㄧㄡ ㄧㄡˊ ㄎㄚˇ ㄈㄨˋ ㄑㄧㄢˊ，ㄈㄚ ㄆㄧㄠˋ ㄘㄨㄣˊ ㄗㄞˇ ㄐㄩˋ，ㄒㄧㄝˋ ㄒㄧㄝ˙！',
        vietnamese: '3 số cuối là 568. Mình trả tiền bằng thẻ EasyCard, hóa đơn lưu vào mã 載具 nhé, cảm ơn!',
        note: '悠遊卡 (Yōuyóukǎ): Thẻ EasyCard dùng đi tàu, xe buýt và thanh toán siêu thị'
      }
    ]
  },
  {
    id: 'bubble-tea',
    title: 'Order Trà sữa chuẩn người bản xứ (手搖飲)',
    subtitle: 'Chọn mức đường (甜度), mức đá (冰塊), topping & túi đựng',
    category: 'Ẩm thực & Đời sống',
    badge: 'Giao tiếp thực chiến',
    culturalTip: 'Đài Loan là quê hương trà sữa (手搖飲). Khi gọi nước, bạn luôn phải chốt: Tên món + Size (중/大杯) + Độ ngọt (微糖/半糖/無糖) + Độ đá (微冰/去冰).',
    keyPhrases: [
      { traditional: '甜度冰塊怎麼調？', pinyin: 'Tiándù bīngkuài zěnme tiáo?', zhuyin: 'ㄊㄧㄢˊ ㄉㄨˋ ㄅㄧㄥ ㄎㄨㄞˋ ㄗㄣˇ ㄇㄜ˙ ㄊㄧㄠˊ？', meaning: 'Độ ngọt và đá điều chỉnh thế nào ạ?' },
      { traditional: '微糖微冰 / 半糖少冰', pinyin: 'Wéitáng wéibīng / Bàntáng shǎobīng', zhuyin: 'ㄨㄟˊ ㄊㄤˊ ㄨㄟˊ ㄅㄧㄥ', meaning: '30% đường 30% đá / 50% đường 70% đá' },
      { traditional: '需要袋子嗎？', pinyin: 'Xūyào dàizi ma?', zhuyin: 'ㄒㄩ ㄧㄠˋ ㄉㄞˋ ㄗ˙ ㄇㄚ˙？', meaning: 'Có cần túi nilon đựng không? (thường tốn 1-2 Đài tệ)' }
    ],
    dialogue: [
      {
        speaker: 'Nhân viên quán trà',
        role: 'staff',
        traditional: '你好，請問今天要喝什麼？',
        pinyin: 'Nǐhǎo, qǐngwèn jīntiān yào hē shénme?',
        zhuyin: 'ㄋㄧˇ ㄏㄠˇ，ㄑㄧㄥˇ ㄨㄣˋ ㄐㄧㄣ ㄊㄧㄢ ㄧㄠˋ ㄏㄜ ㄕㄣˊ ㄇㄜ˙？',
        vietnamese: 'Xin chào, hôm nay bạn muốn uống gì ạ?'
      },
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '不好意思，我要一杯大杯的四季春加波霸。',
        pinyin: 'Bù hǎoyìsi, wǒ yào yì bēi dà bēi de Sìjìchūn jiā bōbà.',
        zhuyin: 'ㄅㄨˋ ㄏㄠˇ ㄧˋ ㄙ˙，ㄨㄛˇ ㄧㄠˋ ㄧˋ ㄅㄟ ㄉㄚˋ ㄅㄟ ㄉㄜ˙ ㄙˋ ㄐㄧˋ ㄔㄨㄣ ㄐㄧㄚ ㄅㄛ ㄅㄚˋ。',
        vietnamese: 'Cho mình một ly trà Tứ Quý Xuân size lớn thêm trân châu hạt to (Boba).',
        note: 'Ở Đài: 波霸 (bōbà) là trân châu hạt lớn, 珍珠 (zhēnzhū) đôi khi chỉ hạt nhỏ'
      },
      {
        speaker: 'Nhân viên quán trà',
        role: 'staff',
        traditional: '好的，請問甜度冰塊怎麼調整？',
        pinyin: 'Hǎo de, qǐngwèn tiándù bīngkuài zěnme tiáozhěng?',
        zhuyin: 'ㄏㄠˇ ㄉㄜ˙，ㄑㄧㄥˇ ㄨㄣˋ ㄊㄧㄢˊ ㄉㄨˋ ㄅㄧㄥ ㄎㄨㄞˋ ㄗㄣˇ ㄇㄜ˙ ㄊㄧㄠˊ ㄓㄥˇ？',
        vietnamese: 'Vâng, cho hỏi độ ngọt và đá điều chỉnh thế nào ạ?'
      },
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '微糖微冰就好了。我自己有帶環保杯！',
        pinyin: 'Wéitáng wéibīng jiù hǎole. Wǒ zìjǐ yǒu dài huánbǎobēi!',
        zhuyin: 'ㄨㄟˊ ㄊㄤˊ ㄨㄟˊ ㄅㄧㄥ ㄐㄧㄡˋ ㄏㄠˇ ㄌㄜ˙。ㄨㄛˇ ㄗˋ ㄐㄧˇ ㄧㄡˇ ㄉㄞˋ ㄏㄨㄢˊ ㄅㄠˇ ㄅㄟ！',
        vietnamese: '30% đường 30% đá là được rồi. Mình có tự mang bình cá nhân (cốc bảo vệ môi trường)!',
        note: 'Mang 環保杯 (huánbǎobēi) ở Đài Loan được giảm ngay 5 Đài tệ theo luật!'
      }
    ]
  },
  {
    id: 'workplace-b1',
    title: 'Giao tiếp Công sở & Trường học (Trình độ B1)',
    subtitle: 'Thảo luận dự án, xin nghỉ phép & trao đổi lịch sự với người Đài',
    category: 'Công sở & Học thuật (B1)',
    badge: 'TOCFL Band B',
    culturalTip: 'Người Đài Loan trong công việc rất lịch sự, hay dùng từ giảm nhẹ như "麻煩你 (Phiền bạn)", "不好意思", "辛苦了 (Vất vả cho bạn rồi)" thay vì ra lệnh trực tiếp.',
    keyPhrases: [
      { traditional: '麻煩你了，辛苦了！', pinyin: 'Máfán nǐ le, xīnkǔ le!', zhuyin: 'ㄇㄚˊ ㄈㄢˊ ㄋㄧˇ ㄌㄜ˙，ㄒㄧㄣ ㄎㄨˇ ㄌㄜ˙！', meaning: 'Làm phiền bạn rồi, vất vả cho bạn quá!' },
      { traditional: '跟您確認一下進度', pinyin: 'Gēn nín quèrèn yíxià jìndù', zhuyin: 'ㄍㄣ ㄋㄧㄣˊ ㄑㄩㄝˋ ㄖㄣˋ ㄧˊ ㄒㄧㄚˋ ㄐㄧㄣˋ ㄉㄨˋ', meaning: 'Xin xác nhận lại tiến độ với anh/chị một chút' },
      { traditional: '真歹勢 (台語)', pinyin: 'Chīn phái-sè (Đài ngữ)', zhuyin: 'ㄓㄣ ㄆㄞˇ ㄙㄟˋ', meaning: 'Thật ngại quá / Xin lỗi nhé (tiếng Đài cực thân thiện)' }
    ],
    dialogue: [
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '學長，不好意思打擾一下，想跟你確認明天報告的進度。',
        pinyin: 'Xuézhǎng, bù hǎoyìsi dǎrǎo yíxià, xiǎng gēn nǐ quèrèn míngtiān bàogào de jìndù.',
        zhuyin: 'ㄒㄩㄝˊ ㄓㄤˇ，ㄅㄨˋ ㄏㄠˇ ㄧˋ ㄙ˙ ㄉㄚˇ ㄖㄠˇ ㄧˊ ㄒㄧㄚˋ，ㄒㄧㄤˇ ㄍㄣ ㄋㄧˇ ㄑㄩㄝˋ ㄖㄣˋ ㄇㄧㄥˊ ㄊㄧㄢ ㄅㄠˋ ㄍㄠˋ ㄉㄜ˙ ㄐㄧㄣˋ ㄉㄨˋ。',
        vietnamese: 'Đàn anh ơi, xin lỗi làm phiền một chút, em muốn xác nhận với anh tiến độ bài thuyết trình ngày mai.'
      },
      {
        speaker: 'Đàn anh người Đài',
        role: 'friend',
        traditional: '喔！我剛好改完簡報檔了，待會兒傳到 LINE 群組給你參考喔！',
        pinyin: 'Ō! Wǒ gānghǎo gǎiwán jiǎnbàodǎng le, dāihuǐr chuándào LINE qúnzǔ gěi nǐ cānkǎo ō!',
        zhuyin: 'ㄛ！ㄨㄛˇ ㄍㄤ ㄏㄠˇ ㄍㄞˇ ㄨㄢˊ ㄐㄧㄢˇ ㄅㄠˋ ㄉㄤˇ ㄌㄜ˙，ㄉㄞ ㄏㄨㄟˇ ㄦ˙ ㄔㄨㄢˊ ㄉㄠˋ LINE ㄑㄩㄣˊ ㄗㄨˇ ㄍㄟˇ ㄋㄧˇ ㄘㄢ ㄎㄠˇ ㄛ！',
        vietnamese: 'Ồ! Anh vừa sửa xong file slide (PowerPoint) rồi, lát nữa gửi vào nhóm LINE cho em tham khảo nhé!',
        note: 'Người Đài dùng LINE cho mọi liên lạc cá nhân lẫn công việc; 簡報檔 (jiǎnbàodǎng) = file slide thuyết trình'
      },
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '太感謝了！這幾天真的麻煩學長了，辛苦了！',
        pinyin: 'Tài gǎnxiè le! Zhè jǐ tiān zhēnde máfán xuézhǎng le, xīnkǔ le!',
        zhuyin: 'ㄊㄞˋ ㄍㄢˇ ㄒㄧㄝˋ ㄌㄜ˙！ㄓㄜˋ ㄐㄧˇ ㄊㄧㄢ ㄓㄣ ㄉㄜ˙ ㄇㄚˊ ㄈㄢˊ ㄒㄩㄝˊ ㄓㄤˇ ㄌㄜ˙，ㄒㄧㄣ ㄎㄨˇ ㄌㄜ˙！',
        vietnamese: 'Cảm ơn anh nhiều lắm! Mấy hôm nay thật sự làm phiền anh quá, anh vất vả rồi!'
      }
    ]
  }
];

export const TAIWAN_VS_MAINLAND = [
  { meaning: 'Tàu điện ngầm (MRT)', taiwan: '捷運 (jiéyùn)', mainland: '地鐵 (dìtiě)', note: 'Từ vựng TOCFL A1 bắt buộc' },
  { meaning: 'Xe máy', taiwan: '機車 (jīchē)', mainland: '摩托車 (mótuōchē)', note: '機車 còn là tính từ lóng = khó ưa' },
  { meaning: 'Xe đạp', taiwan: '腳踏車 (jiǎotàchē)', mainland: '自行車 (zìxíngchē)', note: 'Ở Đài thuê xe đạp công cộng là YouBike' },
  { meaning: 'Rác / Thùng rác', taiwan: '垃圾 (lèsè)', mainland: '垃圾 (lājī)', note: 'Chú ý phát âm chuẩn Đài là lèsè (ㄌㄜˋ ㄙㄜˋ)!' },
  { meaning: 'Quả dứa (thơm)', taiwan: '鳳梨 (fènglí)', mainland: '菠蘿 (bōluó)', note: 'Bánh dứa Đài Loan: 鳳梨酥 (fènglísū)' },
  { meaning: 'Khoai tây', taiwan: '馬鈴薯 (mǎlíngshǔ)', mainland: '土豆 (tǔdòu)', note: 'Ở Đài Loan 土豆 nghĩa là củ lạc (đậu phộng)!' },
  { meaning: 'Mì ăn liền (Mì gói)', taiwan: '泡麵 (pàomiàn)', mainland: '方便麵 (fāngbiànmiàn)', note: 'Dùng hàng ngày ở ký túc xá / siêu thị' },
  { meaning: 'Ống hút', taiwan: '吸管 (xīguǎn)', mainland: '吸管 / 飲管', note: 'Khi mua trà sữa: 需要吸管嗎？' },
  { meaning: 'Mạng Internet / Online', taiwan: '網路 (wǎnglù)', mainland: '網絡 (wǎngluò)', note: 'Đề thi TOCFL luôn dùng 網路' },
  { meaning: 'Phần mềm / Phần cứng', taiwan: '軟體 / 硬體 (ruǎntǐ / yìngtǐ)', mainland: '軟件 / 硬件 (ruǎnjiàn / yìngjiàn)', note: 'Thuật ngữ công nghệ chuẩn Đài' },
  { meaning: 'Video / Clip', taiwan: '影片 (yǐngpiàn)', mainland: '視頻 (shìpín)', note: 'Xem video YouTube ở Đài gọi là 看影片' },
  { meaning: 'Buổi sáng sớm', taiwan: '早上 / 晨間', mainland: '早晨', note: 'Bữa sáng ở Đài: 早餐店 (zǎocāndiàn)' },
];

export const GRAMMAR_B1_LIST: GrammarPoint[] = [
  {
    id: 'g-1',
    level: 'TOCFL A2',
    pattern: '除了……以外，還 / 也……',
    pinyin: 'Chúle... yǐwài, hái / yě...',
    meaning: 'Ngoài... ra, còn / cũng... (Bổ sung thêm thông tin)',
    explanation: 'Cấu trúc cực kỳ phổ biến trong bài thi TOCFL Band A2 và B1. Dùng để liệt kê thêm đối tượng hoặc hành động cùng tính chất.',
    examples: [
      {
        traditional: '除了臺北以外，我也去過臺中和高雄。',
        pinyin: 'Chúle Táiběi yǐwài, wǒ yě qùguò Táizhōng hé Gāoxióng.',
        vietnamese: 'Ngoài Đài Bắc ra, tôi cũng từng đi Đài Trung và Cao Hùng rồi.'
      }
    ]
  },
  {
    id: 'g-2',
    level: 'TOCFL B1',
    pattern: '既然……，就……',
    pinyin: 'Jìrán..., jiù...',
    meaning: 'Đã... thì... (Đưa ra đề nghị/kết luận dựa trên sự thật đã rõ)',
    explanation: 'Trọng điểm ngữ pháp Đương Đại 3 (TOCFL B1). Vế đầu nêu tiền đề đã xảy ra hoặc cả hai bên đều biết, vế sau dùng 就 để suy ra quyết định hợp lý.',
    examples: [
      {
        traditional: '既然你已經來到臺灣了，就應該去逛逛夜市。',
        pinyin: 'Jìrán nǐ yǐjīng láidào Táiwān le, jiù yīnggāi qù guàngguang yèshì.',
        vietnamese: 'Đã đến Đài Loan rồi thì bạn nên đi dạo chợ đêm một chuyến.'
      }
    ]
  },
  {
    id: 'g-3',
    level: 'TOCFL B1',
    pattern: '哪怕 / 即使……，也……',
    pinyin: 'Nǎpà / Jíshǐ..., yě...',
    meaning: 'Cho dù / Dù có... đi nữa thì vẫn...',
    explanation: 'Biểu thị giả định nhượng bộ ở mức độ cao, thường xuất hiện trong phần Đọc điền từ và Đọc hiểu TOCFL Band B.',
    examples: [
      {
        traditional: '即使繁體字筆畫比較多，只要掌握部首也很容易記住。',
        pinyin: 'Jíshǐ fántǐzì bǐhuà bǐjiào duō, zhǐyào zhǎngwò bùshǒu yě hěn róngyì jìzhù.',
        vietnamese: 'Cho dù chữ Phồn thể có nhiều nét hơn, chỉ cần nắm vững bộ thủ thì cũng rất dễ nhớ.'
      }
    ]
  },
  {
    id: 'g-4',
    level: 'TOCFL B1',
    pattern: '看來 / 看起來……',
    pinyin: 'Kànlái / Kànqǐlái...',
    meaning: 'Xem ra / Nhìn có vẻ như là... (Phán đoán qua quan sát thực tế)',
    explanation: 'Rất hay dùng trong cả khẩu ngữ Đài Loan lẫn bài nghe TOCFL B1 khi người nói đưa ra nhận định khách quan.',
    examples: [
      {
        traditional: '外面烏雲密布，看來待會兒要下大雨了。',
        pinyin: 'Wàimiàn wūyún mìbù, kànlái dāihuǐr yào xià dàyǔ le.',
        vietnamese: 'Bên ngoài mây đen kéo kín, xem ra lát nữa sắp mưa to rồi.'
      }
    ]
  }
];

export const READING_PASSAGES: ReadingPassage[] = [
  {
    id: 'read-b1-1',
    level: 'TOCFL B1',
    title: 'Thông báo Tuyển dụng & Thực tập sinh tại Đài Bắc (招考公告)',
    category: 'Đọc hiểu TOCFL Band B',
    paragraphs: [
      {
        traditional: '【寶島科技公司－國際行銷實習生招募】本公司位於臺北市信義區，目前正在尋找對東南亞市場有興趣的大學生或研究生加入我們的團隊。',
        pinyin: '[Bǎodǎo Kējì Gōngsī - Guójì Xíngxiāo Shíxíshēng Zhāomù] Běn gōngsī wèiyú Táiběishì Xìnyìqū, mùqián zhèngzài xúnzhǎo duì Dōngnányà shìchǎng yǒu xìngqù de dàxuéshēng huò yánjiūshēng jiārù wǒmen de tuánduì.',
        vietnamese: '[Công ty Công nghệ Bảo Đảo - Tuyển Thực tập sinh Marketing Quốc tế] Công ty chúng tôi tọa lạc tại quận Tín Nghĩa, TP. Đài Bắc, hiện đang tìm kiếm sinh viên đại học hoặc cao học có hứng thú với thị trường Đông Nam Á gia nhập đội ngũ.'
      },
      {
        traditional: '申請條件：需具備華語文能力測驗（TOCFL）進階級（B1）以上證書，熟悉越南語及英語者優先錄取。每週至少配合上班三天，時薪新臺幣 210 元，並提供免費午餐與勞健保。意者請於本月底前將履歷寄至人事部信箱。',
        pinyin: 'Shēnqǐng tiáojiàn: Xū jùbèi Huáyǔwén Nénglì Cèyàn (TOCFL) Jìnjiējí (B1) yǐshàng zhèngshū, shúxī Yuènányǔ jí Yīngyǔ zhě yōuxiān lùqǔ. Měi zhōu zhìshǎo pèihé shàngbān sān tiān, shíxīn Xīntáibì 210 yuán, bìng tígōng miǎnfèi wǔcān yǔ láojiànbǎo. Yìzhě qǐng yú běnyuè dǐ qián jiāng lǚlì jìzhì rénshìbù xìnxiāng.',
        vietnamese: 'Điều kiện ứng tuyển: Cần có chứng chỉ TOCFL cấp Tiến giai (B1) trở lên, ưu tiên trúng tuyển người thông thạo tiếng Việt và tiếng Anh. Mỗi tuần làm việc ít nhất 3 ngày, lương theo giờ 210 Đài tệ, kèm bữa trưa miễn phí và bảo hiểm lao động/y tế. Người quan tâm vui lòng gửi CV về hòm thư phòng Nhân sự trước cuối tháng này.'
      }
    ],
    glossary: [
      { word: '行銷', pinyin: 'xíngxiāo', zhuyin: 'ㄒㄧㄥˊ ㄒㄧㄠ', hanViet: 'hành tiêu', meaning: 'Marketing, tiếp thị (Từ chuẩn Đài Loan)' },
      { word: '實習生', pinyin: 'shíxíshēng', zhuyin: 'ㄕˊ ㄒㄧˊ ㄕㄥ', hanViet: 'thực tập sinh', meaning: 'Thực tập sinh (Intern)' },
      { word: '優先錄取', pinyin: 'yōuxiān lùqǔ', zhuyin: 'ㄧㄡ ㄒㄧㄢ ㄌㄨˋ ㄑㄩˇ', hanViet: 'ưu tiên lục thủ', meaning: 'Ưu tiên tuyển chọn/nhận vào' },
      { word: '時薪', pinyin: 'shíxīn', zhuyin: 'ㄕˊ ㄒㄧㄣ', hanViet: 'thời tân', meaning: 'Lương trả theo giờ' },
      { word: '勞健保', pinyin: 'láojiànbǎo', zhuyin: 'ㄌㄠˊ ㄐㄧㄢˋ ㄅㄠˇ', hanViet: 'lao kiện bảo', meaning: 'Bảo hiểm lao động (勞保) & Bảo hiểm y tế (健保) tại Đài Loan' },
      { word: '履歷', pinyin: 'lǚlì', zhuyin: 'ㄌㄩˇ ㄌㄧˋ', hanViet: 'lý lịch', meaning: 'Sơ yếu lý lịch / CV xin việc' }
    ],
    questions: [
      {
        question: '根據這則廣告，申請人必須具備什麼條件？ (Theo thông báo, người ứng tuyển bắt buộc phải có điều kiện gì?)',
        options: [
          'A. 已經從大學畢業兩年以上 (Đã tốt nghiệp đại học trên 2 năm)',
          'B. 通過華語測驗 B1 等級以上 (Đạt chứng chỉ TOCFL cấp B1 trở lên)',
          'C. 每天都必須到公司上班 (Mỗi ngày đều phải đến công ty làm việc)',
          'D. 住在臺北市信義區附近 (Sống ở gần quận Tín Nghĩa, Đài Bắc)'
        ],
        correctIndex: 1,
        explanation: 'Trong bài nêu rõ: 「申請條件：需具備華語文能力測驗（TOCFL）進階級（B1）以上證書」.'
      },
      {
        question: '這份實習工作提供什麼福利？ (Công việc thực tập này cung cấp phúc lợi gì?)',
        options: [
          'A. 免費住宿與機票 (Chỗ ở và vé máy bay miễn phí)',
          'B. 免費午餐與勞健保 (Bữa trưa miễn phí và bảo hiểm lao động/y tế)',
          'C. 每個月提供獎學金 (Mỗi tháng cấp học bổng)',
          'D. 免費提供機車代步 (Cung cấp xe máy đi lại miễn phí)'
        ],
        correctIndex: 1,
        explanation: 'Trong bài viết: 「並提供免費午餐與勞健保」 (và cung cấp bữa trưa miễn phí cùng bảo hiểm lao động - y tế).'
      }
    ]
  }
];

