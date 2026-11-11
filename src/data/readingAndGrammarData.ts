export interface RichReadingPassage {
  id: string;
  levelCode: 'novice' | 'a1' | 'a2' | 'b1' | 'b2';
  levelBadge: string;
  title: string;
  category: string;
  paragraphs: {
    traditional: string;
    pinyin: string;
    vietnamese: string;
  }[];
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface RichGrammarPoint {
  id: string;
  levelCode: 'novice' | 'a1' | 'a2' | 'b1' | 'b2';
  levelBadge: string;
  book: string; // Đương Đại 1, 2, 3, 4
  category: string;
  pattern: string;
  pinyin: string;
  meaning: string;
  structure: string;
  explanation: string;
  examples: {
    traditional: string;
    pinyin: string;
    vietnamese: string;
  }[];
  quizQuestion: {
    prompt: string;
    options: string[];
    correctIndex: number;
  };
}

export const RICH_READING_PASSAGES: RichReadingPassage[] = [
  {
    id: 'rp-novice-1',
    levelCode: 'novice',
    levelBadge: '準備級 (Novice 1–2)',
    title: 'Tin nhắn LINE hẹn bạn đi ăn tối (LINE 訊息：約吃晚餐)',
    category: 'Sinh hoạt & Giao tiếp hàng ngày',
    paragraphs: [
      {
        traditional: '小安：明華，你今天下午幾點下課？我們晚上一起去師大夜市吃晚餐，怎麼樣？',
        pinyin: 'Xiǎo Ān: Mínghuá, nǐ jīntiān xiàwǔ jǐ diǎn xiàkè? Wǒmen wǎnshàng yìqǐ qù Shīdà Yèshì chī wǎncān, zěnmeyàng?',
        vietnamese: 'Tiểu An: Minh Hoa ơi, chiều nay mấy giờ bạn tan học? Tối nay tụi mình cùng đi chợ đêm Sư Đại ăn tối nhé, thấy sao?'
      },
      {
        traditional: '明華：好啊！我四點半下課。聽說那裡的牛肉麵和珍珠奶茶非常有名，我們五點在捷運站門口見面吧！',
        pinyin: 'Mínghuá: Hǎo a! Wǒ sì diǎn bàn xiàkè. Tīngshuō nàlǐ de niúròumiàn hé zhēnzhū nǎichá fēicháng yǒumíng, wǒmen wǔ diǎn zài jiéyùnzhàn ménkǒu jiànmiàn ba!',
        vietnamese: 'Minh Hoa: Được đó! Mình 4 giờ rưỡi tan học. Nghe nói mì bò và trà sữa trân châu ở đó nổi tiếng lắm, 5 giờ tụi mình gặp nhau ở cổng trạm tàu điện ngầm MRT nhé!'
      }
    ],
    questions: [
      {
        question: '明華今天幾點下課？ (Hôm nay Minh Hoa mấy giờ tan học?)',
        options: ['A. 四點 (4 giờ)', 'B. 四點半 (4 giờ rưỡi)', 'C. 五點 (5 giờ)', 'D. 五點半 (5 giờ rưỡi)'],
        correctIndex: 1,
        explanation: 'Trong tin nhắn Minh Hoa trả lời: 「我四點半下課。」(Mình 4 giờ rưỡi tan học).'
      },
      {
        question: '他們約在哪裡見面？ (Họ hẹn gặp nhau ở đâu?)',
        options: ['A. 學校門口 (Cổng trường)', 'B. 圖書館前面 (Trước thư viện)', 'C. 捷運站門口 (Cổng trạm MRT)', 'D. 牛肉麵店裡面 (Trong quán mì bò)'],
        correctIndex: 2,
        explanation: 'Cuối đoạn Minh Hoa nói: 「我們五點在捷運站門口見面吧！」.'
      }
    ]
  },
  {
    id: 'rp-a1-1',
    levelCode: 'a1',
    levelBadge: '入門級 (TOCFL A1)',
    title: 'Thông báo Tìm phòng trọ gần Trường Đại học (租屋廣告)',
    category: 'Nhà cửa & Đời sống du học',
    paragraphs: [
      {
        traditional: '【學生雅房出租】近臺灣大學，走路到公館捷運站只要五分鐘。附近有便利商店、超市、書店和很多小吃店，生活非常方便。',
        pinyin: '[Xuéshēng Yǎfáng Chūzū] Jìn Táiwān Dàxué, zǒulù dào Gōngguǎn jiéyùnzhàn zhǐyào wǔ fēnzhōng. Fùjìn yǒu biànlì shāngdiàn, chāoshì, shūdiàn hé hěn duō xiǎochīdiàn, shēnghuó fēicháng fāngbiàn.',
        vietnamese: '[Cho thuê phòng trọ sinh viên] Gần Đại học Quốc gia Đài Loan (NTU), đi bộ đến trạm MRT Công Quán chỉ mất 5 phút. Gần đó có cửa hàng tiện lợi, siêu thị, hiệu sách và rất nhiều quán ăn vặt, sinh hoạt vô cùng thuận tiện.'
      },
      {
        traditional: '房間裡面有床、書桌、椅子、衣櫃和冷氣。每個月房租七千五百元（包含水費和網路，電費另計）。歡迎不抽菸、愛乾淨的大學生來看房，意者請打王房東手機：0912-345-678。',
        pinyin: 'Fángjiān lǐmiàn yǒu chuáng, shūzhuō, yǐzi, yīguì hé lěngqì. Měi gè yuè fángzū qīqiān wǔbǎi yuán (bāohán shuǐfèi hé wǎnglù, diànfèi lìngjì). Huānyíng bù chōuyān, ài gānjìng de dàxuéshēng lái kànfáng, yìzhě qǐng dǎ Wáng fángdōng shǒujī: 0912-345-678.',
        vietnamese: 'Trong phòng có giường, bàn học, ghế, tủ quần áo và máy lạnh. Tiền thuê mỗi tháng 7.500 Đài tệ (đã bao gồm tiền nước và Internet, tiền điện tính riêng). Hoan nghênh sinh viên đại học không hút thuốc, ưa sạch sẽ đến xem phòng. Liên hệ SĐT chủ nhà họ Vương: 0912-345-678.'
      }
    ],
    questions: [
      {
        question: '從這個房間走路到捷運站要多久？ (Từ phòng này đi bộ ra trạm MRT mất bao lâu?)',
        options: ['A. 三分鐘 (3 phút)', 'B. 五分鐘 (5 phút)', 'C. 十分鐘 (10 phút)', 'D. 十五分鐘 (15 phút)'],
        correctIndex: 1,
        explanation: 'Trong quảng cáo ghi rõ: 「走路到公館捷運站只要五分鐘。」'
      },
      {
        question: '每個月七千五百元的房租不包含什麼費用？ (Tiền thuê 7.500 Đài tệ/tháng KHÔNG bao gồm chi phí nào?)',
        options: ['A. 水費 (Tiền nước)', 'B. 網路費 (Tiền mạng Internet)', 'C. 電費 (Tiền điện)', 'D. 冷氣與家具 (Máy lạnh & nội thất)'],
        correctIndex: 2,
        explanation: 'Trong bài viết: 「包含水費和網路，電費另計」(Bao gồm nước và mạng, tiền điện tính riêng).'
      }
    ]
  },
  {
    id: 'rp-a2-1',
    levelCode: 'a2',
    levelBadge: '基礎級 (TOCFL A2)',
    title: 'Thông báo Nghỉ bão từ Chính quyền Thành phố (颱風停班停課通知)',
    category: 'Thời tiết & Thông báo công cộng',
    paragraphs: [
      {
        traditional: '各位市民朋友大家好：受到強烈颱風影響，中央氣象署預測明天上午臺北市風雨將達到停班停課標準。為了保護大家的安全，市政府宣布明天全市各級學校與公司行號停止上班、停止上課一天。',
        pinyin: 'Gèwèi shìmín péngyǒu dàjiā hǎo: Shòudào qiángliè táifēng yǐngxiǎng, Zhōngyāng Qìxiàngshǔ yùcè míngtiān shàngwǔ Táiběishì fēngyǔ jiāng dádào tíngbān tíngkè biāozhǔn. Wèile bǎohù dàjiā de ānquán, shìzhèngfǔ xuānbù míngtiān quánshì gèjí xuéxiào yǔ gōngsī hánghào tíngzhǐ shàngbān, tíngzhǐ shàngkè yì tiān.',
        vietnamese: 'Xin chào toàn thể người dân thành phố: Do ảnh hưởng của siêu bão, Cục Khí tượng Trung ương dự báo sáng mai gió mưa tại TP. Đài Bắc sẽ đạt ngưỡng nghỉ làm, nghỉ học. Để bảo vệ an toàn cho mọi người, Chính quyền Thành phố thông báo ngày mai toàn bộ trường học các cấp và doanh nghiệp nghỉ làm, nghỉ học 1 ngày.'
      },
      {
        traditional: '颱風期間，臺北捷運將減少班次，YouBike 微笑單車暫停服務。請大家盡量留在家裡，不要去山上或海邊，並提前準備好飲用水、泡麵與手電筒。',
        pinyin: 'Táifēng qījiān, Táiběi Jiéyùn jiāng jiǎnshǎo bāncì, YouBike wēixiào dānchē zàntíng fúwù. Qǐng dàjiā jìnliàng liúzài jiālǐ, búyào qù shānshàng huò hǎibiān, bìng tíqián zhǔnbèi hǎo yǐnyòngshuǐ, pàomiàn yǔ shǒudiàntǒng.',
        vietnamese: 'Trong thời gian bão đổ bộ, tàu điện ngầm MRT Đài Bắc sẽ giảm tần suất chuyến, xe đạp công cộng YouBike tạm ngừng hoạt động. Xin mọi người cố gắng ở trong nhà, không lên núi hoặc ra biển, đồng thời chuẩn bị sẵn nước uống, mì gói và đèn pin.'
      }
    ],
    questions: [
      {
        question: '市政府為什麼宣布明天停止上班上課？ (Tại sao chính quyền thành phố thông báo mai nghỉ làm, nghỉ học?)',
        options: [
          'A. 因為明天是國定假日 (Vì mai là ngày lễ quốc gia)',
          'B. 因為強烈颱風來襲，風雨很大 (Vì bão mạnh đổ bộ, gió mưa lớn)',
          'C. 因為捷運系統故障維修 (Vì hệ thống MRT bảo trì sự cố)',
          'D. 因為全市停水停電 (Vì toàn thành phố cắt điện nước)'
        ],
        correctIndex: 1,
        explanation: 'Đầu bài nêu rõ: 「受到強烈颱風影響……風雨將達到停班停課標準。」'
      },
      {
        question: '颱風期間，下列哪一項交通工具「暫停服務」？ (Trong thời gian bão, phương tiện nào sau đây tạm ngừng phục vụ?)',
        options: [
          'A. 臺北捷運 (Tàu điện MRT Đài Bắc)',
          'B. 計程車 (Xe taxi)',
          'C. YouBike 腳踏車 (Xe đạp công cộng YouBike)',
          'D. 高鐵 (Tàu cao tốc THSR)'
        ],
        correctIndex: 2,
        explanation: 'Trong bài viết: 「YouBike 微笑單車暫停服務」(YouBike tạm ngừng phục vụ, còn MRT chỉ giảm chuyến 減少班次).'
      }
    ]
  },
  {
    id: 'rp-b1-1',
    levelCode: 'b1',
    levelBadge: '進階級 (TOCFL B1)',
    title: 'Thông báo Tuyển dụng Thực tập sinh Marketing Quốc tế (招考公告)',
    category: 'Công sở & Tuyển dụng tại Đài Loan',
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
  },
  {
    id: 'rp-b1-2',
    levelCode: 'b1',
    levelBadge: '進階級 (TOCFL B1)',
    title: 'Chính sách Giảm giá khi Mang bình nước cá nhân tại Đài Loan (自備環保杯優惠)',
    category: 'Môi trường & Đời sống xã hội Đài Loan',
    paragraphs: [
      {
        traditional: '臺灣人非常愛喝手搖飲與咖啡，但每年也因此產生了數十億個一次性塑膠杯與紙杯，對環境造成很大的負擔。為了減少垃圾量，環保署規定所有的連鎖飲料店、便利商店及速食店，只要消費者自備環保杯購買飲料，店家就必須提供至少五元的折扣。',
        pinyin: 'Táiwānrén fēicháng ài hē shǒuyáoyǐn yǔ kāfēi, dàn měinián yě yīncǐ chǎnshēngle shùshíyì gè yícìxìng sùjiāobēi yǔ zhǐbēi, duì huánjìng zàochéng hěn dà de fùdān. Wèile jiǎnshǎo lèsèliàng, Huánbǎoshǔ guīdìng suǒyǒu de liánsuǒ yǐnliàodiàn, biànlì shāngdiàn jí sùshídiàn, zhǐyào xiāofèizhě zìbèi huánbǎobēi gòumǎi yǐnliào, diànjiā jiù bìxū tígōng zhìshǎo wǔ yuán de zhékòu.',
        vietnamese: 'Người Đài Loan vô cùng thích uống trà sữa lắc tay và cà phê, nhưng mỗi năm cũng vì thế mà thải ra hàng tỷ chiếc cốc nhựa và cốc giấy dùng một lần, gây gánh nặng lớn cho môi trường. Để giảm lượng rác thải, Sở Bảo vệ Môi trường quy định tất cả các chuỗi quán nước, cửa hàng tiện lợi và tiệm đồ ăn nhanh: chỉ cần người tiêu dùng tự mang bình cá nhân khi mua đồ uống, cửa hàng bắt buộc phải giảm giá ít nhất 5 Đài tệ.'
      },
      {
        traditional: '這項政策實施之後，不但讓民眾養成了隨身攜帶環保杯的習慣，也大幅減少了塑膠垃圾。此外，臺北市與新北市更推出了「循環杯」免費租借服務，即使忘記帶杯子，也能用手機掃描借用，既方便又環保。',
        pinyin: 'Zhè xiàng zhèngcè shíshī zhīhòu, búdàn ràng mínzhòng yǎngchéngle suíshēn xīdài huánbǎobēi de xíguàn, yě dàfú jiǎnshǎole sùjiāo lèsè. Cǐwài, Táiběishì yǔ Xīnběishì gèng tuīchūle "xúnhuánbēi" miǎnfèi zūjiè fúwù, jíshǐ wàngjì dài bēizi, yě néng yòng shǒujī sǎomiáo jièyòng, jì fāngbiàn yòu huánbǎo.',
        vietnamese: 'Sau khi chính sách này được thực thi, không những giúp người dân hình thành thói quen mang theo bình cá nhân bên mình mà còn giảm mạnh rác thải nhựa. Ngoài ra, TP. Đài Bắc và Tân Bắc còn triển khai dịch vụ mượn "cốc tuần hoàn" miễn phí; cho dù quên mang bình thì vẫn có thể dùng điện thoại quét mã mượn dùng, vừa tiện lợi vừa bảo vệ môi trường.'
      }
    ],
    questions: [
      {
        question: '在臺灣，自備環保杯去連鎖飲料店買飲料有什麼好處？ (Ở Đài Loan, tự mang bình cá nhân đến chuỗi quán nước mua đồ uống có lợi ích gì?)',
        options: [
          'A. 可以免費再送一杯 (Được tặng thêm 1 ly miễn phí)',
          'B. 至少可以折抵五元 (Được giảm giá ít nhất 5 Đài tệ)',
          'C. 可以免費借用腳踏車 (Được mượn xe đạp miễn phí)',
          'D. 可以參加千萬發票抽獎 (Được tham gia bốc thăm hóa đơn 10 triệu)'
        ],
        correctIndex: 1,
        explanation: 'Trong bài viết: 「只要消費者自備環保杯購買飲料，店家就必須提供至少五元的折扣。」'
      },
      {
        question: '如果民眾出門忘記帶環保杯，可以使用什麼服務？ (Nếu người dân ra ngoài quên mang bình cá nhân thì có thể dùng dịch vụ gì?)',
        options: [
          'A. 免費領取新的保溫杯 (Nhận miễn phí bình giữ nhiệt mới)',
          'B. 用手機掃描免費租借「循環杯」 (Quét mã điện thoại mượn miễn phí "cốc tuần hoàn")',
          'C. 請店員免費外送到家 (Nhờ nhân viên giao miễn phí về nhà)',
          'D. 向捷運站借用玻璃杯 (Mượn cốc thủy tinh ở trạm MRT)'
        ],
        correctIndex: 1,
        explanation: 'Cuối bài nêu: 「即使忘記帶杯子，也能用手機掃描借用（循環杯），既方便又環保。」'
      }
    ]
  },
  {
    id: 'rp-b2-1',
    levelCode: 'b2',
    levelBadge: '高階級 (TOCFL B2)',
    title: 'Xu hướng Chuyển đổi số & Làm việc từ xa tại các Doanh nghiệp Đài Loan (數位轉型與遠距工作)',
    category: 'Kinh tế, Công nghệ & Xã hội (Band B2)',
    paragraphs: [
      {
        traditional: '近年來，隨著人工智慧（AI）與雲端技術的迅速發展，臺灣許多科技與金融企業紛紛推動「數位轉型」。不少公司開始採用混合辦公模式（Hybrid Work），允許員工每週選擇一至兩天在家遠距工作，以節省通勤時間並提升工作與生活的平衡。',
        pinyin: 'Jìnniánlái, suízhe réngōng zhìhuì (AI) yǔ yúnduān jìshù de xùnsù fāzhǎn, Táiwān xǔduō kējì yǔ jīnróng qǐyè fēnfēn tuīdòng "shùwèi zhuǎnxíng". Bùshǎo gōngsī kāishǐ cǎiyòng hùnhé bàngōng móshì, yǔnxǔ yuángōng měi zhōu xuǎnzé yī zhì liǎng tiān zàijiā yuǎnjù gōngzuò, yǐ jiéshěng tōngqín shíjiān bìng tíshēng gōngzuò yǔ shēnghuó de pínghéng.',
        vietnamese: 'Những năm gần đây, cùng với sự phát triển nhanh chóng của trí tuệ nhân tạo (AI) và công nghệ đám mây, nhiều doanh nghiệp công nghệ và tài chính tại Đài Loan lần lượt thúc đẩy "chuyển đổi số". Không ít công ty bắt đầu áp dụng mô hình làm việc kết hợp (Hybrid Work), cho phép nhân viên mỗi tuần chọn 1 đến 2 ngày làm việc từ xa tại nhà nhằm tiết kiệm thời gian đi lại và nâng cao sự cân bằng giữa công việc và cuộc sống.'
      },
      {
        traditional: '然而，遠距工作雖然賦予員工更高的自主權，卻也考驗著團隊溝通與資訊安全管理。專家建議，企業除了投資軟硬體設備之外，更應該建立明確的績效評估制度，才能在維持競爭力的同時，留住優秀的人才。',
        pinyin: 'Ránér, yuǎnjù gōngzuò suīrán fùyǔ yuángōng gèng gāo de zìzhǔquán, què yě kǎoyànzhe tuánduì gōutōng yǔ zīxùn ānquán guǎnlǐ. Zhuānjiā jiànyì, qǐyè chúle tóuzī ruǎnyìngtǐ shèbèi zhīwài, gèng yīnggāi jiànlì míngquè de jīxiào pínggū zhìdù, cáinéng zài wéichí jìngzhēnglì de tóngshí, liúzhù yōuxiù de réncái.',
        vietnamese: 'Tuy nhiên, làm việc từ xa dù trao cho nhân viên quyền tự chủ cao hơn nhưng lại thử thách khả năng giao tiếp nhóm và quản lý an toàn thông tin. Các chuyên gia kiến nghị, ngoài việc đầu tư thiết bị phần mềm và phần cứng, doanh nghiệp càng nên xây dựng chế độ đánh giá hiệu suất (KPI) rõ ràng thì mới có thể vừa duy trì năng lực cạnh tranh, vừa giữ chân được nhân tài xuất sắc.'
      }
    ],
    questions: [
      {
        question: '根據文章，企業採用「混合辦公模式」的主要目的為何？ (Theo bài viết, mục đích chính doanh nghiệp áp dụng mô hình làm việc kết hợp là gì?)',
        options: [
          'A. 完全取代辦公室並裁減員工 (Thay thế hoàn toàn văn phòng và cắt giảm nhân sự)',
          'B. 節省通勤時間並促進工作與生活平衡 (Tiết kiệm thời gian đi lại và thúc đẩy cân bằng công việc - cuộc sống)',
          'C. 減少購買電腦與軟體的費用 (Giảm chi phí mua máy tính và phần mềm)',
          'D. 強制員工每天加班 (Bắt buộc nhân viên tăng ca mỗi ngày)'
        ],
        correctIndex: 1,
        explanation: 'Trong đoạn 1 nêu rõ: 「以節省通勤時間並提升工作與生活的平衡。」'
      },
      {
        question: '專家認為企業在推動遠距工作時，應該注意什麼？ (Chuyên gia cho rằng khi thúc đẩy làm việc từ xa, doanh nghiệp cần chú ý điều gì?)',
        options: [
          'A. 取消所有的線上會議 (Hủy bỏ toàn bộ các cuộc họp trực tuyến)',
          'B. 建立明確的績效評估制度與資訊安全管理 (Xây dựng chế độ đánh giá hiệu suất rõ ràng và quản lý an toàn thông tin)',
          'C. 降低員工的薪水與福利 (Giảm lương và phúc lợi của nhân viên)',
          'D. 禁止員工使用雲端技術 (Cấm nhân viên sử dụng công nghệ đám mây)'
        ],
        correctIndex: 1,
        explanation: 'Đoạn 2 nhấn mạnh thách thức về 團隊溝通與資訊安全管理 và khuyên cần 建立明確的績效評估制度.'
      }
    ]
  }
];

export const RICH_GRAMMAR_LIST: RichGrammarPoint[] = [
  // === NOVICE & TOCFL A1 (ĐƯƠNG ĐẠI QUYỂN 1) ===
  {
    id: 'gr-nov-1',
    levelCode: 'novice',
    levelBadge: '準備級 (Novice)',
    book: 'Đương Đại Quyển 1',
    category: 'Trật tự câu & Thời gian',
    pattern: 'Chủ ngữ + Thời gian + Địa điểm + Động từ',
    pinyin: 'S + Time + zài + Place + V',
    meaning: 'Quy tắc vàng: Trạng ngữ chỉ thời gian và địa điểm LUÔN đứng trước động từ',
    structure: 'S + [Thời gian] + 在 [Địa điểm] + [Hành động]',
    explanation: 'Người Việt rất hay dịch逐 chữ "Tôi học tiếng Trung ở Đài Loan vào năm nay", nhưng trong tiếng Trung bắt buộc phải đưa Thời gian + Địa điểm lên trước động từ chính.',
    examples: [
      {
        traditional: '我今天下午在圖書館看書。',
        pinyin: 'Wǒ jīntiān xiàwǔ zài túshūguǎn kànshū.',
        vietnamese: 'Chiều hôm nay tôi đọc sách ở thư viện.'
      },
      {
        traditional: '我們明天五點在捷運站門口見面。',
        pinyin: 'Wǒmen míngtiān wǔ diǎn zài jiéyùnzhàn ménkǒu jiànmiàn.',
        vietnamese: '5 giờ ngày mai chúng mình gặp nhau ở cổng trạm MRT nhé.'
      }
    ],
    quizQuestion: {
      prompt: 'Chọn câu có trật tự từ ĐÚNG chuẩn tiếng Trung:',
      options: [
        'A. 我吃牛肉麵在夜市昨天晚上。',
        'B. 我昨天晚上在夜市吃牛肉麵。',
        'C. 在夜市我吃牛肉麵昨天晚上。',
        'D. 我吃在夜市牛肉麵昨天晚上。'
      ],
      correctIndex: 1
    }
  },
  {
    id: 'gr-nov-2',
    levelCode: 'novice',
    levelBadge: '準備級 (Novice)',
    book: 'Đương Đại Quyển 1',
    category: 'Câu lựa chọn & Nghi vấn',
    pattern: '……還是……？ vs. ……或者……',
    pinyin: '...háishì...? vs. ...huòzhě...',
    meaning: 'Hay là (dùng trong câu hỏi lựa chọn) vs. Hoặc là (dùng trong câu trần thuật)',
    structure: 'A 還是 B ？ (Câu hỏi) | A 或者/或是 B 。 (Câu kể)',
    explanation: 'Khi hỏi người khác chọn 1 trong 2 (ví dụ: ăn tại quán hay mang về), bắt buộc dùng 還是. Khi kể lại (uống trà hoặc cà phê đều được), dùng 或是 / 或者.',
    examples: [
      {
        traditional: '請問今天內用還是外帶？',
        pinyin: 'Qǐngwèn jīntiān nèiyòng háishì wàidài?',
        vietnamese: 'Xin hỏi hôm nay ăn tại quán hay mang về ạ?'
      },
      {
        traditional: '週末我常去爬山或是看電影。',
        pinyin: 'Zhōumò wǒ cháng qù páshān huòshì kàn diànyǐng.',
        vietnamese: 'Cuối tuần tôi thường đi leo núi hoặc là xem phim.'
      }
    ],
    quizQuestion: {
      prompt: 'Điền từ đúng: 「請問你要喝珍珠奶茶______美式咖啡？」',
      options: ['A. 還是', 'B. 或者', 'C. 而且', 'D. 不過'],
      correctIndex: 0
    }
  },
  {
    id: 'gr-a1-1',
    levelCode: 'a1',
    levelBadge: '入門級 (TOCFL A1)',
    book: 'Đương Đại Quyển 1–2',
    category: 'Câu so sánh',
    pattern: 'A 比 B + Tính từ + (一點 / 得多)',
    pinyin: 'A bǐ B + Adj + (yìdiǎn / dé duō)',
    meaning: 'A hơn B (một chút / nhiều)... — Tuyệt đối KHÔNG dùng 很 trước tính từ!',
    structure: 'A + 比 + B + Adj (+ 一點 / 得多 / 多了)',
    explanation: 'Lỗi sai kinh điển trong đề thi TOCFL A1/A2: Không bao giờ được viết "A 比 B 很貴", nếu muốn nhấn mạnh "đắt hơn nhiều" phải đặt 得多 hoặc 多了 ở SAU tính từ.',
    examples: [
      {
        traditional: '搭高鐵比搭火車快得多，但是票價比較貴。',
        pinyin: 'Dā gāotiě bǐ dā huǒchē kuài dé duō, dànshì piàojià bǐjiào guì.',
        vietnamese: 'Đi tàu cao tốc nhanh hơn đi tàu hỏa rất nhiều, nhưng giá vé đắt hơn.'
      },
      {
        traditional: '今天的天氣比昨天冷一點。',
        pinyin: 'Jīntiān de tiānqì bǐ zuótiān lěng yìdiǎn.',
        vietnamese: 'Thời tiết hôm nay lạnh hơn hôm qua một chút.'
      }
    ],
    quizQuestion: {
      prompt: 'Câu so sánh nào sau đây ĐÚNG ngữ pháp TOCFL?',
      options: [
        'A. 臺北的房租比臺中很貴。',
        'B. 臺北的房租比臺中非常貴。',
        'C. 臺北的房租比臺中貴得多。',
        'D. 臺北的房租比貴臺中。'
      ],
      correctIndex: 2
    }
  },
  {
    id: 'gr-a1-2',
    levelCode: 'a1',
    levelBadge: '入門級 (TOCFL A1)',
    book: 'Đương Đại Quyển 2',
    category: 'Câu chữ 把 (Xử置)',
    pattern: 'S + 把 + Tân ngữ (đã xác định) + Động từ + Thành phần khác',
    pinyin: 'S + bǎ + O + V + Complement/le',
    meaning: 'Đem / Lấy cái gì đó làm cho nó thay đổi vị trí hoặc trạng thái',
    structure: 'S + 把 + O + V + (了 / 在... / 到... / 完 / 好)',
    explanation: 'Câu chữ 把 bắt buộc phải có thành phần bổ ngữ hoặc 了 ở sau động từ (không bao giờ kết thúc câu bằng một động từ trơ trọi). Phủ định(不/沒) phải đặt TRƯỚC chữ 把.',
    examples: [
      {
        traditional: '離開房間以前，請記得把冷氣關掉。',
        pinyin: 'Líkāi fángjiān yǐqián, qǐng jìdé bǎ lěngqì guāndiào.',
        vietnamese: 'Trước khi rời phòng, vui lòng nhớ tắt máy lạnh đi.'
      },
      {
        traditional: '我已經把今天的功課寫完了。',
        pinyin: 'Wǒ yǐjīng bǎ jīntiān de gōngkè xiěwán le.',
        vietnamese: 'Tôi đã làm xong hết bài tập hôm nay rồi.'
      }
    ],
    quizQuestion: {
      prompt: 'Chọn câu dùng chữ 把 ĐÚNG ngữ pháp:',
      options: [
        'A. 我把那杯珍珠奶茶喝。',
        'B. 我把那杯珍珠奶茶喝完了。',
        'C. 我喝完把那杯珍珠奶茶。',
        'D. 我把沒喝完那杯珍珠奶茶。'
      ],
      correctIndex: 1
    }
  },

  // === TOCFL A2 (ĐƯƠNG ĐẠI QUYỂN 2) ===
  {
    id: 'gr-a2-1',
    levelCode: 'a2',
    levelBadge: '基礎級 (TOCFL A2)',
    book: 'Đương Đại Quyển 2',
    category: 'Liên từ bổ sung',
    pattern: '除了……以外，還 / 也 / 都……',
    pinyin: 'Chúle... yǐwài, hái / yě / dōu...',
    meaning: 'Ngoài... ra, còn / cũng (bao gồm) HOẶC đều (loại trừ)',
    structure: '除了 A 以外，S + 還/也 + V (Cộng thêm A) | 除了 A 以外，都... (Trừ A ra)',
    explanation: 'Nếu vế sau dùng 還 / 也 tức là tính cả A và thêm B. Nếu vế sau dùng 都 / 全 tức là trừ A ra, tất cả những cái khác đều như vậy.',
    examples: [
      {
        traditional: '除了臺北以外，我也去過臺中和高雄。',
        pinyin: 'Chúle Táiběi yǐwài, wǒ yě qùguò Táizhōng hé Gāoxióng.',
        vietnamese: 'Ngoài Đài Bắc ra, tôi cũng từng đi Đài Trung và Cao Hùng rồi.'
      },
      {
        traditional: '除了星期日以外，圖書館每天都開門。',
        pinyin: 'Chúle xīngqīrì yǐwài, túshūguǎn měitiān dōu kāimén.',
        vietnamese: 'Trừ Chủ nhật ra, thư viện ngày nào cũng mở cửa.'
      }
    ],
    quizQuestion: {
      prompt: 'Điền từ phù hợp: 「他除了會說英文以外，______會說很流利的中文。」',
      options: ['A. 還 (còn)', 'B. 卻 (lại)', 'C. 才 (mới)', 'D. 只 (chỉ)'],
      correctIndex: 0
    }
  },
  {
    id: 'gr-a2-2',
    levelCode: 'a2',
    levelBadge: '基礎級 (TOCFL A2)',
    book: 'Đương Đại Quyển 2',
    category: 'Nhấn mạnh thời gian / điều kiện',
    pattern: 'Phân biệt「就」(sớm/nhanh) và「才」(muộn/mãi mới)',
    pinyin: 'jiù vs. cái',
    meaning: '就: xảy ra sớm, nhanh, thuận lợi | 才: xảy ra muộn, mất nhiều thời gian (KHÔNG đi với 了)',
    structure: 'Thời gian + 就 + V + 了 | Thời gian + 才 + V (Không có 了 ở cuối)',
    explanation: 'Cực kỳ hay ra trong đề thi TOCFL A2 & B1! Nhớ quy tắc: Dùng 才 (biểu thị muộn/khó khăn) thì cuối câu KHÔNG dùng 了.',
    examples: [
      {
        traditional: '搭捷運只要十分鐘就到了。',
        pinyin: 'Dā jiéyùn zhǐyào shí fēnzhōng jiù dàole.',
        vietnamese: 'Đi tàu MRT chỉ mất 10 phút là tới ngay rồi (rất nhanh).'
      },
      {
        traditional: '剛來臺灣的時候，我花了一個月才適應這裡的天氣。',
        pinyin: 'Gāng lái Táiwān de shíhòu, wǒ huāle yí gè yuè cái shìyìng zhèlǐ de tiānqì.',
        vietnamese: 'Lúc mới sang Đài Loan, tôi mất cả một tháng mới thích nghi được với thời tiết ở đây.'
      }
    ],
    quizQuestion: {
      prompt: 'Điền từ đúng: 「電影七點開始，他怎麼八點半______來？」(Phim 7h chiếu, sao 8h30 anh ấy mới tới?)',
      options: ['A. 就', 'B. 才', 'C. 再', 'D. 又'],
      correctIndex: 1
    }
  },
  {
    id: 'gr-a2-3',
    levelCode: 'a2',
    levelBadge: '基礎級 (TOCFL A2)',
    book: 'Đương Đại Quyển 2',
    category: 'Mức độ tăng tiến',
    pattern: '越來越 + Adj/V  &  越 A 越 B',
    pinyin: 'yuè lái yuè... & yuè A yuè B',
    meaning: 'Càng ngày càng... & Càng A thì càng B',
    structure: 'S + 越來越 + Tính từ / Động từ tâm lý (Không thêm 很!)',
    explanation: 'Bản thân 越來越 đã mang nghĩa mức độ cao nên tuyệt đối không thêm 很 vào sau 越來越.',
    examples: [
      {
        traditional: '你的繁體字寫得越來越漂亮了！',
        pinyin: 'Nǐ de fántǐzì xiě de yuè lái yuè piàoliang le!',
        vietnamese: 'Chữ Phồn thể của bạn viết càng ngày càng đẹp rồi!'
      },
      {
        traditional: '臺灣的臭豆腐是越吃越香。',
        pinyin: 'Táiwān de chòudòufu shì yuè chī yuè xiāng.',
        vietnamese: 'Đậu phụ thối Đài Loan càng ăn càng thấy thơm.'
      }
    ],
    quizQuestion: {
      prompt: 'Chọn câu ĐÚNG ngữ pháp:',
      options: [
        'A. 來臺灣留學的學生越來越很多。',
        'B. 天氣越來越熱了。',
        'C. 他說中文越來越好極了。',
        'D. 這家店越來越非常有名。'
      ],
      correctIndex: 1
    }
  },

  // === TOCFL B1 (ĐƯƠNG ĐẠI QUYỂN 3–4) ===
  {
    id: 'gr-b1-1',
    levelCode: 'b1',
    levelBadge: '進階級 (TOCFL B1)',
    book: 'Đương Đại Quyển 3',
    category: 'Suy luận & Đề nghị',
    pattern: '既然……，就……',
    pinyin: 'Jìrán..., jiù...',
    meaning: 'Đã... thì... (Đưa ra kết luận/lời khuyên dựa trên sự thật đã rõ)',
    structure: '既然 + [Sự thật đã định], (Chủ ngữ) + 就 + [Quyết định/Lời khuyên]',
    explanation: 'Khác với 因為 (nêu nguyên nhân khách quan chưa biết), 既然 dùng khi tiền đề ở vế 1 là điều cả người nói và người nghe đều đã biết rõ.',
    examples: [
      {
        traditional: '既然你已經來到臺灣了，就應該去逛逛士林夜市。',
        pinyin: 'Jìrán nǐ yǐjīng láidào Táiwān le, jiù yīnggāi qù guàngguang Shìlín Yèshì.',
        vietnamese: 'Đã đến Đài Loan rồi thì bạn nên đi dạo chợ đêm Sĩ Lâm một chuyến.'
      },
      {
        traditional: '既然大家都同意這個計畫，我們就馬上開始吧！',
        pinyin: 'Jìrán dàjiā dōu tóngyì zhège jìhuà, wǒmen jiù mǎshàng kāishǐ ba!',
        vietnamese: 'Đã mọi người đều đồng ý kế hoạch này rồi thì chúng ta bắt đầu ngay thôi!'
      }
    ],
    quizQuestion: {
      prompt: 'Điền cặp liên từ đúng: 「______外面下這麼大的雨，我們______別出門了吧！」',
      options: ['A. 雖然……但是……', 'B. 既然……就……', 'C. 不但……而且……', 'D. 即使……也……'],
      correctIndex: 1
    }
  },
  {
    id: 'gr-b1-2',
    levelCode: 'b1',
    levelBadge: '進階級 (TOCFL B1)',
    book: 'Đương Đại Quyển 3',
    category: 'Nhượng bộ giả định',
    pattern: '即使 / 就算 / 哪怕……，也……',
    pinyin: 'Jíshǐ / Jiùsuàn / Nǎpà..., yě...',
    meaning: 'Cho dù / Giả sử có... đi chăng nữa, thì vẫn...',
    structure: '即使 / 就算 + [Giả định cực đoan], S + 也 + [Kết quả không đổi]',
    explanation: 'Trọng điểm đề thi đọc điền từ TOCFL B1. Khác với 雖然 (sự thật đã xảy ra), 即使/就算 thường dùng cho giả định hoặc trường hợp cực đoan.',
    examples: [
      {
        traditional: '即使繁體字筆畫比較多，只要掌握部首也很容易記住。',
        pinyin: 'Jíshǐ fántǐzì bǐhuà bǐjiào duō, zhǐyào zhǎngwò bùshǒu yě hěn róngyì jìzhù.',
        vietnamese: 'Cho dù chữ Phồn thể có nhiều nét hơn, chỉ cần nắm vững bộ thủ thì cũng rất dễ nhớ.'
      },
      {
        traditional: '就算工作再忙，每天也要抽空運動半小時。',
        pinyin: 'Jiùsuàn gōngzuò zài máng, měitiān yě yào chōukòng yùndòng bàn xiǎoshí.',
        vietnamese: 'Cho dù công việc có bận đến mấy thì mỗi ngày cũng phải tranh thủ tập thể dục nửa tiếng.'
      }
    ],
    quizQuestion: {
      prompt: 'Điền từ đúng: 「______明天沒有放颱風假，為了安全我______會搭捷運去上班。」',
      options: ['A. 既然……就……', 'B. 即使……也……', 'C. 因為……所以……', 'D. 只要……就……'],
      correctIndex: 1
    }
  },
  {
    id: 'gr-b1-3',
    levelCode: 'b1',
    levelBadge: '進階級 (TOCFL B1)',
    book: 'Đương Đại Quyển 3–4',
    category: 'Điều kiện bắt buộc vs. Điều kiện đủ',
    pattern: 'Phân biệt「只要……就……」và「只有……才……」',
    pinyin: 'Zhǐyào... jiù... vs. Zhǐyǒu... cái...',
    meaning: 'Chỉ cần... là... (Điều kiện dễ) vs. Chỉ có... thì mới... (Điều kiện duy nhất bắt buộc)',
    structure: '只要 [Điều kiện đủ], 就 [Kết quả] | 只有 [Điều kiện bắt buộc], 才 [Kết quả]',
    explanation: 'Mẹo làm bài thi TOCFL Band B: Nhìn vế sau có chữ 就 thì vế đầu chọn 只要; nhìn vế sau có chữ 才 thì vế đầu chọn 只有 (hoặc 除非...否則).',
    examples: [
      {
        traditional: '只要自備環保杯買飲料，店家就會折抵五元。',
        pinyin: 'Zhǐyào zìbèi huánbǎobēi mǎi yǐnliào, diànjiā jiù huì zhédǐ wǔ yuán.',
        vietnamese: 'Chỉ cần tự mang bình cá nhân mua đồ uống là cửa hàng sẽ giảm 5 Đài tệ.'
      },
      {
        traditional: '只有不斷練習口說，才能真正跟臺灣人自然溝通。',
        pinyin: 'Zhǐyǒu búduàn liànxí kǒushuō, cáinéng zhēnzhèng gēn Táiwānrén zìrán gōutōng.',
        vietnamese: 'Chỉ có không ngừng luyện nói thì mới có thể thực sự giao tiếp tự nhiên với người Đài.'
      }
    ],
    quizQuestion: {
      prompt: 'Điền từ đúng: 「______通過 TOCFL B1 測驗，______能申請這份臺灣獎學金。」',
      options: ['A. 只要……才……', 'B. 只有……才……', 'C. 既然……才……', 'D. 雖然……才……'],
      correctIndex: 1
    }
  },
  {
    id: 'gr-b1-4',
    levelCode: 'b1',
    levelBadge: '進階級 (TOCFL B1)',
    book: 'Đương Đại Quyển 4',
    category: 'Phán đoán & Nhận định',
    pattern: '看來 / 看起來…… & 怪不得 / 難怪……',
    pinyin: 'Kànlái... & Guàibùdé / Nánguài...',
    meaning: 'Xem ra / Nhìn có vẻ... & Thảo nào / Hèn chi...',
    structure: '看來 + [Nhận định qua quan sát] | 難怪 + [Hiểu ra lý do vì sao]',
    explanation: 'Hai mẫu câu xuất hiện dày đặc trong đề thi Nghe hiểu (Listening) TOCFL B1 khi nhân vật rút ra kết luận.',
    examples: [
      {
        traditional: '外面烏雲密布，看來待會兒要下大雨了。',
        pinyin: 'Wàimiàn wūyún mìbù, kànlái dāihuǐr yào xià dàyǔ le.',
        vietnamese: 'Bên ngoài mây đen kéo kín, xem ra lát nữa sắp mưa to rồi.'
      },
      {
        traditional: '原來這家牛肉麵得過冠軍，難怪每天都有這麼多人排隊！',
        pinyin: 'Yuánlái zhè jiā niúròumiàn déguò guànjūn, nánguài měitiān dōu yǒu zhème duō rén páiduì!',
        vietnamese: 'Hóa ra quán mì bò này từng đoạt giải quán quân, thảo nào ngày nào cũng đông người xếp hàng thế!'
      }
    ],
    quizQuestion: {
      prompt: 'Điền từ đúng: 「原來他已經在臺灣住了十年，______他的台語說得這麼好！」',
      options: ['A. 難怪 (Thảo nào)', 'B. 儘管 (Cho dù)', 'C. 否則 (Nếu không thì)', 'D. 難免 (Khó tránh khỏi)'],
      correctIndex: 0
    }
  },

  // === TOCFL B2 (ĐƯƠNG ĐẠI QUYỂN 4–5) ===
  {
    id: 'gr-b2-1',
    levelCode: 'b2',
    levelBadge: '高階級 (TOCFL B2)',
    book: 'Đương Đại Quyển 4',
    category: 'So sánh lựa chọn nâng cao',
    pattern: '與其 A，不如 / 寧可 B',
    pinyin: 'Yǔqí A, bùrú / nìngkě B',
    meaning: 'Thà rằng B còn hơn là A (So sánh 2 phương án và chọn B tốt hơn)',
    structure: '與其 + [Phương án dở A]，不如 / 寧可 + [Phương án tốt hơn B]',
    explanation: 'Cấu trúc viết nghị luận và đọc hiểu Band B2: Đứng trước phương án bị loại bỏ là 與其, đứng trước phương án được chọn là 不如 hoặc 寧可.',
    examples: [
      {
        traditional: '週末與其待在宿舍滑手機，不如去陽明山走走。',
        pinyin: 'Zhōumò yǔqí dāizài sùshè huá shǒujī, bùrú qù Yángmíngshān zǒuzou.',
        vietnamese: 'Cuối tuần thà đi dạo núi Dương Minh còn hơn là ở lì trong ký túc xá lướt điện thoại.'
      }
    ],
    quizQuestion: {
      prompt: 'Điền từ đúng: 「塞車的時候，______坐計程車浪費時間，______去搭捷運更快。」',
      options: ['A. 不但……而且……', 'B. 與其……不如……', 'C. 固然……但是……', 'D. 哪怕……也……'],
      correctIndex: 1
    }
  }
];

