import { ScenarioItem } from './courseData';

export interface TaiwanSlangItem {
  id: string;
  word: string;
  pinyin: string;
  zhuyin: string;
  origin: 'Khẩu ngữ Đài Loan' | 'Đài ngữ (台語)' | 'Giới trẻ / Mạng xã hội';
  meaning: string;
  usageNote: string;
  exampleZh: string;
  examplePy: string;
  exampleVi: string;
}

export const FULL_TAIWAN_SCENARIOS: ScenarioItem[] = [
  {
    id: 'airport-mrt',
    title: '1. Sân bay Đào Viên: Mua SIM, Thẻ 悠遊卡 & Đi MRT (桃園機場入境)',
    subtitle: 'Tình huống đầu tiên ngay khi đặt chân xuống Đài Loan',
    category: 'Mới sang Đài Loan',
    badge: 'Tân binh bắt buộc biết',
    culturalTip: 'Ngay tại sảnh入境 (nhập cảnh) sân bay Đào Viên, bạn nên mua SIM 4G/5G không giới hạn dung lượng (吃到飽) và mua thẻ 悠遊卡 (EasyCard) nạp sẵn 500 Đài tệ để đi tàu Airport MRT (機場捷運) về Đài Bắc.',
    keyPhrases: [
      { traditional: '網路吃到飽', pinyin: 'Wǎnglù chīdàobǎo', zhuyin: 'ㄨㄤˇ ㄌㄨˋ ㄔ ㄉㄠˋ ㄅㄠˇ', meaning: 'Gói mạng 4G/5G không giới hạn dung lượng (Unlimited data)' },
      { traditional: '幫我儲值五百元', pinyin: 'Bāng wǒ chúzhí wǔbǎi yuán', zhuyin: 'ㄅㄤ ㄨㄛˇ ㄔㄨˊ ㄓˊ ㄨˇ ㄅㄞˇ ㄩㄢˊ', meaning: 'Nạp tiền (儲值/加值) vào thẻ giúp tôi 500 Đài tệ' },
      { traditional: '往臺北車站的直達車', pinyin: 'Wǎng Táiběi Chēzhàn de zhídáchē', zhuyin: 'ㄨㄤˇ ㄊㄞˊ ㄅㄟˇ ㄔㄜ ㄓㄢˋ ㄉㄜ˙ ㄓˊ ㄉㄚˊ ㄔㄜ', meaning: 'Tàu chạy thẳng (Express màu tím) về ga Đài Bắc' }
    ],
    dialogue: [
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '不好意思，我想辦一張三十天網路吃到飽的電話卡。',
        pinyin: 'Bù hǎoyìsi, wǒ xiǎng bàn yì zhāng sānshí tiān wǎnglù chīdàobǎo de diànhuàkǎ.',
        zhuyin: 'ㄅㄨˋ ㄏㄠˇ ㄧˋ ㄙ˙，ㄨㄛˇ ㄒㄧㄤˇ ㄅㄢˋ ㄧˋ ㄓㄤ ㄙㄢ ㄕˊ ㄊㄧㄢ ㄨㄤˇ ㄌㄨˋ ㄔ ㄉㄠˋ ㄅㄠˇ ㄉㄜ˙ ㄉㄧㄢˋ ㄏㄨㄚˋ ㄎㄚˇ。',
        vietnamese: 'Xin lỗi cho hỏi, mình muốn làm một SIM điện thoại gói mạng không giới hạn 30 ngày.',
        note: '吃到飽 (chīdàobǎo): nghĩa gốc là buffet ăn thả ga, dùng cho viễn thông nghĩa là gói Data không giới hạn!'
      },
      {
        speaker: 'Nhân viên quầy SIM',
        role: 'staff',
        traditional: '好的！請給我您的護照跟登機證，我們現在幫您開通。',
        pinyin: 'Hǎo de! Qǐng gěi wǒ nín de hùzhào gēn dēngjīzhèng, wǒmen xiànzài bāng nín kāitōng.',
        zhuyin: 'ㄏㄠˇ ㄉㄜ˙！ㄑㄧㄥˇ ㄍㄟˇ ㄨㄛˇ ㄋㄧㄣˊ ㄉㄜ˙ ㄏㄨˋ ㄓㄠˋ ㄍㄣ ㄉㄥ ㄐㄧ ㄓㄥˋ，ㄨㄛˇ ㄇㄣ˙ ㄒㄧㄢˋ ㄗㄞˋ ㄅㄤ ㄋㄧㄣˊ ㄎㄞ ㄊㄨㄥ。',
        vietnamese: 'Vâng! Vui lòng cho mình mượn hộ chiếu và thẻ lên máy bay của bạn, tụi mình kích hoạt ngay cho bạn.',
        note: '開通 (kāitōng): kích hoạt SIM/dịch vụ'
      },
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '另外我想買一張悠遊卡，請幫我加值五百塊，謝謝！',
        pinyin: 'Lìngwài wǒ xiǎng mǎi yì zhāng Yōuyóukǎ, qǐng bāng wǒ jiāzhí wǔbǎi kuài, xièxie!',
        zhuyin: 'ㄌㄧㄥˋ ㄨㄞˋ ㄨㄛˇ ㄒㄧㄤˇ ㄇㄞˇ ㄧˋ ㄓㄤ ㄧㄡ ㄧㄡˊ ㄎㄚˇ，ㄑㄧㄥˇ ㄅㄤ ㄨㄛˇ ㄐㄧㄚ ㄓˊ ㄨˇ ㄅㄞˇ ㄎㄨㄞˋ，ㄒㄧㄝˋ ㄒㄧㄝ˙！',
        vietnamese: 'Ngoài ra mình muốn mua 1 thẻ EasyCard, làm ơn nạp giúp mình 500 Đài tệ, cảm ơn!',
        note: 'Ở Đài Loan nạp tiền vào thẻ gọi là 加值 (jiāzhí) hoặc 儲值 (chúzhí)'
      }
    ]
  },
  {
    id: '7eleven',
    title: '2. Cửa hàng tiện lợi 7-Eleven / FamilyMart (超商買東西與取貨)',
    subtitle: 'Mua cơm hộp, hâm nóng, nhận hàng Shopee & lưu hóa đơn 載具',
    category: 'Sinh hoạt hàng ngày',
    badge: 'Dùng mỗi ngày ở Đài',
    culturalTip: '7-Eleven (小七) và FamilyMart (全家) là trung tâm sinh hoạt ở Đài Loan. Khi tính tiền, thu ngân luôn hỏi: 1. Cần hâm nóng không (需要微波嗎), 2. Cần túi không (需要袋子嗎), 3. Lưu hóa đơn vào app không (發票存載具嗎).',
    keyPhrases: [
      { traditional: '需要微波嗎？', pinyin: 'Xūyào wéibō ma?', zhuyin: 'ㄒㄩ ㄧㄠˋ ㄨㄟˊ ㄅㄛ ㄇㄚ˙？', meaning: 'Có cần quay lò vi sóng (hâm nóng) không?' },
      { traditional: '有會員或載具嗎？', pinyin: 'Yǒu huìyuán huò zǎijù ma?', zhuyin: 'ㄧㄡˇ ㄏㄨㄟˋ ㄩㄢˊ ㄏㄨㄛˋ ㄗㄞˇ ㄐㄩˋ ㄇㄚ˙？', meaning: 'Có thẻ thành viên hay mã lưu hóa đơn điện tử không?' },
      { traditional: '我要領包裹（取貨）', pinyin: 'Wǒ yào lǐng bāoguǒ (qǔhuò)', zhuyin: 'ㄨㄛˇ ㄧㄠˋ ㄌㄧㄥˇ ㄅㄠ ㄍㄨㄛˇ', meaning: 'Tôi muốn nhận kiện hàng đặt mạng (Shopee...)' }
    ],
    dialogue: [
      {
        speaker: 'Nhân viên 7-11',
        role: 'staff',
        traditional: '歡迎光臨！請問這個便當需要幫您微波嗎？',
        pinyin: 'Huānyíng guānglín! Qǐngwèn zhège biàndāng xūyào bāng nín wéibō ma?',
        zhuyin: 'ㄏㄨㄢ ㄧㄥˊ ㄍㄨㄤ ㄌㄧㄣˊ！ㄑㄧㄥˇ ㄨㄣˋ ㄓㄜˋ ㄍㄜ˙ ㄅㄧㄢˋ ㄉㄤ ㄒㄩ ㄧㄠˋ ㄅㄤ ㄋㄧㄣˊ ㄨㄟˊ ㄅㄛ ㄇㄚ˙？',
        vietnamese: 'Chào mừng quý khách! Cho hỏi hộp cơm này có cần hâm nóng giúp bạn không?'
      },
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '好，請幫我加熱。另外我要領蝦皮的包裹。',
        pinyin: 'Hǎo, qǐng bāng wǒ jiārè. Lìngwài wǒ yào lǐng Xiāpí de bāoguǒ.',
        zhuyin: 'ㄏㄠˇ，ㄑㄧㄥˇ ㄅㄤ ㄨㄛˇ ㄐㄧㄚ ㄖㄜˋ。ㄌㄧㄥˋ ㄨㄞˋ ㄨㄛˇ ㄧㄠˋ ㄌㄧㄥˇ ㄒㄧㄚ ㄆㄧˊ ㄉㄜ˙ ㄅㄠ ㄍㄨㄛˇ。',
        vietnamese: 'Vâng, làm ơn hâm nóng giúp mình. Ngoài ra mình muốn lấy kiện hàng Shopee (蝦皮).',
        note: '蝦皮 (Xiāpí): Shopee Đài Loan'
      },
      {
        speaker: 'Nhân viên 7-11',
        role: 'staff',
        traditional: '好的，請問電話末三碼是多少？如果是零元包裹，請給我看居留證喔！',
        pinyin: 'Hǎo de, qǐngwèn diànhuà mò sān mǎ shì duōshǎo? Rúguǒ shì líng yuán bāoguǒ, qǐng gěi wǒ kàn jūliúzhèng ō!',
        zhuyin: 'ㄏㄠˇ ㄉㄜ˙，ㄑㄧㄥˇ ㄨㄣˋ ㄉㄧㄢˋ ㄏㄨㄚˋ ㄇㄛˋ ㄙㄢ ㄇㄚˇ ㄕˋ ㄉㄨㄛ ㄕㄠˇ？ㄖㄨˊ ㄍㄨㄛˇ ㄕˋ ㄌㄧㄥˊ ㄩㄢˊ ㄅㄠ ㄍㄨㄛˇ，ㄑㄧㄥˇ ㄍㄟˇ ㄨㄛˇ ㄎㄢˋ ㄐㄩ ㄌㄧㄡˊ ㄓㄥˋ ㄛ！',
        vietnamese: 'Vâng, cho hỏi 3 số cuối điện thoại là bao nhiêu ạ? Nếu là đơn 0 đồng (đã trả trước), vui lòng cho xem thẻ cư trú ARC nhé!'
      },
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '末三碼是 568。我用悠遊卡付錢，發票存載具，謝謝！',
        pinyin: 'Mò sān mǎ shì wǔ-liù-bā. Wǒ yòng Yōuyóukǎ fùqián, fāpiào cún zǎijù, xièxie!',
        zhuyin: 'ㄇㄛˋ ㄙㄢ ㄇㄚˇ ㄕˋ 568。ㄨㄛˇ ㄩㄥˋ ㄧㄡ ㄧㄡˊ ㄎㄚˇ ㄈㄨˋ ㄑㄧㄢˊ，ㄈㄚ ㄆㄧㄠˋ ㄘㄨㄣˊ ㄗㄞˇ ㄐㄩˋ，ㄒㄧㄝˋ ㄒㄧㄝ˙！',
        vietnamese: '3 số cuối là 568. Mình trả tiền bằng thẻ EasyCard, hóa đơn lưu vào mã 載具 nhé, cảm ơn!'
      }
    ]
  },
  {
    id: 'bubble-tea',
    title: '3. Order Trà sữa chuẩn bản xứ (手搖飲點餐)',
    subtitle: 'Chọn mức đường (甜度), mức đá (冰塊), topping & bình cá nhân',
    category: 'Ẩm thực & Đời sống',
    badge: 'Giao tiếp thực chiến',
    culturalTip: 'Khi gọi trà sữa ở Đài Loan (50嵐, 清心, 迷客夏, 得正...), công thức luôn là: Tên món + Size (中杯/大杯) + Độ ngọt (微糖/半糖/無糖) + Độ đá (微冰/去冰). Tự mang 環保杯 được giảm 5 Đài tệ!',
    keyPhrases: [
      { traditional: '甜度冰塊怎麼調？', pinyin: 'Tiándù bīngkuài zěnme tiáo?', zhuyin: 'ㄊㄧㄢˊ ㄉㄨˋ ㄅㄧㄥ ㄎㄨㄞˋ ㄗㄣˇ ㄇㄜ˙ ㄊㄧㄠˊ？', meaning: 'Độ ngọt và đá điều chỉnh thế nào ạ?' },
      { traditional: '微糖微冰 / 半糖去冰', pinyin: 'Wéitáng wéibīng / Bàntáng qùbīng', zhuyin: 'ㄨㄟˊ ㄊㄤˊ ㄨㄟˊ ㄅㄧㄥ', meaning: '30% đường 30% đá / 50% đường không đá' },
      { traditional: '我有自備環保杯', pinyin: 'Wǒ yǒu zìbèi huánbǎobēi', zhuyin: 'ㄨㄛˇ ㄧㄡˇ ㄗˋ ㄅㄟˋ ㄏㄨㄢˊ ㄅㄠˇ ㄅㄟ', meaning: 'Tôi có tự mang bình nước cá nhân (giảm 5 Đài tệ)' }
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
        traditional: '不好意思，我要一杯大杯的四季春加波霸，微糖去冰。',
        pinyin: 'Bù hǎoyìsi, wǒ yào yì bēi dà bēi de Sìjìchūn jiā bōbà, wéitáng qùbīng.',
        zhuyin: 'ㄅㄨˋ ㄏㄠˇ ㄧˋ ㄙ˙，ㄨㄛˇ ㄧㄠˋ ㄧˋ ㄅㄟ ㄉㄚˋ ㄅㄟ ㄉㄜ˙ ㄙˋ ㄐㄧˋ ㄔㄨㄣ ㄐㄧㄚ ㄅㄛ ㄅㄚˋ，ㄨㄟˊ ㄊㄤˊ ㄑㄩˋ ㄅㄧㄥ。',
        vietnamese: 'Cho mình một ly trà Tứ Quý Xuân size lớn thêm trân châu hạt to, 30% đường không đá.'
      },
      {
        speaker: 'Nhân viên quán trà',
        role: 'staff',
        traditional: '好的！請問需要買袋子嗎？有載具可以先刷喔！',
        pinyin: 'Hǎo de! Qǐngwèn xūyào mǎi dàizi ma? Yǒu zǎijù kěyǐ xiān shuā ō!',
        zhuyin: 'ㄏㄠˇ ㄉㄜ˙！ㄑㄧㄥˇ ㄨㄣˋ ㄒㄩ ㄧㄠˋ ㄇㄞˇ ㄉㄞˋ ㄗ˙ ㄇㄚ˙？ㄧㄡˇ ㄗㄞˇ ㄐㄩˋ ㄎㄜˇ ㄧˇ ㄒㄧㄢ ㄕㄨㄚ ㄛ！',
        vietnamese: 'Vâng! Cho hỏi có cần mua túi đựng không? Nếu có mã 載具 thì quét trước nhé!'
      },
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '不用袋子，我自己有帶環保杯！這是我的載具條碼。',
        pinyin: 'Búyòng dàizi, wǒ zìjǐ yǒu dài huánbǎobēi! Zhè shì wǒ de zǎijù tiáomǎ.',
        zhuyin: 'ㄅㄨˊ ㄩㄥˋ ㄉㄞˋ ㄗ˙，ㄨㄛˇ ㄗˋ ㄐㄧˇ ㄧㄡˇ ㄉㄞˋ ㄏㄨㄢˊ ㄅㄠˇ ㄅㄟ！ㄓㄜˋ ㄕˋ ㄨㄛˇ ㄉㄜ˙ ㄗㄞˇ ㄐㄩˋ ㄊㄧㄠˊ ㄇㄚˇ。',
        vietnamese: 'Không cần túi đâu, mình có mang bình cá nhân! Đây là mã vạch 載具 của mình.'
      }
    ]
  },
  {
    id: 'breakfast-shop',
    title: '4. Tiệm Ăn Sáng Đài Loan & Chợ Đêm (早餐店與逛夜市)',
    subtitle: 'Gọi bánh kếp trứng (蛋餅), ăn tại chỗ (內用) hay mang về (外帶)',
    category: 'Ẩm thực & Đời sống',
    badge: 'Văn hóa bản địa',
    culturalTip: 'Vào tiệm ăn sáng (早餐店) ở Đài Loan, bà chủ luôn gọi bạn là 帥哥 (Đẹp trai) hoặc 美女 (Người đẹp)! Hãy nhớ phân biệt 內用 (ăn tại quán - thường lấy phiếu ghi số bàn 桌號) và 外帶 (mang về).',
    keyPhrases: [
      { traditional: '請問內用還是外帶？', pinyin: 'Qǐngwèn nèiyòng háishì wàidài?', zhuyin: 'ㄑㄧㄥˇ ㄨㄣˋ ㄋㄟˋ ㄩㄥˋ ㄏㄞˊ ㄕˋ ㄨㄞˋ ㄉㄞˋ？', meaning: 'Xin hỏi ăn tại quán hay mang về?' },
      { traditional: '一份起司蛋餅、一杯溫豆漿', pinyin: 'Yí fèn qǐsī dànbǐng, yì bēi wēn dòujiāng', zhuyin: 'ㄧˊ ㄈㄣˋ ㄑㄧˇ ㄙ ㄉㄢˋ ㄅㄧㄥˇ', meaning: '1 phần bánh kếp trứng phô mai, 1 ly sữa đậu nành ấm' },
      { traditional: '要加辣嗎？要切嗎？', pinyin: 'Yào jiālà ma? Yào qiē ma?', zhuyin: 'ㄧㄠˋ ㄐㄧㄚ ㄌㄚˋ ㄇㄚ˙？ㄧㄠˋ ㄑㄧㄝ ㄇㄚ˙？', meaning: 'Có thêm cay không? Có cắt nhỏ ra không? (Khi mua gà rán 雞排)' }
    ],
    dialogue: [
      {
        speaker: 'Bà chủ tiệm ăn sáng',
        role: 'staff',
        traditional: '早安！帥哥，今天要吃什麼？內用還是外帶？',
        pinyin: 'Zǎoān! Shuàigē, jīntiān yào chī shénme? Nèiyòng háishì wàidài?',
        zhuyin: 'ㄗㄠˇ ㄢ！ㄕㄨㄞˋ ㄍㄜ，ㄐㄧㄣ ㄊㄧㄢ ㄧㄠˋ ㄔ ㄕㄣˊ ㄇㄜ˙？ㄋㄟˋ ㄩㄥˋ ㄏㄞˊ ㄕˋ ㄨㄞˋ ㄉㄞˋ？',
        vietnamese: 'Chào buổi sáng! Đẹp trai ơi, hôm nay ăn gì nào? Ăn tại quán hay mang về?'
      },
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '老闆娘早！我要外帶一份玉米蛋餅，還有一杯冰紅茶。',
        pinyin: 'Lǎobǎnniáng zǎo! Wǒ yào wàidài yí fèn yùmǐ dànbǐng, háiyǒu yì bēi bīng hóngchá.',
        zhuyin: 'ㄌㄠˇ ㄅㄢˇ ㄋㄧㄤˊ ㄗㄠˇ！ㄨㄛˇ ㄧㄠˋ ㄨㄞˋ ㄉㄞˋ ㄧˊ ㄈㄣˋ ㄩˋ ㄇㄧˇ ㄉㄢˋ ㄅㄧㄥˇ，ㄏㄞˊ ㄧㄡˇ ㄧˋ ㄅㄟ ㄅㄧㄥ ㄏㄨㄥˊ ㄔㄚˊ。',
        vietnamese: 'Chào bà chủ! Cho cháu mang về một phần bánh kếp trứng ngô và một ly hồng trà đá.',
        note: '老闆娘 (lǎobǎnniáng): Bà chủ quán; 蛋餅 (dànbǐng): Món bánh kếp cuộn trứng quốc dân bữa sáng ở Đài'
      },
      {
        speaker: 'Bà chủ tiệm ăn sáng',
        role: 'staff',
        traditional: '好喔！蛋餅要加醬油膏或是辣椒嗎？一共六十五元！',
        pinyin: 'Hǎo ō! Dànbǐng yào jiā jiàngyóugāo huòshì làjiāo ma? Yígòng liùshíwǔ yuán!',
        zhuyin: 'ㄏㄠˇ ㄛ！ㄉㄢˋ ㄅㄧㄥˇ ㄧㄠˋ ㄐㄧㄚ ㄐㄧㄤˋ ㄧㄡˊ ㄍㄠ ㄏㄨㄛˋ ㄕˋ ㄌㄚˋ ㄐㄧㄠ ㄇㄚ˙？ㄧˊ ㄍㄨㄥˋ ㄌㄧㄡˋ ㄕˊ ㄨˇ ㄩㄢˊ！',
        vietnamese: 'Ok nhé! Bánh kếp trứng có thêm sốt xì dầu đặc hay ớt không? Tổng cộng 65 Đài tệ!'
      }
    ]
  },
  {
    id: 'rent-house',
    title: '5. Xem & Thuê Phòng Trọ với Chủ nhà người Đài (看房與租屋簽約)',
    subtitle: 'Phân biệt 套房 / 雅房, hỏi tiền cọc (押金) & cách tính tiền điện nước',
    category: 'Nhà cửa & Sinh hoạt',
    badge: 'TOCFL A2 - B1',
    culturalTip: 'Ở Đài Loan có 2 loại phòng trọ: 套房 (phòng khép kín có toilet riêng) và 雅房 (phòng dùng chung toilet bên ngoài). Khi thuê nên hỏi xem tiền điện tính theo hóa đơn nhà nước (台水台電) hay tính theo số (一度五元 - 5 Đài tệ/số điện).',
    keyPhrases: [
      { traditional: '請問電費怎麼算？', pinyin: 'Qǐngwèn diànfèi zěnme suàn?', zhuyin: 'ㄑㄧㄥˇ ㄨㄣˋ ㄉㄧㄢˋ ㄈㄟˋ ㄗㄣˇ ㄇㄜ˙ ㄙㄨㄢˋ？', meaning: 'Xin hỏi tiền điện tính như thế nào ạ?' },
      { traditional: '押金是兩個月嗎？', pinyin: 'Yājīn shì liǎng gè yuè ma?', zhuyin: 'ㄧㄚ ㄐㄧㄣ ㄕˋ ㄌㄧㄤˇ ㄍㄜˋ ㄩㄝˋ ㄇㄚ˙？', meaning: 'Tiền đặt cọc là 2 tháng phải không ạ?' },
      { traditional: '可以申請租屋補助嗎？', pinyin: 'Kěyǐ shēnqǐng zūwū bǔzhù ma?', zhuyin: 'ㄎㄜˇ ㄧˇ ㄕㄣ ㄑㄧㄥˇ ㄗㄨ ㄨ ㄅㄨˇ ㄓㄨˋ ㄇㄚ˙？', meaning: 'Có được đăng ký xin trợ cấp thuê nhà không ạ?' }
    ],
    dialogue: [
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '房東先生您好，我在租屋網站上看到這間獨立套房，想請問房租包含什麼？',
        pinyin: 'Fángdōng xiānsheng nínhǎo, wǒ zài zūwū wǎngzhàn shàng kàndào zhè jiān dúlì tàofáng, xiǎng qǐngwèn fángzū bāohán shénme?',
        zhuyin: 'ㄈㄤˊ ㄉㄨㄥ ㄒㄧㄢ ㄕㄥ ㄋㄧㄣˊ ㄏㄠˇ，ㄨㄛˇ ㄗㄞˋ ㄗㄨ ㄨ ㄨㄤˇ ㄓㄢˋ ㄕㄤˋ ㄎㄢˋ ㄉㄠˋ ㄓㄜˋ ㄐㄧㄢ ㄉㄨˊ ㄌㄧˋ ㄊㄠˋ ㄈㄤˊ，ㄒㄧㄤˇ ㄑㄧㄥˇ ㄨㄣˋ ㄈㄤˊ ㄗㄨ ㄅㄠ ㄏㄢˊ ㄕㄣˊ ㄇㄜ˙？',
        vietnamese: 'Chào chú chủ nhà, cháu thấy căn phòng khép kín này trên web thuê nhà, muốn hỏi tiền thuê đã bao gồm những gì ạ?'
      },
      {
        speaker: 'Chủ nhà người Đài',
        role: 'staff',
        traditional: '每個月九千元，包含水費、網路跟管理費。電費有獨立電表，一度電五塊錢。',
        pinyin: 'Měi gè yuè jiǔqiān yuán, bāohán shuǐfèi, wǎnglù gēn guǎnlǐfèi. Diànfèi yǒu dúlì diànbiǎo, yí dù diàn wǔ kuài qián.',
        zhuyin: 'ㄇㄟˇ ㄍㄜˋ ㄩㄝˋ ㄐㄧㄡˇ ㄑㄧㄢ ㄩㄢˊ，ㄅㄠ ㄏㄢˊ ㄕㄨㄟˇ ㄈㄟˋ、ㄨㄤˇ ㄌㄨˋ ㄍㄣ ㄍㄨㄢˇ ㄌㄧˇ ㄈㄟˋ。ㄉㄧㄢˋ ㄈㄟˋ ㄧㄡˇ ㄉㄨˊ ㄌㄧˋ ㄉㄧㄢˋ ㄅㄧㄠˇ，ㄧˊ ㄉㄨˋ ㄉㄧㄢˋ ㄨˇ ㄎㄨㄞˋ ㄑㄧㄢˊ。',
        vietnamese: 'Mỗi tháng 9.000 Đài tệ, bao gồm tiền nước, mạng và phí quản lý. Tiền điện có công tơ riêng, 1 số điện (一度電) là 5 Đài tệ.'
      },
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '好的，那如果今天決定簽約的話，押金是付兩個月嗎？',
        pinyin: 'Hǎo de, nà rúguǒ jīntiān juédìng qiānyuē de huà, yājīn shì fù liǎng gè yuè ma?',
        zhuyin: 'ㄏㄠˇ ㄉㄜ˙，ㄋㄚˋ ㄖㄨˊ ㄍㄨㄛˇ ㄐㄧㄣ ㄊㄧㄢ ㄐㄩㄝˊ ㄉㄧㄥˋ ㄑㄧㄢ ㄩㄝ ㄉㄜ˙ ㄏㄨㄚˋ，ㄧㄚ ㄐㄧㄣ ㄕˋ ㄈㄨˋ ㄌㄧㄤˇ ㄍㄜˋ ㄩㄝˋ ㄇㄚ˙？',
        vietnamese: 'Vâng, vậy nếu hôm nay quyết định ký hợp đồng thì tiền cọc đóng 2 tháng phải không ạ?'
      }
    ]
  },
  {
    id: 'clinic-nhi',
    title: '6. Đi Khám Bệnh tại Phòng khám Đài Loan (診所看病與健保卡)',
    subtitle: 'Đăng ký lấy số (掛號), trình thẻ BHYT (健保卡) & nhận thuốc',
    category: 'Y tế & Sức khỏe',
    badge: 'Kỹ năng sinh tồn',
    culturalTip: 'Hệ thống Bảo hiểm Y tế Đài Loan (健保) cực kỳ tốt và rẻ. Khi bị cảm cúm, đau răng, đau bụng nhẹ, người Đài thường ra phòng khám tư (診所) gần nhà thay vì vào bệnh viện lớn (大醫院). Chỉ cần mang 健保卡 và khoảng 150–200 Đài tệ phí 掛號費!',
    keyPhrases: [
      { traditional: '我是初診，我要掛號', pinyin: 'Wǒ shì chūzhěn, wǒ yào guàhào', zhuyin: 'ㄨㄛˇ ㄕˋ ㄔㄨ ㄓㄣˇ，ㄨㄛˇ ㄧㄠˋ ㄍㄨㄚˋ ㄏㄠˋ', meaning: 'Tôi khám lần đầu ở đây (初診), tôi muốn đăng ký lấy số khám' },
      { traditional: '我喉嚨痛、有點發燒', pinyin: 'Wǒ hóulóng tòng, yǒudiǎn fāshāo', zhuyin: 'ㄨㄛˇ ㄏㄡˊ ㄌㄨㄥˊ ㄊㄨㄥˋ、ㄧㄡˇ ㄉㄧㄢˇ ㄈㄚ ㄕㄠ', meaning: 'Tôi bị đau họng và hơi sốt' },
      { traditional: '飯後吃，一天三次', pinyin: 'Fànhòu chī, yì tiān sān cì', zhuyin: 'ㄈㄢˋ ㄏㄡˋ ㄔ，ㄧˋ ㄊㄧㄢ ㄙㄢ ㄘˋ', meaning: 'Uống thuốc sau bữa ăn, ngày 3 lần' }
    ],
    dialogue: [
      {
        speaker: 'Y tá quầy tiếp đón',
        role: 'staff',
        traditional: '你好，請問今天看什麼症狀？有帶健保卡嗎？',
        pinyin: 'Nǐhǎo, qǐngwèn jīntiān kàn shénme zhèngzhuàng? Yǒu dài jiànbǎokǎ ma?',
        zhuyin: 'ㄋㄧˇ ㄏㄠˇ，ㄑㄧㄥˇ ㄨㄣˋ ㄐㄧㄣ ㄊㄧㄢ ㄎㄢˋ ㄕㄣˊ ㄇㄜ˙ ㄓㄥˋ ㄓㄨㄤˋ？ㄧㄡˇ ㄉㄞˋ ㄐㄧㄢˋ ㄅㄠˇ ㄎㄚˇ ㄇㄚ˙？',
        vietnamese: 'Xin chào, hôm nay bạn khám triệu chứng gì? Có mang thẻ bảo hiểm y tế (健保卡) không?'
      },
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '我有帶健保卡。我是第一次來（初診），從昨天開始喉嚨很痛，而且一直咳嗽。',
        pinyin: 'Wǒ yǒu dài jiànbǎokǎ. Wǒ shì dì-yī cì lái (chūzhěn), cóng zuótiān kāishǐ hóulóng hěn tòng, érqiě yìzhí késòu.',
        zhuyin: 'ㄨㄛˇ ㄧㄡˇ ㄉㄞˋ ㄐㄧㄢˋ ㄅㄠˇ ㄎㄚˇ。ㄨㄛˇ ㄕˋ ㄉㄧˋ ㄧ ㄘˋ ㄌㄞˊ（ㄔㄨ ㄓㄣˇ），ㄘㄨㄥˊ ㄗㄨㄛˊ ㄊㄧㄢ ㄎㄞ ㄕˇ ㄏㄡˊ ㄌㄨㄥˊ ㄏㄣˇ ㄊㄨㄥˋ，ㄦˊ ㄑㄧㄝˇ ㄧˋ ㄓˊ ㄎㄜˊ ㄙㄡˋ。',
        vietnamese: 'Mình có mang thẻ BHYT. Mình đến khám lần đầu, từ hôm qua bắt đầu đau họngมาก và ho liên tục.'
      },
      {
        speaker: 'Y tá quầy tiếp đón',
        role: 'staff',
        traditional: '好的，請先幫我填一下初診單，掛號費是兩百元。等一下叫到名字請進二號診間喔！',
        pinyin: 'Hǎo de, qǐng xiān bāng wǒ tián yíxià chūzhěndān, guàhàofèi shì liǎngbǎi yuán. Děng yíxià jiàodào míngzi qǐng jìn èr hào zhěnjiān ō!',
        zhuyin: 'ㄏㄠˇ ㄉㄜ˙，ㄑㄧㄥˇ ㄒㄧㄢ ㄅㄤ ㄨㄛˇ ㄊㄧㄢˊ ㄧˊ ㄒㄧㄚˋ ㄔㄨ ㄓㄣˇ ㄉㄢ，ㄍㄨㄚˋ ㄏㄠˋ ㄈㄟˋ ㄕˋ ㄌㄧㄤˇ ㄅㄞˇ ㄩㄢˊ。ㄉㄥˇ ㄧˊ ㄒㄧㄚˋ ㄐㄧㄠˋ ㄉㄠˋ ㄇㄧㄥˊ ㄗ˙ ㄑㄧㄥˇ ㄐㄧㄣˋ ㄦˋ ㄏㄠˋ ㄓㄣˇ ㄐㄧㄢ ㄛ！',
        vietnamese: 'Vâng, vui lòng điền phiếu khám lần đầu trước nhé, phí đăng ký khám là 200 Đài tệ. Lát nữa gọi đến tên thì mời vào phòng khám số 2 nhé!'
      }
    ]
  },
  {
    id: 'workplace-b1',
    title: '7. Giao tiếp Công sở, Trường học & Nhóm LINE (職場與校園溝通)',
    subtitle: 'Báo cáo tiến độ, nhờ vả lịch sự & văn hóa nhắn tin LINE kiểu Đài',
    category: 'Công sở & Học thuật (B1)',
    badge: 'TOCFL Band B',
    culturalTip: 'Trong công việc và trường học tại Đài Loan, mọi người liên lạc qua LINE. Hãy luôn mở đầu bằng "不好意思打擾了" (Xin lỗi làm phiền), khi nhờ việc nói "再麻煩你了" (Phiền bạn nhé), và khi nhận việc trả lời "收到，謝謝！" (Đã nhận thông tin, cảm ơn!).',
    keyPhrases: [
      { traditional: '再麻煩你了，辛苦了！', pinyin: 'Zài máfán nǐ le, xīnkǔ le!', zhuyin: 'ㄗㄞˋ ㄇㄚˊ ㄈㄢˊ ㄋㄧˇ ㄌㄜ˙，ㄒㄧㄣ ㄎㄨˇ ㄌㄜ˙！', meaning: 'Lại làm phiền bạn rồi, vất vả cho bạn quá!' },
      { traditional: '跟您確認一下進度', pinyin: 'Gēn nín quèrèn yíxià jìndù', zhuyin: 'ㄍㄣ ㄋㄧㄣˊ ㄑㄩㄝˋ ㄖㄣˋ ㄧˊ ㄒㄧㄚˋ ㄐㄧㄣˋ ㄉㄨˋ', meaning: 'Xin xác nhận lại tiến độ với anh/chị một chút' },
      { traditional: '收到，我馬上處理！', pinyin: 'Shōudào, wǒ mǎshàng chǔlǐ!', zhuyin: 'ㄕㄡ ㄉㄠˋ，ㄨㄛˇ ㄇㄚˇ ㄕㄤˋ ㄔㄨˇ ㄌㄧˇ！', meaning: 'Đã nhận được, em sẽ xử lý ngay lập tức!' }
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
        vietnamese: 'Ồ! Anh vừa sửa xong file slide (PowerPoint) rồi, lát nữa gửi vào nhóm LINE cho em tham khảo nhé!'
      },
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '收到，太感謝了！這幾天真的麻煩學長了，辛苦了！',
        pinyin: 'Shōudào, tài gǎnxiè le! Zhè jǐ tiān zhēnde máfán xuézhǎng le, xīnkǔ le!',
        zhuyin: 'ㄕㄡ ㄉㄠˋ，ㄊㄞˋ ㄍㄢˇ ㄒㄧㄝˋ ㄌㄜ˙！ㄓㄜˋ ㄐㄧˇ ㄊㄧㄢ ㄓㄣ ㄉㄜ˙ ㄇㄚˊ ㄈㄢˊ ㄒㄩㄝˊ ㄓㄤˇ ㄌㄜ˙，ㄒㄧㄣ ㄎㄨˇ ㄌㄜ˙！',
        vietnamese: 'Đã nhận ạ, cảm ơn anh nhiều lắm! Mấy hôm nay thật sự làm phiền anh quá, anh vất vả rồi!'
      }
    ]
  },
  {
    id: 'part-time-interview',
    title: '8. Phỏng vấn Xin việc làm thêm & Công ty Đài (打工與工作面試)',
    subtitle: 'Giới thiệu bản thân, hỏi mức lương theo giờ (時薪), lịch排班 & 工作證',
    category: 'Công sở & Việc làm',
    badge: 'TOCFL B1 Thực chiến',
    culturalTip: 'Du học sinh tại Đài Loan đi làm thêm (打工) bắt buộc phải xin Giấy phép lao động sinh viên (工作證 - tối đa 20 giờ/tuần trong học kỳ). Mức lương tối thiểu theo giờ (基本時薪) tại Đài Loan rất rõ ràng và có bảo hiểm 勞保.',
    keyPhrases: [
      { traditional: '我已經有合法的工作證', pinyin: 'Wǒ yǐjīng yǒu héfǎ de gōngzuòzhèng', zhuyin: 'ㄨㄛˇ ㄧˇ ㄐㄧㄥ ㄧㄡˇ ㄏㄜˊ ㄈㄚˇ ㄉㄜ˙ ㄍㄨㄥ ㄗㄨㄛˋ ㄓㄥˋ', meaning: 'Em đã có giấy phép làm thêm (Work Permit) hợp pháp' },
      { traditional: '每週可以配合排班三天', pinyin: 'Měi zhōu kěyǐ pèihé páibān sān tiān', zhuyin: 'ㄇㄟˇ ㄓㄡ ㄎㄜˇ ㄧˇ ㄆㄟˋ ㄏㄜˊ ㄆㄞˊ ㄅㄢ ㄙㄢ ㄊㄧㄢ', meaning: 'Mỗi tuần có thể xếp ca làm việc 3 ngày' },
      { traditional: '請問有提供勞保跟員工餐嗎？', pinyin: 'Qǐngwèn yǒu tígōng láobǎo gēn yuángōngcān ma?', zhuyin: 'ㄑㄧㄥˇ ㄨㄣˋ ㄧㄡˇ ㄊㄧˊ ㄍㄨㄥ ㄌㄠˊ ㄅㄠˇ ㄍㄣ ㄩㄢˊ ㄍㄨㄥ ㄘㄢ ㄇㄚ˙？', meaning: 'Xin hỏi có đóng bảo hiểm lao động và hỗ trợ bữa ăn nhân viên không ạ?' }
    ],
    dialogue: [
      {
        speaker: 'Quản lý cửa hàng',
        role: 'staff',
        traditional: '你好！我看過你的履歷了，你的中文說得很流利耶！請問你有申請學生工作證嗎？',
        pinyin: 'Nǐhǎo! Wǒ kànguò nǐ de lǚlì le, nǐ de Zhōngwén shuō de hěn liúlì yē! Qǐngwèn nǐ yǒu shēnqǐng xuéshēng gōngzuòzhèng ma?',
        zhuyin: 'ㄋㄧˇ ㄏㄠˇ！ㄨㄛˇ ㄎㄢˋ ㄍㄨㄛˋ ㄋㄧˇ ㄉㄜ˙ ㄌㄩˇ ㄌㄧˋ ㄌㄜ˙，ㄋㄧˇ ㄉㄜ˙ ㄓㄨㄥ ㄨㄣˊ ㄕㄨㄛ ㄉㄜ˙ ㄏㄣˇ ㄌㄧㄡˊ ㄌㄧˋ ㄧㄝ！ㄑㄧㄥˇ ㄨㄣˋ ㄋㄧˇ ㄧㄡˇ ㄕㄣ ㄑㄧㄥˇ ㄒㄩㄝˊ ㄕㄥ ㄍㄨㄥ ㄗㄨㄛˋ ㄓㄥˋ ㄇㄚ˙？',
        vietnamese: 'Chào bạn! Mình đã xem CV của bạn rồi, tiếng Trung của bạn nói lưu loát ghê! Cho hỏi bạn đã xin giấy phép làm thêm sinh viên chưa?'
      },
      {
        speaker: 'Bạn',
        role: 'user',
        traditional: '謝謝店長！我已經拿到工作證和居留證了，而且考過了華語測驗 B1。',
        pinyin: 'Xièxie diànzhǎng! Wǒ yǐjīng nádào gōngzuòzhèng hé jūliúzhèng le, érqiě kǎoguòle Huáyǔ Cèyàn B1.',
        zhuyin: 'ㄒㄧㄝˋ ㄒㄧㄝ˙ ㄉㄧㄢˋ ㄓㄤˇ！ㄨㄛˇ ㄧˇ ㄐㄧㄥ ㄋㄚˊ ㄉㄠˋ ㄍㄨㄥ ㄗㄨㄛˋ ㄓㄥˋ ㄏㄜˊ ㄐㄩ ㄌㄧㄡˊ ㄓㄥˋ ㄌㄜ˙，ㄦˊ ㄑㄧㄝˇ ㄎㄠˇ ㄍㄨㄛˋ ㄌㄜ˙ ㄏㄨㄚˊ ㄩˇ ㄘㄜˋ ㄧㄢˋ B1。',
        vietnamese: 'Cảm ơn cửa hàng trưởng! Em đã nhận được giấy phép làm việc và thẻ cư trú ARC rồi, hơn nữa cũng đã thi đỗ TOCFL B1.'
      },
      {
        speaker: 'Quản lý cửa hàng',
        role: 'staff',
        traditional: '太好了！我們時薪是兩百元，有勞保跟免費晚餐。下週一可以開始來實習嗎？',
        pinyin: 'Tài hǎole! Wǒmen shíxīn shì liǎngbǎi yuán, yǒu láobǎo gēn miǎnfèi wǎncān. Xià zhōuyī kěyǐ kāishǐ lái shíxí ma?',
        zhuyin: 'ㄊㄞˋ ㄏㄠˇ ㄌㄜ˙！ㄨㄛˇ ㄇㄣ˙ ㄕˊ ㄒㄧㄣ ㄕˋ ㄌㄧㄤˇ ㄅㄞˇ ㄩㄢˊ，ㄧㄡˇ ㄌㄠˊ ㄅㄠˇ ㄍㄣ ㄇㄧㄢˇ ㄈㄟˋ ㄨㄢˇ ㄘㄢ。ㄒㄧㄚˋ ㄓㄡ ㄧ ㄎㄜˇ ㄧˇ ㄎㄞ ㄕˇ ㄌㄞˊ ㄕˊ ㄒㄧˊ ㄇㄚ˙？',
        vietnamese: 'Tuyệt quá! Lương theo giờ bên mình là 200 Đài tệ, có bảo hiểm lao động và bữa tối miễn phí. Thứ Hai tuần sau bạn bắt đầu đến thử việc được không?'
      }
    ]
  }
];

export const TAIWAN_SLANG_DICTIONARY: TaiwanSlangItem[] = [
  {
    id: 'sl-1',
    word: '不好意思',
    pinyin: 'bù hǎoyìsi',
    zhuyin: 'ㄅㄨˋ ㄏㄠˇ ㄧˋ ㄙ˙',
    origin: 'Khẩu ngữ Đài Loan',
    meaning: 'Xin lỗi làm phiền / Ngại quá / Cho hỏi thăm',
    usageNote: 'Câu cửa miệng số 1 của người Đài trong mọi tình huống: gọi nhân viên, hỏi đường, cảm ơn.',
    exampleZh: '不好意思，借過一下喔！',
    examplePy: 'Bù hǎoyìsi, jièguò yíxià ō!',
    exampleVi: 'Xin lỗi cho mình đi nhờ qua một chút nhé!'
  },
  {
    id: 'sl-2',
    word: '歹勢 (拍謝)',
    pinyin: 'phái-sè (pāixiè)',
    zhuyin: 'ㄆㄞˇ ㄙㄟˋ',
    origin: 'Đài ngữ (台語)',
    meaning: 'Xin lỗi nhé / Thật ngại quá!',
    usageNote: 'Từ tiếng Đài (Mân Nam) được cả người trẻ lẫn người lớn tuổi dùng hàng ngày tạo cảm giác cực kỳ gần gũi.',
    exampleZh: '真歹勢，今天塞車讓你久等了！',
    examplePy: 'Chīn phái-sè, jīntiān sāichē ràng nǐ jiǔ děng le!',
    exampleVi: 'Thật ngại quá, hôm nay kẹt xe làm bạn đợi lâu rồi!'
  },
  {
    id: 'sl-3',
    word: '真的假的',
    pinyin: 'zhēnde jiǎde',
    zhuyin: 'ㄓㄣ ㄉㄜ˙ ㄐㄧㄚˇ ㄉㄜ˙',
    origin: 'Khẩu ngữ Đài Loan',
    meaning: 'Thật á? / Thật hay đùa vậy?',
    usageNote: 'Câu phản xạ tự nhiên nhất khi nghe người Đài kể bất kỳ tin gì (tương đương "Really?").',
    exampleZh: 'A：這家店今天買一送一！ B：真的假的？',
    examplePy: 'A: Zhè jiā diàn jīntiān mǎi yī sòng yī! B: Zhēnde jiǎde?',
    exampleVi: 'A: Quán này hôm nay mua 1 tặng 1 đó! B: Thật á?'
  },
  {
    id: 'sl-4',
    word: '傻眼',
    pinyin: 'shǎyǎn',
    zhuyin: 'ㄕㄚˇ ㄧㄢˇ',
    origin: 'Giới trẻ / Mạng xã hội',
    meaning: 'Đứng hình, cạn lời, bó tay',
    usageNote: 'Dùng khi gặp chuyện vô lý hoặc quá bất ngờ không biết nói gì.',
    exampleZh: '他居然忘記帶准考證，真的讓我很傻眼！',
    examplePy: 'Tā jūrán wàngjì dài zhǔnkǎozhèng, zhēnde ràng wǒ hěn shǎyǎn!',
    exampleVi: 'Cậu ấy vậy mà lại quên mang phiếu dự thi, thật sự làm mình đứng hình luôn!'
  },
  {
    id: 'sl-5',
    word: '龜毛',
    pinyin: 'guīmáo',
    zhuyin: 'ㄍㄨㄟ ㄇㄠˊ',
    origin: 'Đài ngữ (台語)',
    meaning: 'Kỹ tính quá mức, cầu toàn, hay bắt bẻ chi tiết nhỏ',
    usageNote: 'Rùa (龜) vốn không có lông (毛), ai cứ đòi tìm lông rùa tức là quá soi mói, khó tính.',
    exampleZh: '我們主管對報告格式很龜毛。',
    examplePy: 'Wǒmen zhǔguǎn duì bàogào géshì hěn guīmáo.',
    exampleVi: 'Sếp tụi mình cực kỳ kỹ tínhเรื่อง format báo cáo.'
  },
  {
    id: 'sl-6',
    word: '機車',
    pinyin: 'jīchē',
    zhuyin: 'ㄐㄧ ㄔㄜ',
    origin: 'Khẩu ngữ Đài Loan',
    meaning: '1. Xe máy (Danh từ) | 2. Khó ưa, củ chuối, phiền phức (Tính từ lóng)',
    usageNote: 'Nếu ai đó nói "你很機車耶！" thì không phải khen xe máy đâu mà là "Cậu thật khó ưa đấy nhé!".',
    exampleZh: '那個客人要求超多，態度真的很機車！',
    examplePy: 'Nàge kèrén yāoqiú chāo duō, tàidù zhēnde hěn jīchē!',
    exampleVi: 'Vị khách đó đòi hỏi siêu nhiều, thái độ thật sự rất khó chịu!'
  },
  {
    id: 'sl-7',
    word: '誇張',
    pinyin: 'kuāzhāng',
    zhuyin: 'ㄎㄨㄚ ㄓㄤ',
    origin: 'Khẩu ngữ Đài Loan',
    meaning: 'Làm quá, khó tin, khủng khiếp ("太誇張了吧!")',
    usageNote: 'Dùng để cảm thán khi thấy giá quá rẻ/quá đắt, xếp hàng quá đông, hoặc ai đó quá giỏi.',
    exampleZh: '這碗牛肉麵只要八十元，太誇張了吧！',
    examplePy: 'Zhè wǎn niúròumiàn zhǐyào bāshí yuán, tài kuāzhāng le ba!',
    exampleVi: 'Tô mì bò này chỉ có 80 Đài tệ thôi ư, khó tin thật đấy!'
  },
  {
    id: 'sl-8',
    word: '好喔 / 好呀',
    pinyin: 'hǎo ō / hǎo ya',
    zhuyin: 'ㄏㄠˇ ㄛ / ㄏㄠˇ ㄧㄚ',
    origin: 'Khẩu ngữ Đài Loan',
    meaning: 'Ok nhé! / Được luôn!',
    usageNote: 'Người Đài hiếm khi chỉ nói "好" cộc lốc vì nghe hơi lạnh lùng, họ luôn thêm trợ từ ngữ khí 喔, 呀, 啊, 耶 ở cuối câu.',
    exampleZh: '好喔！那我們待會兒見！',
    examplePy: 'Hǎo ō! Nà wǒmen dāihuǐr jiàn!',
    exampleVi: 'Ok nhé! Vậy lát nữa tụi mình gặp nhau nha!'
  },
  {
    id: 'sl-9',
    word: '多謝 (感謝)',
    pinyin: 'to-siā (duōxiè)',
    zhuyin: 'ㄉㄨㄛ ㄒㄧㄝˋ',
    origin: 'Đài ngữ (台語)',
    meaning: 'Cảm ơn nhiều nhé! (Phát âm tiếng Đài: To-siā hoặc Kám-siā)',
    usageNote: 'Nói câu này với các cô chú chủ quán ở chợ đêm hoặc tiệm ăn sáng thì ai cũng cười tươi!',
    exampleZh: '老闆，多謝啦！東西超好吃！',
    examplePy: 'Lǎobǎn, to-siā la! Dōngxi chāo hǎochī!',
    exampleVi: 'Ông chủ ơi, cảm ơn nhiều nhé! Đồ ăn siêu ngon luôn!'
  },
  {
    id: 'sl-10',
    word: 'CP值很高',
    pinyin: 'CP zhí hěn gāo',
    zhuyin: 'CP ㄓˊ ㄏㄣˇ ㄍㄠ',
    origin: 'Giới trẻ / Mạng xã hội',
    meaning: 'Đáng đồng tiền bát gạo (Chất lượng tốt so với giá tiền - Cost/Performance ratio)',
    usageNote: 'Cụm từ người Đài luôn dùng khi review quán ăn, nhà trọ hoặc đồ điện tử.',
    exampleZh: '這間學生餐廳便宜又大碗，CP值超高！',
    examplePy: 'Zhè jiān xuéshēng cāntīng piányí yòu dàwǎn, CP zhí chāo gāo!',
    exampleVi: 'Nhà ăn sinh viên này vừa rẻ vừa đầy đặn, đáng đồng tiền bát gạo cực kỳ!'
  }
];

