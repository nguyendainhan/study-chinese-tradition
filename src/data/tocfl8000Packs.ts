import { VocabItem } from './courseData';

export interface TocflPack {
  id: string;
  title: string;
  level: string;
  description: string;
  badgeColor: string;
  words: VocabItem[];
}

export const TOCFL_8000_PACKS: TocflPack[] = [
  {
    id: 'pack-a1-core',
    title: 'Gói TOCFL Band A1 · Sinh hoạt & Trường học (入門級)',
    level: 'TOCFL A1',
    description: 'Các từ vựng cốt lõi xuất hiện 100% trong đề thi TOCFL Nhập môn & Đương Đại Quyển 1.',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    words: [
      {
        id: 'p-a1-1',
        track: 'tocfl-a',
        levelTag: 'TOCFL A1',
        traditional: '圖書館',
        simplified: '图书馆',
        pinyin: 'túshūguǎn',
        zhuyin: 'ㄊㄨˊ ㄕㄨ ㄍㄨㄢˇ',
        hanViet: 'đồ thư quán',
        meaning: 'Thư viện',
        radicalInfo: 'Bộ 囗 (Vi) + Bộ 曰 (Viết) + Bộ 食 (Thực)',
        mnemonic: 'Nơi (館) lưu giữ bản đồ/tranh (圖) và sách vở (書).',
        example: {
          traditional: '週末我常去大學的圖書館看書。',
          pinyin: 'Zhōumò wǒ cháng qù dàxué de túshūguǎn kànshū.',
          zhuyin: 'ㄓㄡ ㄇㄛˋ ㄨㄛˇ ㄔㄤˊ ㄑㄩˋ ㄉㄚˋ ㄒㄩㄝˊ ㄉㄜ˙ ㄊㄨˊ ㄕㄨ ㄍㄨㄢˇ ㄎㄢˋ ㄕㄨ。',
          vietnamese: 'Cuối tuần tôi thường đến thư viện trường đại học đọc sách.'
        }
      },
      {
        id: 'p-a1-2',
        track: 'tocfl-a',
        levelTag: 'TOCFL A1',
        traditional: '便利商店',
        simplified: '便利商店',
        pinyin: 'biànlì shāngdiàn',
        zhuyin: 'ㄅㄧㄢˋ ㄌㄧˋ ㄕㄤ ㄉㄧㄢˋ',
        hanViet: 'tiện lợi thương điếm',
        meaning: 'Cửa hàng tiện lợi (7-Eleven, FamilyMart, Hi-Life, OK Mart)',
        radicalInfo: 'Bộ 人 (Nhân 亻) & Bộ 广 (Nghiễm)',
        mnemonic: 'Đài Loan là nơi có mật độ 便利商店 dày đặc nhất thế giới.',
        mainlandDiff: 'Đài Loan gọi đầy đủ là 便利商店 hoặc 超商 (chāoshāng), Đại Lục gọi là 便利店.',
        example: {
          traditional: '臺灣的便利商店二十四小時都開著。',
          pinyin: 'Táiwān de biànlì shāngdiàn èrshísì xiǎoshí dōu kāizhe.',
          zhuyin: 'ㄊㄞˊ ㄨㄢ ㄉㄜ˙ ㄅㄧㄢˋ ㄌㄧˋ ㄕㄤ ㄉㄧㄢˋ ㄦˋ ㄕˊ ㄙˋ ㄒㄧㄠˇ ㄕˊ ㄉㄡ ㄎㄞ ㄓㄜ˙。',
          vietnamese: 'Cửa hàng tiện lợi ở Đài Loan mở cửa suốt 24 giờ.'
        }
      },
      {
        id: 'p-a1-3',
        track: 'tocfl-a',
        levelTag: 'TOCFL A1',
        traditional: '腳踏車',
        simplified: '自行车',
        pinyin: 'jiǎotàchē',
        zhuyin: 'ㄐㄧㄠˇ ㄊㄚˋ ㄔㄜ',
        hanViet: 'cước đạp xa',
        meaning: 'Xe đạp (Giống hoàn toàn cách gọi tiếng Việt: xe đạp bằng chân)',
        radicalInfo: 'Bộ 肉 (Nhục 月) + Bộ 足 (Túc) + Bộ 車 (Xa)',
        mnemonic: 'Chân (腳) đạp (踏) chiếc xe (車) — Cực dễ nhớ cho người Việt!',
        mainlandDiff: 'Đài Loan dùng 腳踏車 (hoặc 單車), Đại Lục dùng 自行車.',
        example: {
          traditional: '我每天騎 YouBike 腳踏車去搭捷運。',
          pinyin: 'Wǒ měitiān qí YouBike jiǎotàchē qù dā jiéyùn.',
          zhuyin: 'ㄨㄛˇ ㄇㄟˇ ㄊㄧㄢ ㄑㄧˊ YouBike ㄐㄧㄠˇ ㄊㄚˋ ㄔㄜ ㄑㄩˋ ㄉㄚ ㄐㄧㄝˊ ㄩㄣˋ。',
          vietnamese: 'Mỗi ngày tôi đều đạp xe YouBike ra trạm tàu điện ngầm MRT.'
        }
      },
      {
        id: 'p-a1-4',
        track: 'tocfl-a',
        levelTag: 'TOCFL A1',
        traditional: '計程車',
        simplified: '出租车',
        pinyin: 'jìchéngchē',
        zhuyin: 'ㄐㄧˋ ㄔㄥˊ ㄔㄜ',
        hanViet: 'kế trình xa',
        meaning: 'Xe taxi (Ở Đài Loan còn gọi thân mật là 小黃)',
        radicalInfo: 'Bộ 言 (Ngôn) & Bộ 車 (Xa)',
        mnemonic: 'Xe (車) tính tiền theo quãng đường (計程).',
        mainlandDiff: 'Đài Loan dùng 計程車, Đại Lục dùng 出租車.',
        example: {
          traditional: '下雨天的時候很難叫到計程車。',
          pinyin: 'Xiàyǔtiān de shíhòu hěn nán jiàodào jìchéngchē.',
          zhuyin: 'ㄒㄧㄚˋ ㄩˇ ㄊㄧㄢ ㄉㄜ˙ ㄕˊ ㄏㄡˋ ㄏㄣˇ ㄋㄢˊ ㄐㄧㄠˋ ㄉㄠˋ ㄐㄧˋ ㄔㄥˊ ㄔㄜ。',
          vietnamese: 'Những ngày trời mưa rất khó gọi được xe taxi.'
        }
      }
    ]
  },
  {
    id: 'pack-a2-life',
    title: 'Gói TOCFL Band A2 · Du lịch, Thời tiết & Y tế (基礎級)',
    level: 'TOCFL A2',
    description: 'Từ vựng cần thiết để đạt chuẩn TOCFL A2 (du học hệ ngôn ngữ / đại học cơ bản).',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    words: [
      {
        id: 'p-a2-1',
        track: 'tocfl-a',
        levelTag: 'TOCFL A2',
        traditional: '颱風',
        simplified: '台风',
        pinyin: 'táifēng',
        zhuyin: 'ㄊㄞˊ ㄈㄥ',
        hanViet: 'đài phong',
        meaning: 'Bão lớn (Đặc trưng thời tiết mùa hè - thu tại Đài Loan)',
        radicalInfo: 'Bộ 風 (Phong - gió)',
        mnemonic: 'Ở Đài Loan có "ngày nghỉ bão" gọi là 颱風假 (táifēngjià).',
        example: {
          traditional: '因為颱風來了，今天政府宣布放颱風假。',
          pinyin: 'Yīnwèi táifēng láile, jīntiān zhèngfǔ xuānbù fàng táifēngjià.',
          zhuyin: 'ㄧㄣ ㄨㄟˋ ㄊㄞˊ ㄈㄥ ㄌㄞˊ ㄌㄜ˙，ㄐㄧㄣ ㄊㄧㄢ ㄓㄥˋ ㄈㄨˇ ㄒㄩㄢ ㄅㄨˋ ㄈㄤˋ ㄊㄞˊ ㄈㄥ ㄐㄧㄚˋ。',
          vietnamese: 'Vì bão tới nên hôm nay chính phủ thông báo được nghỉ bão.'
        }
      },
      {
        id: 'p-a2-2',
        track: 'tocfl-a',
        levelTag: 'TOCFL A2',
        traditional: '健保卡',
        simplified: '医保卡',
        pinyin: 'jiànbǎokǎ',
        zhuyin: 'ㄐㄧㄢˋ ㄅㄠˇ ㄎㄚˇ',
        hanViet: 'kiện bảo tạp',
        meaning: 'Thẻ bảo hiểm y tế toàn dân tại Đài Loan (NHI Card)',
        radicalInfo: 'Bộ 人 (Nhân 亻) & Bộ 卜 (Bốc)',
        mnemonic: '全民健康保險卡 viết tắt là 健保卡.',
        example: {
          traditional: '在臺灣去診所看病一定要帶健保卡。',
          pinyin: 'Zài Táiwān qù zhěnsuǒ kànbìng yídìng yào dài jiànbǎokǎ.',
          zhuyin: 'ㄗㄞˋ ㄊㄞˊ ㄨㄢ ㄑㄩˋ ㄓㄣˇ ㄙㄨㄛˇ ㄎㄢˋ ㄅㄧㄥˋ ㄧˊ ㄉㄧㄥˋ ㄧㄠˋ ㄉㄞˋ ㄐㄧㄢˋ ㄅㄠˇ ㄎㄚˇ。',
          vietnamese: 'Ở Đài Loan khi đi phòng khám khám bệnh nhất định phải mang thẻ bảo hiểm y tế.'
        }
      },
      {
        id: 'p-a2-3',
        track: 'tocfl-a',
        levelTag: 'TOCFL A2',
        traditional: '房東',
        simplified: '房东',
        pinyin: 'fángdōng',
        zhuyin: 'ㄈㄤˊ ㄉㄨㄥ',
        hanViet: 'phòng đông',
        meaning: 'Chủ nhà trọ, chủ cho thuê nhà',
        radicalInfo: 'Bộ 戶 (Hộ - cửa nhà) & Bộ 木 (Mộc)',
        mnemonic: 'Chủ nhân (東) của căn phòng/nhà (房) = Chủ nhà trọ.',
        example: {
          traditional: '我的房東人很好，還請我吃自己種的水果。',
          pinyin: 'Wǒ de fángdōng rén hěn hǎo, hái qǐng wǒ chī zìjǐ zhòng de shuǐguǒ.',
          zhuyin: 'ㄨㄛˇ ㄉㄜ˙ ㄈㄤˊ ㄉㄨㄥ ㄖㄣˊ ㄏㄣˇ ㄏㄠˇ，ㄏㄞˊ ㄑㄧㄥˇ ㄨㄛˇ ㄔ ㄗˋ ㄐㄧˇ ㄓㄨㄥˋ ㄉㄜ˙ ㄕㄨㄟˇ ㄍㄨㄛˇ。',
          vietnamese: 'Chủ nhà trọ của tôi rất tốt bụng, còn mời tôi ăn trái cây tự trồng.'
        }
      },
      {
        id: 'p-a2-4',
        track: 'tocfl-a',
        levelTag: 'TOCFL A2',
        traditional: '冷氣',
        simplified: '空调',
        pinyin: 'lěngqì',
        zhuyin: 'ㄌㄥˇ ㄑㄧˋ',
        hanViet: 'lãnh khí',
        meaning: 'Máy lạnh, điều hòa nhiệt độ',
        radicalInfo: 'Bộ 冫 (Băng) & Bộ 气 (Khí)',
        mnemonic: 'Khí (氣) lạnh (冷) = Máy điều hòa.',
        mainlandDiff: 'Đài Loan dùng 冷氣, Đại Lục dùng 空調.',
        example: {
          traditional: '離開房間以前，請記得把冷氣關掉。',
          pinyin: 'Líkāi fángjiān yǐqián, qǐng jìdé bǎ lěngqì guāndiào.',
          zhuyin: 'ㄌㄧˊ ㄎㄞ ㄈㄤˊ ㄐㄧㄢ ㄧˇ ㄑㄧㄢˊ，ㄑㄧㄥˇ ㄐㄧˋ ㄉㄜ˙ ㄅㄚˇ ㄌㄥˇ ㄑㄧˋ ㄍㄨㄢ ㄉㄧㄠˋ。',
          vietnamese: 'Trước khi rời khỏi phòng, vui lòng nhớ tắt máy lạnh.'
        }
      }
    ]
  },
  {
    id: 'pack-b1-academic',
    title: 'Gói TOCFL Band B1 · Công sở, Kinh tế & Học thuật (進階級)',
    level: 'TOCFL B1',
    description: 'Bộ từ vựng trọng tâm giúp vượt qua kỳ thi TOCFL B1 để xin học bổng hoặc đi làm tại công ty Đài Loan.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    words: [
      {
        id: 'p-b1-1',
        track: 'tocfl-b1',
        levelTag: 'TOCFL B1',
        traditional: '獎學金',
        simplified: '奖学金',
        pinyin: 'jiǎngxuéjīn',
        zhuyin: 'ㄐㄧㄤˇ ㄒㄩㄝˊ ㄐㄧㄣ',
        hanViet: 'thưởng học kim',
        meaning: 'Học bổng',
        radicalInfo: 'Bộ 大 (Đại), Bộ 子 (Tử) & Bộ 金 (Kim)',
        mnemonic: 'Khoản tiền (金) khen thưởng (獎) cho việc học (學).',
        example: {
          traditional: '他因為成績優異，順利申請到臺灣獎學金。',
          pinyin: 'Tā yīnwèi chéngjī yōuyì, shùnlì shēnqǐng dào Táiwān jiǎngxuéjīn.',
          zhuyin: 'ㄊㄚ ㄧㄣ ㄨㄟˋ ㄔㄥˊ ㄐㄧ ㄧㄡ ㄧˋ，ㄕㄨㄣˋ ㄌㄧˋ ㄕㄣ ㄑㄧㄥˇ ㄉㄠˋ ㄊㄞˊ ㄨㄢ ㄐㄧㄤˇ ㄒㄩㄝˊ ㄐㄧㄣ。',
          vietnamese: 'Nhờ thành tích xuất sắc, anh ấy đã thuận lợi xin được học bổng Đài Loan.'
        }
      },
      {
        id: 'p-b1-2',
        track: 'tocfl-b1',
        levelTag: 'TOCFL B1',
        traditional: '效率',
        simplified: '效率',
        pinyin: 'xiàolǜ',
        zhuyin: 'ㄒㄧㄠˋ ㄌㄩˋ',
        hanViet: 'hiệu suất',
        meaning: 'Hiệu suất, năng suất làm việc',
        radicalInfo: 'Bộ 攵 (Phộc) & Bộ 玄 (Huyền)',
        mnemonic: 'Kết quả đạt được (效) trên một tỷ lệ thời gian (率) = Hiệu suất.',
        example: {
          traditional: '開會前先準備大綱，可以提高討論的效率。',
          pinyin: 'Kāihuì qián xiān zhǔnbèi dàgāng, kěyǐ tígāo tǎolùn de xiàolǜ.',
          zhuyin: 'ㄎㄞ ㄏㄨㄟˋ ㄑㄧㄢˊ ㄒㄧㄢ ㄓㄨㄣˇ ㄅㄟˋ ㄉㄚˋ ㄍㄤ，ㄎㄜˇ ㄧˇ ㄊㄧˊ ㄍㄠ ㄊㄠˇ ㄌㄨㄣˋ ㄉㄜ˙ ㄒㄧㄠˋ ㄌㄩˋ。',
          vietnamese: 'Chuẩn bị đề cương trước khi họp có thể nâng cao hiệu suất thảo luận.'
        }
      },
      {
        id: 'p-b1-3',
        track: 'tocfl-b1',
        levelTag: 'TOCFL B1',
        traditional: '報名',
        simplified: '报名',
        pinyin: 'bàomíng',
        zhuyin: 'ㄅㄠˋ ㄇㄧㄥˊ',
        hanViet: 'báo danh',
        meaning: 'Đăng ký, ghi danh (kỳ thi, khóa học, hoạt động)',
        radicalInfo: 'Bộ 土 (Thổ) & Bộ 口 (Khẩu)',
        mnemonic: 'Báo (報) tên (名) vào danh sách tham dự.',
        example: {
          traditional: '這次華語測驗的報名人數比去年多了一倍。',
          pinyin: 'Zhè cì Huáyǔ Cèyàn de bàomíng rénshù bǐ qùnián duōle yí bèi.',
          zhuyin: 'ㄓㄜˋ ㄘˋ ㄏㄨㄚˊ ㄩˇ ㄘㄜˋ ㄧㄢˋ ㄉㄜ˙ ㄅㄠˋ ㄇㄧㄥˊ ㄖㄣˊ ㄕㄨˋ ㄅㄧˇ ㄑㄩˋ ㄋㄧㄢˊ ㄉㄨㄛ ㄌㄜ˙ ㄧˊ ㄅㄟˋ。',
          vietnamese: 'Số người đăng ký thi TOCFL đợt này tăng gấp đôi so với năm ngoái.'
        }
      },
      {
        id: 'p-b1-4',
        track: 'tocfl-b1',
        levelTag: 'TOCFL B1',
        traditional: '投資',
        simplified: '投资',
        pinyin: 'tóuzī',
        zhuyin: 'ㄊㄡˊ ㄗ',
        hanViet: 'đầu tư',
        meaning: 'Đầu tư (tài chính, giáo dục, bản thân)',
        radicalInfo: 'Bộ 手 (Thủ 扌) & Bộ 貝 (Bối - tiền bạc)',
        mnemonic: 'Bỏ vốn tiền tài (資 - bộ Bối 貝) vào một lĩnh vực (投).',
        example: {
          traditional: '學習第二外語是對自己未來最好的投資。',
          pinyin: 'Xuéxí dì-èr wàiyǔ shì duì zìjǐ wèilái zuì hǎo de tóuzī.',
          zhuyin: 'ㄒㄩㄝˊ ㄒㄧˊ ㄉㄧˋ ㄦˋ ㄨㄞˋ ㄩˇ ㄕˋ ㄉㄨㄟˋ ㄗˋ ㄐㄧˇ ㄨㄟˋ ㄌㄞˊ ㄗㄨㄟˋ ㄏㄠˇ ㄉㄜ˙ ㄊㄡˊ ㄗ。',
          vietnamese: 'Học ngoại ngữ thứ hai là khoản đầu tư tốt nhất cho tương lai của chính mình.'
        }
      },
      {
        id: 'p-b1-5',
        track: 'tocfl-b1',
        levelTag: 'TOCFL B1',
        traditional: '影響',
        simplified: '影响',
        pinyin: 'yǐngxiǎng',
        zhuyin: 'ㄧㄥˇ ㄒㄧㄤˇ',
        hanViet: 'ảnh hưởng',
        meaning: 'Ảnh hưởng, tác động',
        radicalInfo: 'Bộ 彡 (Sam - bóng) & Bộ 音 (Âm - tiếng vang)',
        mnemonic: 'Như hình với bóng (影), như âm với tiếng vang (響) = Ảnh hưởng lẫn nhau.',
        example: {
          traditional: '睡眠不足會嚴重影響隔天的工作表現。',
          pinyin: 'Shuìmián bùzú huì yánzhòng yǐngxiǎng gétiān de gōngzuò biǎoxiàn.',
          zhuyin: 'ㄕㄨㄟˋ ㄇㄧㄢˊ ㄅㄨˋ ㄗㄨˊ ㄏㄨㄟˋ ㄧㄢˊ ㄓㄨㄥˋ ㄧㄥˇ ㄒㄧㄤˇ ㄍㄜˊ ㄊㄧㄢ ㄉㄜ˙ ㄍㄨㄥ ㄗㄨㄛˋ ㄅㄧㄠˇ ㄒㄧㄢˋ。',
          vietnamese: 'Thiếu ngủ sẽ ảnh hưởng nghiêm trọng đến biểu hiện công việc ngày hôm sau.'
        }
      }
    ]
  },
  {
    id: 'pack-tw-slang',
    title: 'Gói Giao tiếp & Khẩu ngữ Người Đài (臺灣道地口語)',
    level: 'Khẩu ngữ Đài',
    description: 'Những từ người Đài nói mỗi ngày ngoài đời thực, trên LINE, Threads và trong văn phòng.',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    words: [
      {
        id: 'p-tw-1',
        track: 'taiwan-life',
        levelTag: 'Khẩu ngữ Đài',
        traditional: '誇張',
        simplified: '夸张',
        pinyin: 'kuāzhāng',
        zhuyin: 'ㄎㄨㄚ ㄓㄤ',
        hanViet: 'khoa trương',
        meaning: 'Làm quá, khó tin, khủng khiếp ("太誇張了吧!" = Thật không thể tin nổi!)',
        radicalInfo: 'Bộ 言 (Ngôn) & Bộ 弓 (Cung)',
        mnemonic: 'Câu cảm thán cửa miệng của giới trẻ Đài Loan khi thấy chuyện bất ngờ.',
        example: {
          traditional: '這家店排隊要排三個小時，太誇張了吧！',
          pinyin: 'Zhè jiā diàn páiduì yào pái sān gè xiǎoshí, tài kuāzhāng le ba!',
          zhuyin: 'ㄓㄜˋ ㄐㄧㄚ ㄉㄧㄢˋ ㄆㄞˊ ㄉㄨㄟˋ ㄧㄠˋ ㄆㄞˊ ㄙㄢ ㄍㄜˋ ㄒㄧㄠˇ ㄕˊ，ㄊㄞˋ ㄎㄨㄚ ㄓㄤ ㄌㄜ˙ ㄅㄚ˙！',
          vietnamese: 'Quán này xếp hàng phải chờ tới 3 tiếng đồng hồ, thiệt quá sức tưởng tượng!'
        }
      },
      {
        id: 'p-tw-2',
        track: 'taiwan-life',
        levelTag: 'Khẩu ngữ Đài',
        traditional: '真的假的',
        simplified: '真的假的',
        pinyin: 'zhēnde jiǎde',
        zhuyin: 'ㄓㄣ ㄉㄜ˙ ㄐㄧㄚˇ ㄉㄜ˙',
        hanViet: 'chân đích giả đích',
        meaning: 'Thật á? / Thật hay đùa đấy? (Câu phản xạ cực tự nhiên khi nghe tin mới)',
        radicalInfo: 'Bộ 目 (Mục) & Bộ 人 (Nhân 亻)',
        mnemonic: 'Người Đài dùng 真的假的？ thay cho "Really?" trong mọi cuộc trò chuyện.',
        example: {
          traditional: 'A：我考過 TOCFL B1 了！ B：真的假的？太厲害了吧！',
          pinyin: 'A: Wǒ kǎoguò TOCFL B1 le! B: Zhēnde jiǎde? Tài lìhài le ba!',
          zhuyin: 'A：ㄨㄛˇ ㄎㄠˇ ㄍㄨㄛˋ TOCFL B1 ㄌㄜ˙！ B：ㄓㄣ ㄉㄜ˙ ㄐㄧㄚˇ ㄉㄜ˙？ㄊㄞˋ ㄌㄧˋ ㄏㄞˋ ㄌㄜ˙ ㄅㄚ˙！',
          vietnamese: 'A: Mình thi đỗ TOCFL B1 rồi! B: Thật á? Đỉnh quá vậy!'
        }
      },
      {
        id: 'p-tw-3',
        track: 'taiwan-life',
        levelTag: 'Khẩu ngữ Đài',
        traditional: '辛苦了',
        simplified: '辛苦了',
        pinyin: 'xīnkǔ le',
        zhuyin: 'ㄒㄧㄣ ㄎㄨˇ ㄌㄜ˙',
        hanViet: 'tân khổ liễu',
        meaning: 'Bạn vất vả rồi! (Câu nói lịch sự ấm áp khi đồng nghiệp/nhân viên giúp đỡ)',
        radicalInfo: 'Bộ 辛 (Tân - cay/vất vả) & Bộ 艸 (Thảo 艹)',
        mnemonic: 'Nói khi tan làm, khi shipper giao đồ, hoặc khi đồng nghiệp hoàn thành việc.',
        example: {
          traditional: '今天加班到這麼晚，大家辛苦了！',
          pinyin: 'Jīntiān jiābān dào zhème wǎn, dàjiā xīnkǔ le!',
          zhuyin: 'ㄐㄧㄣ ㄊㄧㄢ ㄐㄧㄚ ㄅㄢ ㄉㄠˋ ㄓㄜˋ ㄇㄜ˙ ㄨㄢˇ，ㄉㄚˋ ㄐㄧㄚ ㄒㄧㄣ ㄎㄨˇ ㄌㄜ˙！',
          vietnamese: 'Hôm nay tăng ca đến muộn thế này, mọi người vất vả rồi!'
        }
      },
      {
        id: 'p-tw-4',
        track: 'taiwan-life',
        levelTag: 'Đài ngữ (台語)',
        traditional: '歹勢',
        simplified: '歹势',
        pinyin: 'phái-sè (Đài ngữ)',
        zhuyin: 'ㄆㄞˇ ㄙㄟˋ',
        hanViet: 'đãi thế',
        meaning: 'Xin lỗi / Ngại quá! (Từ tiếng Đài 台語 được người Đài dùng hàng ngày)',
        radicalInfo: 'Bộ 歹 (Đãi) & Bộ 力 (Lực)',
        mnemonic: 'Đọc là "Phái-sè", nếu nói được từ này người Đài sẽ cực kỳ quý bạn!',
        example: {
          traditional: '真歹勢，讓你久等了！',
          pinyin: 'Chīn phái-sè, ràng nǐ jiǔ děng le!',
          zhuyin: 'ㄓㄣ ㄆㄞˇ ㄙㄟˋ，ㄖㄤˋ ㄋㄧˇ ㄐㄧㄡˇ ㄉㄥˇ ㄌㄜ˙！',
          vietnamese: 'Thật ngại quá, để bạn phải đợi lâu rồi!'
        }
      }
    ]
  }
];

