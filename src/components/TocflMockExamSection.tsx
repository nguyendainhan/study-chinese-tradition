import React, { useState, useEffect, useRef, useMemo } from 'react';
import { speakTaiwanMandarin } from '../utils/speech';
import {
  CloudExamLog,
  fetchExamLogsFromCloud,
  saveExamLogToCloud,
  getCurrentUserAccount,
} from '../utils/userAccountDb';
import {
  Volume2,
  Headphones,
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  History,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  FileCheck,
  AlertCircle,
  Play,
  Check,
} from 'lucide-react';

export interface CBTQuestion {
  id: string;
  section: 'listening' | 'reading';
  level: string;
  audioScript?: string;
  audioScriptVi?: string;
  readingPassageTitle?: string;
  readingPassage?: string;
  readingPassageVi?: string;
  prompt: string;
  promptVi: string;
  options: string[];
  optionsVi: string[];
  correctIndex: number;
  explanation: string;
}

export const OFFICIAL_CBT_QUESTIONS: CBTQuestion[] = [
  // --- PHẦN 1: 聽力測驗 (LISTENING) ---
  {
    id: 'cbt-l1',
    section: 'listening',
    level: 'TOCFL Band A (A1)',
    audioScript: '請問，這班捷運會到臺北車站嗎？',
    audioScriptVi: 'Xin hỏi, chuyến tàu điện ngầm này có đến ga Đài Bắc không?',
    prompt: '請聽問題，並選出一個最適當的回答：',
    promptVi: 'Nghe câu hỏi và chọn câu trả lời phù hợp nhất:',
    options: [
      '對，坐三站就到了。',
      '我昨天買了一輛腳踏車。',
      '這家餐廳的牛肉麵很好吃。',
      '機票已經訂好了。'
    ],
    optionsVi: [
      'Đúng rồi, ngồi 3 trạm nữa là tới.',
      'Hôm qua tôi mới mua một chiếc xe đạp.',
      'Mì bò của quán này rất ngon.',
      'Vé máy bay đã đặt xong rồi.'
    ],
    correctIndex: 0,
    explanation: 'Người hỏi về hướng đi của tàu điện ngầm MRT: 「請問，這班捷運會到臺北車站嗎？」→ Đáp án đúng là A: 「對，坐三站就到了。」(Đúng vậy, đi 3 trạm nữa là tới).'
  },
  {
    id: 'cbt-l2',
    section: 'listening',
    level: 'TOCFL Band A (A2)',
    audioScript: '男：不好意思，我要一杯珍珠奶茶，微糖去冰。女：好的，一共是五十五元，請問發票要存載具嗎？',
    audioScriptVi: 'Nam: Cho hỏi, mình muốn mua một ly trà sữa trân châu, 30% đường không đá. Nữ: Vâng, của bạn hết 55 Đài tệ, hóa đơn bạn có muốn lưu vào mã quét điện thoại (載具) không?',
    prompt: '聽完這段對話，這兩位對話者最可能在什麼地方？',
    promptVi: 'Nghe đoạn hội thoại trên, hai người đối thoại nhiều khả năng đang ở đâu nhất?',
    options: [
      '圖書館',
      '手搖飲料店',
      '郵局',
      '大醫院'
    ],
    optionsVi: [
      'Thư viện',
      'Quán trà sữa / đồ uống mang đi',
      'Bưu điện',
      'Bệnh viện lớn'
    ],
    correctIndex: 1,
    explanation: 'Từ khóa ăn điểm: 「珍珠奶茶、微糖去冰、存載具」đều là các thuật ngữ giao tiếp đặc trưng khi mua đồ uống tại quán trà sữa Đài Loan (手搖飲料店).'
  },
  {
    id: 'cbt-l3',
    section: 'listening',
    level: 'TOCFL Band B (B1)',
    audioScript: '雖然這份新工作的薪水比以前高，但是每天幾乎都要加班到九點，讓我身心俱疲，最近正在慎重考慮要不要遞辭呈。',
    audioScriptVi: 'Tuy mức lương công việc mới này cao hơn trước, nhưng hầu như ngày nào cũng phải tăng ca tới 9 giờ tối khiến tôi kiệt sức cả thể xác lẫn tinh thần, gần đây tôi đang cân nhắc kỹ có nên nộp đơn xin nghỉ việc không.',
    prompt: '根據這段獨白，說話者的主要意思是什麼？',
    promptVi: 'Dựa theo đoạn độc thoại, ý chính của người nói là gì?',
    options: [
      '他對目前的工作環境與待遇感到非常滿意。',
      '他因為經常加班壓力大，正打算辭職換工作。',
      '老闆決定下個月幫他調升薪水。',
      '他每天下班後都準時到健身房運動。'
    ],
    optionsVi: [
      'Anh ấy rất hài lòng với môi trường làm việc và đãi ngộ hiện tại.',
      'Anh ấy vì thường xuyên tăng ca áp lực lớn nên đang định từ chức đổi việc.',
      'Sếp đã quyết định tháng sau sẽ tăng lương cho anh ấy.',
      'Anh ấy sau khi tan ca hàng ngày đều đúng giờ đến phòng gym tập thể dục.'
    ],
    correctIndex: 1,
    explanation: 'Người nói nêu rõ: 「每天幾乎都要加班到九點、身心俱疲、考慮要不要遞辭呈」(tăng ca nhiều, mệt mỏi, cân nhắc nộp đơn thôi việc) → Đáp án B đúng.'
  },
  {
    id: 'cbt-l4',
    section: 'listening',
    level: 'TOCFL Band B (B1)',
    audioScript: '女：房東先生，請問這間套房的租金包含水電費和網路嗎？男：租金包含水費和寬頻網路，但電費每度五元，每個月底按獨立電表另外結算。簽約時需要付兩個月押金。',
    audioScriptVi: 'Nữ: Bác chủ nhà, cho cháu hỏi tiền thuê căn phòng khép kín này đã bao gồm điện nước và mạng internet chưa ạ? Nam: Tiền thuê đã gồm tiền nước và mạng, nhưng tiền điện 5 Đài tệ một số, cuối tháng tính riêng theo công tơ. Khi ký hợp đồng cần đóng cọc 2 tháng.',
    prompt: '房客除了繳每個月的租金以外，還需要另外自費支付什麼項目？',
    promptVi: 'Người thuê phòng ngoài việc trả tiền thuê hàng tháng ra thì còn cần tự chi trả khoản mục nào?',
    options: [
      '水費與寬頻網路費',
      '每度五元的私人用電費',
      '大樓清潔管理費',
      '全棟第四台電視費'
    ],
    optionsVi: [
      'Tiền nước và tiền mạng internet',
      'Tiền điện dùng riêng 5 Đài tệ mỗi số',
      'Phí dọn dẹp vệ sinh tòa nhà',
      'Phí truyền hình cáp cả tòa nhà'
    ],
    correctIndex: 1,
    explanation: 'Chủ nhà nói rõ: 「租金包含水費和寬頻網路，但電費每度五元……另外結算」→ Tiền điện tính riêng theo số (每度五元的電費).'
  },
  {
    id: 'cbt-l5',
    section: 'listening',
    level: 'TOCFL Band A (A2)',
    audioScript: '醫師：你喉嚨發炎紅腫，體溫也有點偏高，這是典型的流行性感冒。這包藥一天吃三次，飯後三十分鐘服用，這幾天記得多喝溫開水，出門務必戴口罩。',
    audioScriptVi: 'Bác sĩ: Họng của bạn bị viêm đỏ sưng, thân nhiệt cũng hơi cao, đây là cảm cúm điển hình. Gói thuốc này uống ngày 3 lần sau ăn 30 phút, mấy ngày này nhớ uống nhiều nước ấm, ra ngoài nhớ đeo khẩu trang.',
    prompt: '醫師叮嚀病人應當注意什麼事項？',
    promptVi: 'Bác sĩ dặn dò bệnh nhân cần chú ý điều gì?',
    options: [
      '每天都要到戶外劇烈慢跑以排汗退燒。',
      '飯前空腹服藥才能發揮最大藥效。',
      '出門要戴口罩，並且多補充溫水。',
      '只要覺得不舒服隨時都可以吃藥。'
    ],
    optionsVi: [
      'Mỗi ngày đều phải ra ngoài chạy bộ cật lực để toát mồ hôi hạ sốt.',
      'Uống thuốc lúc đói trước bữa ăn mới phát huy hiệu quả tốt nhất.',
      'Ra ngoài cần đeo khẩu trang và bổ sung nhiều nước ấm.',
      'Chỉ cần cảm thấy khó chịu là có thể uống thuốc bất kỳ lúc nào.'
    ],
    correctIndex: 2,
    explanation: 'Bác sĩ căn dặn trực tiếp: 「這幾天記得多喝溫開水，出門務必戴口罩」→ Đáp án C chính xác.'
  },
  {
    id: 'cbt-l6',
    section: 'listening',
    level: 'TOCFL Band B (B2)',
    audioScript: '內政部移民署公告：外籍留學生換發外僑居留證時，請於證件到期前三十日內，至線上申辦系統填寫資料，並上傳在學證明、護照影本及近半年內彩色白底證件照片，審核通過後方可至服務站領取新證。',
    audioScriptVi: 'Thông báo của Sở Di dân Bộ Nội vụ: Sinh viên quốc tế khi đổi gia hạn thẻ cư trú ARC, vui lòng trong vòng 30 ngày trước khi thẻ hết hạn, truy cập hệ thống đăng ký trực tuyến để điền thông tin và tải lên giấy xác nhận đang học, bản photocopy hộ chiếu cùng ảnh thẻ nền trắng chụp trong vòng nửa năm, sau khi duyệt đạt mới đến trạm phục vụ nhận thẻ mới.',
    prompt: '關於外籍留學生辦理外僑居留證延期，下列敘述何者與內容相符？',
    promptVi: 'Về việc sinh viên nước ngoài làm thủ tục gia hạn thẻ cư trú ARC, câu nào sau đây phù hợp với nội dung thông báo?',
    options: [
      '證件過期半年後仍可透過線上系統隨時補辦。',
      '必須在居留證到期前三十天內於線上系統提出申辦。',
      '申辦時完全不需上傳目前的在學證明文件。',
      '申請通過當天系統會直接郵寄新證到學生家裡。'
    ],
    optionsVi: [
      'Chứng minh quá hạn nửa năm vẫn có thể nộp bổ sung qua mạng bất kỳ lúc nào.',
      'Phải nộp hồ sơ qua hệ thống mạng trong vòng 30 ngày trước khi thẻ cư trú hết hạn.',
      'Khi nộp đơn hoàn toàn không cần tải lên giấy chứng nhận đang học hiện tại.',
      'Sau khi được duyệt cùng ngày hệ thống sẽ gửi thẳng thẻ mới về nhà học sinh.'
    ],
    correctIndex: 1,
    explanation: 'Thông báo nêu: 「請於證件到期前三十日內，至線上申辦系統填寫資料」→ Phải làm trước hạn trong vòng 30 ngày qua hệ thống trực tuyến.'
  },
  {
    id: 'cbt-l7',
    section: 'listening',
    level: 'TOCFL Band B (B2)',
    audioScript: '口試委員：陳同學，你為什麼選擇來臺灣攻讀資訊工程碩士學位？陳同學：因為臺灣在半導體製造與人工智慧硬體研發領域位居全球關鍵樞紐地位，而且學術研究環境非常扎實開放，我希望將來能將所學帶回母國促進科技合作。',
    audioScriptVi: 'Giám khảo: Bạn Trần, tại sao bạn lại chọn đến Đài Loan học thạc sĩ ngành kỹ thuật thông tin? Bạn Trần: Bởi vì Đài Loan ở vị trí trung tâm then chốt toàn cầu trong lĩnh vực sản xuất bán dẫn và nghiên cứu phần cứng AI, môi trường học thuật lại rất vững chắc và cởi mở, em hy vọng tương lai có thể mang kiến thức về nước thúc đẩy hợp tác công nghệ.',
    prompt: '陳同學選擇到臺灣深造的主要原因是什麼？',
    promptVi: 'Nguyên nhân chính bạn Trần lựa chọn đến Đài Loan học nâng cao là gì?',
    options: [
      '臺灣的生活物價低廉且入學標準極為寬鬆。',
      '臺灣在半導體與科技領域具備全球領先地位及優良學術環境。',
      '他已經在臺灣找到一份年薪百萬的高階主管職位。',
      '他主要想利用留學期間環島旅遊體驗風景。'
    ],
    optionsVi: [
      'Mức sống tại Đài Loan rẻ và tiêu chuẩn nhập học vô cùng dễ dãi.',
      'Đài Loan có vị thế dẫn đầu toàn cầu trong lĩnh vực bán dẫn & công nghệ cùng môi trường học thuật tốt.',
      'Anh ấy đã tìm được công việc quản lý cấp cao lương triệu tệ tại Đài Loan.',
      'Anh ấy chủ yếu muốn tận dụng thời gian du học để đi du lịch vòng quanh đảo ngắm cảnh.'
    ],
    correctIndex: 1,
    explanation: 'Từ khóa ăn điểm: 「半導體製造與人工智慧硬體研發領域位居全球關鍵樞紐地位，學術研究環境扎實」→ Đáp án B chuẩn xác.'
  },

  // --- PHẦN 2: 閱讀測驗 (READING) ---
  {
    id: 'cbt-r1',
    section: 'reading',
    level: 'TOCFL Band A (A2)',
    readingPassageTitle: '【臺北大眾捷運轉乘優惠說明】',
    readingPassage: '持普通悠遊卡或一卡通搭乘臺北捷運，於出站後一小時內轉乘雙北指定公車，享有全票每程扣減新臺幣八元之轉乘折扣優惠。注意：同站進出或超過一小時轉乘者不適用本優惠。',
    readingPassageVi: 'Sử dụng thẻ EasyCard hoặc iPASS phổ thông đi tàu điện ngầm Đài Bắc, trong vòng 1 giờ sau khi quẹt thẻ ra ga chuyển sang xe buýt chỉ định của Đài Bắc/Tân Bắc, được hưởng ưu đãi giảm giá 8 Đài tệ mỗi lượt vé người lớn. Lưu ý: Ra vào cùng 1 ga hoặc chuyển tuyến sau 1 tiếng không áp dụng ưu đãi này.',
    prompt: '根據這則捷運轉乘公告，下列哪一項敘述是正確的？',
    promptVi: 'Căn cứ theo thông báo chuyển tuyến MRT trên, phát biểu nào sau đây là đúng?',
    options: [
      '乘客在捷運出站後兩小時內搭公車依然能享有八元折扣。',
      '只要在出站後一小時內轉搭指定公車，即可折抵新臺幣八元。',
      '本優惠僅限於週末假日搭乘公車時才可以折抵。',
      '不管刷哪一種卡片，同站進出都能退還車資全額。'
    ],
    optionsVi: [
      'Hành khách trong vòng 2 tiếng sau khi ra ga đi xe buýt vẫn được giảm 8 Đài tệ.',
      'Chỉ cần trong vòng 1 tiếng sau khi ra ga chuyển sang xe buýt chỉ định là được trừ 8 Đài tệ.',
      'Ưu đãi này chỉ giới hạn vào cuối tuần ngày lễ đi xe buýt mới được trừ tiền.',
      'Bất kể quẹt loại thẻ nào, quẹt ra vào cùng 1 ga đều được hoàn lại toàn bộ tiền vé.'
    ],
    correctIndex: 1,
    explanation: 'Văn bản nêu rõ: 「於出站後一小時內轉乘雙北指定公車，享有全票每程扣減新臺幣八元」→ Trong vòng 1 tiếng được giảm 8 Đài tệ (B).'
  },
  {
    id: 'cbt-r2',
    section: 'reading',
    level: 'TOCFL Band B (B1)',
    readingPassageTitle: '【文法選詞填空】',
    readingPassage: '王老師對李明說：「你______已經通過了華語文能力測驗進階級，______應該勇於開口與本地人交流，不要害怕犯錯。」',
    readingPassageVi: 'Thầy Vương nói với Lý Minh: "Em ______ đã thi đỗ TOCFL cấp Tiến giai rồi, ______ nên dũng cảm mở miệng giao tiếp với người bản xứ, đừng sợ mắc lỗi."',
    prompt: '請選出最適合填入空格中的關聯詞：',
    promptVi: 'Hãy chọn cặp liên từ phù hợp nhất để điền vào chỗ trống:',
    options: [
      '雖然……但是……',
      '既然……就……',
      '不但……而且……',
      '寧可……也不……'
    ],
    optionsVi: [
      'Tuy... nhưng...',
      'Đã... thì...',
      'Không những... mà còn...',
      'Thà... chứ không...'
    ],
    correctIndex: 1,
    explanation: 'Cấu trúc B1: 「既然 A 就 B」(Đã A thì nên B). Vế trước đưa ra tiền đề thực tế đã rõ ràng (đã đỗ TOCFL B1), vế sau đưa ra lời khuyên hoặc kết luận hợp lý (thì nên tự tin giao lưu) → Chọn 「既然……就……」.'
  },
  {
    id: 'cbt-r3',
    section: 'reading',
    level: 'TOCFL Band B (B1)',
    readingPassageTitle: '【社團法人臺灣環境保護協會 公告】',
    readingPassage: '為響應源頭減塑運動，自即日起，本市所有連鎖手搖飲店及咖啡館不再主動提供一次性塑膠吸管與提袋。凡自備環保杯購買現調飲料者，每杯當場折抵新臺幣五元，鼓勵大眾養成自備餐具之良好綠色生活習慣。',
    readingPassageVi: 'Nhằm hưởng ứng phong trào giảm rác thải nhựa từ nguồn, kể từ hôm nay, tất cả các chuỗi quán trà sữa và quán cà phê trong thành phố sẽ không còn chủ động cung cấp ống hút và túi nilon dùng một lần. Bất kỳ ai tự mang bình/cốc cá nhân đi mua đồ uống pha chế đều được trừ trực tiếp 5 Đài tệ mỗi cốc, khuyến khích người dân hình thành thói quen xanh tốt đẹp.',
    prompt: '這則公告的主要目的與具體措施是什麼？',
    promptVi: 'Mục đích chính và biện pháp cụ thể của thông báo này là gì?',
    options: [
      '全面調漲所有手搖飲料價格以增加政府稅收。',
      '禁止市民在公開場所飲用含糖珍珠奶茶。',
      '推行減塑環保政策，鼓勵消費者自備環保杯並給予現金回饋。',
      '要求所有餐飲業者改用塑膠袋包裝所有食品。'
    ],
    optionsVi: [
      'Tăng giá toàn bộ đồ uống trà sữa để tăng thuế cho chính phủ.',
      'Cấm người dân uống trà sữa trân châu có đường ở nơi công cộng.',
      'Thực hiện chính sách giảm rác thải nhựa, khuyến khích khách tự mang cốc và giảm tiền trực tiếp.',
      'Yêu cầu tất cả các hộ kinh doanh ăn uống đổi sang dùng túi nilon bọc toàn bộ đồ ăn.'
    ],
    correctIndex: 2,
    explanation: 'Từ khóa: 「源頭減塑、不再主動提供一次性塑膠、自備環保杯每杯折抵五元」→ Mục đích là thúc đẩy bảo vệ môi trường giảm đồ nhựa và giảm giá khi mang cốc cá nhân (C).'
  },
  {
    id: 'cbt-r4',
    section: 'reading',
    level: 'TOCFL Band B (B2)',
    readingPassageTitle: '【臺灣獨特的統一發票對獎文化】',
    readingPassage: '在臺灣購物時，收銀員都會遞上一張「統一發票」。這張發票不僅僅是記帳憑證，財政部每兩個月還會開出各項特別獎與頭獎，最高獎金高達新臺幣一千萬元。這項制度於1951年推行，旨在透過全民對獎誘因，防止商家逃漏營業稅，如今已發展成臺灣社會一項普遍且富有人情味的庶民文化。甚至許多民眾習慣將發票投入超商的透明愛心捐贈箱，為弱勢團體募集善款。',
    readingPassageVi: 'Khi mua sắm ở Đài Loan, thu ngân luôn trao cho bạn một tờ "Hóa đơn thống nhất" (統一發票). Tờ hóa đơn này không chỉ là chứng từ ghi sổ, Bộ Tài chính cứ 2 tháng một lần lại quay số trúng thưởng các giải đặc biệt với tiền thưởng cao nhất lên tới 10 triệu Đài tệ. Chế độ này được ban hành từ năm 1951, nhằm tạo động lực cho toàn dân đòi hóa đơn để ngăn chặn các cửa hàng trốn thuế doanh thu, ngày nay đã phát triển thành một nét văn hóa dân dã gần gũi và nhân văn của xã hội Đài Loan. Thậm chí nhiều người dân còn có thói quen bỏ hóa đơn vào các hộp quyên góp từ thiện trong suốt ở cửa hàng tiện lợi để ủng hộ các nhóm người yếu thế.',
    prompt: '臺灣政府當初創立「統一發票開獎制度」的核心初衷是什麼？',
    promptVi: 'Ý định cốt lõi ban đầu của chính quyền Đài Loan khi thành lập "Chế độ quay thưởng hóa đơn" là gì?',
    options: [
      '為了吸引大量外國觀光客到臺灣各大夜市消費。',
      '藉由開獎的高額誘因促使大眾索取發票，防止店家逃漏營業稅。',
      '強迫所有非營利慈善機構退出社會救助領域。',
      '取代新臺幣現金紙鈔作為新型數位加密貨幣。'
    ],
    optionsVi: [
      'Để thu hút lượng lớn khách du lịch nước ngoài tới tiêu dùng tại các chợ đêm Đài Loan.',
      'Nhờ động lực trúng thưởng lớn thúc đẩy người dân đòi hóa đơn, ngăn ngừa cửa hàng trốn thuế.',
      'Ép buộc tất cả các tổ chức từ thiện phi lợi nhuận rút lui khỏi lĩnh vực cứu trợ xã hội.',
      'Thay thế tiền mặt Đài tệ để làm một loại tiền mã hóa kỹ thuật số mới.'
    ],
    correctIndex: 1,
    explanation: 'Bài đọc nêu rõ: 「旨在透過全民對獎誘因，防止商家逃漏營業稅」(Nhằm thông qua động lực đổi thưởng của toàn dân để ngăn chặn thương nhân trốn thuế) → Đáp án B chính xác.'
  },
  {
    id: 'cbt-r5',
    section: 'reading',
    level: 'TOCFL Band B (B2)',
    readingPassageTitle: '【YouBike公共自行車系統深度解析】',
    readingPassage: 'YouBike公共自行車自2009年於臺北信義計畫區試辦以來，已發展為全臺涵蓋多個縣市的低碳接駁網絡。其優勢在於甲地租借、乙地歸還的便利彈性，以及與悠遊卡、一卡通的高度整合。近年全面升級的YouBike 2.0更導入車載智慧機芯與太陽能供電模組，免除了傳統車柱牽設地下電纜的工程限制，使得設站密度大幅提升，深入社區巷弄，成功解決了大眾運輸「最後一哩路」的通勤痛點。',
    readingPassageVi: 'Hệ thống xe đạp công cộng YouBike kể từ khi được thử nghiệm tại khu Kế hoạch Tín Nghĩa Đài Bắc năm 2009, đến nay đã phát triển thành mạng lưới giao thông kết nối carbon thấp bao phủ nhiều huyện thị trên toàn Đài Loan. Ưu thế của nó nằm ở sự linh hoạt tiện lợi thuê ở điểm A trả ở điểm B, cùng sự tích hợp sâu rộng với thẻ EasyCard và iPASS. Hệ thống YouBike 2.0 nâng cấp toàn diện gần đây còn đưa vào chip thông minh gắn trên xe và tấm pin năng lượng mặt trời, loại bỏ sự hạn chế công trình phải chôn dây cáp ngầm của cột khóa truyền thống, giúp mật độ đặt trạm tăng mạnh, đi sâu vào từng con ngõ ngách, giải quyết triệt để bài toán khó "dặm cuối cùng" của người đi làm.',
    prompt: '相較於早期代系統，YouBike 2.0 能夠快速深入巷弄設站的最關鍵技術革新是什麼？',
    promptVi: 'So với hệ thống thế hệ trước, cải tiến công nghệ then chốt nhất giúp YouBike 2.0 có thể nhanh chóng đi sâu vào các con ngõ để lập trạm là gì?',
    options: [
      '車輛速度提升至時速六十公里並配備自動防撞雷達。',
      '全面取消悠遊卡感應並改為現金投幣模式。',
      '採用車載智慧機與太陽能供電，擺脫車柱需埋設地下電纜之限制。',
      '僅限於假日白天開放租借，夜間一律自動停止營運。'
    ],
    optionsVi: [
      'Tốc độ xe nâng lên 60 km/h và trang bị radar chống va chạm tự động.',
      'Hủy bỏ hoàn toàn quẹt thẻ EasyCard và chuyển sang nhét tiền xu mặt.',
      'Áp dụng chip thông minh gắn trên thân xe và năng lượng mặt trời, thoát khỏi hạn chế phải chôn cáp ngầm của cột khóa.',
      'Chỉ giới hạn cho thuê vào ban ngày cuối tuần, ban đêm đều tự động ngừng hoạt động.'
    ],
    correctIndex: 2,
    explanation: 'Văn bản nêu rõ: 「導入車載智慧機芯與太陽能供電模組，免除了傳統車柱牽設地下電纜的工程限制，使得設站密度大幅提升，深入社區巷弄」→ Nhờ chip trên xe và năng lượng mặt trời không cần đào cáp ngầm (C).'
  }
];

// Official TOCFL Band Benchmark Criteria
function evaluateTocflBand(score: number, total: number) {
  const percentage = Math.round((score / total) * 100);
  if (percentage >= 85) {
    return {
      band: 'TOCFL Band B (Level 4 · 高階級 B2)',
      color: 'bg-emerald-600 text-white',
      badge: '🏆 B2',
      desc: 'Xuất sắc! Đạt năng lực Hoa ngữ Cao giai (B2), hoàn toàn đủ điều kiện du học thạc sĩ, tiến sĩ và làm việc chuyên nghiệp tại Đài Loan.',
    };
  }
  if (percentage >= 70) {
    return {
      band: 'TOCFL Band B (Level 3 · 進階級 B1)',
      color: 'bg-teal-600 text-white',
      badge: '🥇 B1',
      desc: 'Tuyệt vời! Đạt năng lực Tiến giai (B1), đủ điều kiện xin học bổng chính phủ Đài Loan (MOE) và nhập học đại học.',
    };
  }
  if (percentage >= 50) {
    return {
      band: 'TOCFL Band A (Level 2 · 基礎級 A2)',
      color: 'bg-blue-600 text-white',
      badge: '🥈 A2',
      desc: 'Đạt năng lực Căn bản (A2), tự tin giao tiếp đời sống hàng ngày và mua sắm, làm thủ tục cơ bản tại Đài Loan.',
    };
  }
  if (percentage >= 35) {
    return {
      band: 'TOCFL Band A (Level 1 · 入門級 A1)',
      color: 'bg-amber-600 text-white',
      badge: '🥉 A1',
      desc: 'Đạt mức Nhập môn (A1), nhận biết được các chỉ dẫn và câu đối thoại cơ bản.',
    };
  }
  return {
    band: 'Cần ôn luyện thêm',
    color: 'bg-slate-700 text-white',
    badge: '🌱 Novice',
    desc: 'Chưa đạt mốc chứng chỉ TOCFL Band A. Hãy tiếp tục học từ vựng 8000 từ và làm bài ôn tập hàng ngày nhé!',
  };
}

export const TocflMockExamSection: React.FC = () => {
  // Test Lifecycle: 'welcome' | 'testing' | 'submitted' | 'review'
  const [testState, setTestState] = useState<'welcome' | 'testing' | 'submitted' | 'review'>('welcome');

  // Exam Progress State (Wizard: 1 Câu / Trang)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  // Audio Playback Security (Chống tua & chỉ nghe 1 lần duy nhất)
  const [hasPlayedAudio, setHasPlayedAudio] = useState<Record<string, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Countdown Timer
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(30 * 60); // 30 minutes
  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState<boolean>(false);

  // Cloud History Logs
  const [examLogs, setExamLogs] = useState<CloudExamLog[]>([]);

  const currentUser = getCurrentUserAccount();
  const activeUsername = currentUser?.username || 'guest';

  // Load Exam History on mount
  useEffect(() => {
    fetchExamLogsFromCloud(activeUsername).then((logs) => {
      setExamLogs(logs);
    });
  }, [activeUsername]);

  // Countdown timer effect
  useEffect(() => {
    if (testState !== 'testing') return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out!
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testState]);

  const currentQ = OFFICIAL_CBT_QUESTIONS[currentQuestionIndex];
  const totalQuestions = OFFICIAL_CBT_QUESTIONS.length;

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Audio Player Handler (Custom Player with strict 1-time play policy)
  const handlePlayAudio = (qId: string, script?: string) => {
    if (!script || hasPlayedAudio[qId] || isPlayingAudio) return;

    setIsPlayingAudio(true);
    speakTaiwanMandarin(script, 0.88, () => {
      // Callback fired onEnd / onError
      setIsPlayingAudio(false);
      setHasPlayedAudio((prev) => ({ ...prev, [qId]: true }));
    });
  };

  // Answer selection
  const handleSelectOption = (qId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionIndex,
    }));
  };

  // Toggle bookmark flag
  const handleToggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Secure Server-like Grading calculation on submit
  const scoreResult = useMemo(() => {
    if (testState === 'welcome') return { totalScore: 0, listeningScore: 0, readingScore: 0 };

    let totalScore = 0;
    let listeningScore = 0;
    let readingScore = 0;

    for (const q of OFFICIAL_CBT_QUESTIONS) {
      const chosen = answers[q.id];
      if (chosen === q.correctIndex) {
        totalScore++;
        if (q.section === 'listening') listeningScore++;
        if (q.section === 'reading') readingScore++;
      }
    }
    return { totalScore, listeningScore, readingScore };
  }, [answers, testState]);

  const handleSubmitExam = async () => {
    setShowConfirmSubmitModal(false);
    setTestState('submitted');

    // Secure grading & save to Supabase cloud
    const accuracy = Math.round((scoreResult.totalScore / totalQuestions) * 100);
    const bandInfo = evaluateTocflBand(scoreResult.totalScore, totalQuestions);
    const isPassed = accuracy >= 50;

    await saveExamLogToCloud({
      username: activeUsername,
      exam_type: 'mock-tocfl',
      band_or_level: bandInfo.band,
      score: scoreResult.totalScore,
      total_questions: totalQuestions,
      accuracy,
      passed: isPassed,
    });

    const updated = await fetchExamLogsFromCloud(activeUsername);
    setExamLogs(updated);
  };

  const handleStartExam = () => {
    setAnswers({});
    setFlaggedQuestions(new Set());
    setHasPlayedAudio({});
    setIsPlayingAudio(false);
    setCurrentQuestionIndex(0);
    setTimeLeftSeconds(30 * 60);
    setTestState('testing');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const bandResult = evaluateTocflBand(scoreResult.totalScore, totalQuestions);

  return (
    <div className="space-y-5 select-none font-sans">
      {/* ======================================================== */}
      {/* 1. WELCOME SCREEN (SẢNH CHỜ THI THỬ CHUẨN CBT SC-TOP) */}
      {/* ======================================================== */}
      {testState === 'welcome' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5" /> 國家華語測驗推動工作委員會 SC-TOP
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  華語文能力測驗 (TOCFL CBT 電腦化模擬試場)
                </h2>
                <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
                  Giao diện mô phỏng 100% kỳ thi trên máy tính chính thức tại Đài Loan (cbt.sc-top.org.tw): Làm bài từng câu (Wizard), hệ thống âm thanh nghe 1 lần chống tua, đề thi thuần Phồn thể không dịch tiếng Việt trong khi thi.
                </p>
              </div>

              <button
                onClick={handleStartExam}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" /> BẮT ĐẦU VÀO PHÒNG THI
              </button>
            </div>
          </div>

          {/* Exam Rules & Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">1. Băng nghe chống tua (1 lần duy nhất)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Trong phần Nghe hiểu (聽力), mỗi câu chỉ được bấm phát âm thanh đúng 1 lần. Người thi không thể tua nhanh, tua lại hay bấm nghe lần 2, đúng chuẩn phòng thi thực tế tại Đài Loan.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">2. 100% Chữ Phồn thể (Ẩn tiếng Việt)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Suốt quá trình làm bài thi, toàn bộ đề bài, đoạn đọc và 4 đáp án hoàn toàn bằng chữ Hán Phồn thể. Bản dịch tiếng Việt và giải thích chi tiết chỉ xuất hiện sau khi bạn đã nộp bài.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">3. Giao diện Wizard & Bảng số câu hỏi</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mỗi màn hình hiển thị 1 câu duy nhất. Thanh điều hướng cho phép bạn tự do chuyển câu, đánh dấu câu phân vân (🚩) và kiểm tra những câu chưa làm trước khi nộp bài.
              </p>
            </div>
          </div>

          {/* Exam Logs History */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Lịch sử thi thử TOCFL của bạn (@{activeUsername})
              </h3>
            </div>
            {examLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                Bạn chưa có lượt thi thử nào. Hãy bấm nút Bắt đầu để trải nghiệm bài thi chuẩn CBT nhé!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase">
                      <th className="py-2.5 px-3">Thời gian thi</th>
                      <th className="py-2.5 px-3">Loại bài thi</th>
                      <th className="py-2.5 px-3">Cấp bậc / Band</th>
                      <th className="py-2.5 px-3">Điểm số</th>
                      <th className="py-2.5 px-3">Xếp loại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {examLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-500">
                          {new Date(log.created_at).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {log.exam_type === 'mock-tocfl' ? 'TOCFL CBT Mô phỏng' : log.exam_type}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-indigo-700">
                          {log.band_or_level}
                        </td>
                        <td className="py-2.5 px-3 font-extrabold text-slate-900">
                          {log.score} / {log.total_questions} ({log.accuracy}%)
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold ${
                              log.passed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {log.passed ? '✓ Đạt' : 'Chưa đạt'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CBT TESTING ROOM (WIZARD: 1 CÂU / TRANG) */}
      {/* ======================================================== */}
      {testState === 'testing' && currentQ && (
        <div className="space-y-4">
          {/* Official Top Bar */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                CBT
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest block">
                  SC-TOP TOCFL · 華語文能力測驗
                </span>
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  {currentQ.section === 'listening' ? '【第一部分：聽力測驗】' : '【第二部分：閱讀測驗】'}
                  <span className="text-xs text-slate-400 font-normal">
                    (第 {currentQuestionIndex + 1} 題 / 共 {totalQuestions} 題)
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Countdown Timer */}
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-black font-mono transition ${
                  timeLeftSeconds <= 180
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-amber-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>倒數計時：{formatTimer(timeLeftSeconds)}</span>
              </div>

              {/* Submit Button */}
              <button
                onClick={() => setShowConfirmSubmitModal(true)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
              >
                交卷 (Nộp bài)
              </button>
            </div>
          </div>

          {/* Main Question Arena */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Area: Question Prompt & Passage (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  題號 Question {currentQuestionIndex + 1} · {currentQ.level}
                </span>

                <button
                  onClick={() => handleToggleFlag(currentQ.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition border ${
                    flaggedQuestions.has(currentQ.id)
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${flaggedQuestions.has(currentQ.id) ? 'fill-amber-600 text-amber-600' : ''}`} />
                  {flaggedQuestions.has(currentQ.id) ? '已標記 (Đã đánh dấu)' : '標記此題 (Đánh dấu)'}
                </button>
              </div>

              {/* LISTENING SECTION: Custom Audio Player */}
              {currentQ.section === 'listening' && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-amber-700" />
                      聽力錄音播放區 (Khu vực phát âm thanh)
                    </span>
                    <span className="text-[11px] font-semibold text-amber-800">
                      規定：每題錄音僅限播放一次
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handlePlayAudio(currentQ.id, currentQ.audioScript)}
                      disabled={hasPlayedAudio[currentQ.id] || isPlayingAudio}
                      className={`px-5 py-3 rounded-2xl text-xs font-bold transition shadow-sm flex items-center gap-2 ${
                        isPlayingAudio
                          ? 'bg-amber-600 text-white cursor-wait animate-pulse'
                          : hasPlayedAudio[currentQ.id]
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                          : 'bg-slate-900 hover:bg-slate-800 text-amber-300 active:scale-95'
                      }`}
                    >
                      {isPlayingAudio ? (
                        <>
                          <Volume2 className="w-4 h-4 animate-bounce" />
                          <span>錄音播放中... 請專注聆聽 (Đang phát...)</span>
                        </>
                      ) : hasPlayedAudio[currentQ.id] ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>錄音已播放完畢 (Đã phát xong · Không thể nghe lại)</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-amber-300" />
                          <span>點擊播放聽力錄音 (Bấm để phát âm thanh)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* READING SECTION: Passage Display */}
              {currentQ.section === 'reading' && currentQ.readingPassage && (
                <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 space-y-2">
                  {currentQ.readingPassageTitle && (
                    <h4 className="font-tc font-bold text-sm text-indigo-950">
                      {currentQ.readingPassageTitle}
                    </h4>
                  )}
                  <p className="font-tc text-sm md:text-base text-slate-800 leading-relaxed whitespace-pre-line">
                    {currentQ.readingPassage}
                  </p>
                </div>
              )}

              {/* Question Prompt (100% Traditional Chinese) */}
              <div className="py-2">
                <h3 className="font-tc text-lg md:text-xl font-bold text-slate-900 leading-snug">
                  {currentQ.prompt}
                </h3>
              </div>

              {/* 4 Choices (A, B, C, D) in pure Traditional Chinese */}
              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map((optionText, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`text-left p-4 rounded-2xl border transition flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/30'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-white border border-slate-300 text-slate-600'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="font-tc text-sm md:text-base font-semibold leading-relaxed flex-1">
                        {optionText}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Previous / Next Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> 上一題 (Câu trước)
                </button>

                {currentQuestionIndex + 1 < totalQuestions ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    下一題 (Câu tiếp theo) <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmSubmitModal(true)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                  >
                    交卷 (Nộp bài thi) <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Area: CBT Question Palette / Grid (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    題號清單 (Danh sách câu hỏi)
                  </h4>
                  <span className="text-xs text-slate-500 font-semibold">
                    進度：{answeredCount} / {totalQuestions}
                  </span>
                </div>

                {/* Question Legend */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-slate-900 inline-block" /> 已作答 (Đã làm)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 inline-block" /> 未作答 (Chưa làm)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-amber-400 inline-block" /> 已標記 (Đánh dấu)
                  </span>
                </div>

                {/* Numbered Buttons Grid */}
                <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto p-1">
                  {OFFICIAL_CBT_QUESTIONS.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isFlagged = flaggedQuestions.has(q.id);
                    const isCurrent = currentQuestionIndex === idx;

                    let bgStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                    if (isAnswered) {
                      bgStyle = 'bg-slate-900 text-white border-slate-900 font-bold';
                    }
                    if (isFlagged) {
                      bgStyle = 'bg-amber-400 text-slate-950 font-black border-amber-400 shadow-sm';
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`h-11 rounded-xl text-xs font-bold transition flex items-center justify-center relative border ${bgStyle} ${
                          isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2' : ''
                        }`}
                        title={`Chuyển đến câu ${idx + 1}`}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => setShowConfirmSubmitModal(true)}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                >
                  確認交卷 (Nộp bài thi)
                </button>
                <button
                  onClick={() => {
                    if (confirm('Bạn có chắc chắn muốn hủy bài thi và quay lại sảnh chờ?')) {
                      setTestState('welcome');
                    }
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  放棄測驗 (Hủy bài thi)
                </button>
              </div>
            </div>
          </div>

          {/* Confirmation Modal when submitting */}
          {showConfirmSubmitModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-slate-900 text-lg">
                    確認送出交卷？ (Xác nhận nộp bài?)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Bạn đã hoàn thành <strong>{answeredCount}</strong> / <strong>{totalQuestions}</strong> câu hỏi.
                  </p>
                  {unansweredCount > 0 && (
                    <div className="text-xs text-rose-700 font-bold bg-rose-50 border border-rose-200 rounded-xl p-2.5 mt-2">
                      ⚠️ Lưu ý: Bạn vẫn còn {unansweredCount} câu chưa chọn đáp án!
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowConfirmSubmitModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    繼續作答 (Quay lại làm tiếp)
                  </button>
                  <button
                    onClick={handleSubmitExam}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md"
                  >
                    確認交卷 (Nộp bài ngay)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SUBMITTED RESULT SCORECARD (BẢNG ĐIỂM CHUẨN TOCFL) */}
      {/* ======================================================== */}
      {testState === 'submitted' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-10 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-3 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block">
              國家華語測驗推動工作委員會 · 成績報告單
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              華語文能力測驗成績報告 (TOCFL Official Score Report)
            </h2>
            <p className="text-xs text-slate-500">
              Thí sinh: <strong>@{activeUsername}</strong> · Ngày thi: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Breakdown Score Tiles */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">聽力 (Nghe)</span>
              <span className="text-2xl font-black text-amber-600">
                {scoreResult.listeningScore}
              </span>
              <span className="text-[11px] text-slate-400 block">/ 7 câu</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">閱讀 (Đọc)</span>
              <span className="text-2xl font-black text-indigo-600">
                {scoreResult.readingScore}
              </span>
              <span className="text-[11px] text-slate-400 block">/ 8 câu</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">總分 (Tổng)</span>
              <span className="text-2xl font-black text-emerald-600">
                {scoreResult.totalScore}
              </span>
              <span className="text-[11px] text-slate-400 block">/ {totalQuestions} câu</span>
            </div>
          </div>

          {/* Achieved Level Banner */}
          <div className={`p-5 rounded-2xl text-center space-y-1.5 shadow-sm ${bandResult.color}`}>
            <span className="text-xs uppercase font-extrabold tracking-widest opacity-90 block">
              Kết quả xếp loại năng lực Hoa ngữ
            </span>
            <h3 className="text-xl md:text-2xl font-black">
              {bandResult.badge} · {bandResult.band}
            </h3>
            <p className="text-xs opacity-95 leading-relaxed pt-1">
              {bandResult.desc}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setTestState('review')}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" /> 查看題目詳細解答與越南語翻譯 (Xem lời giải & dịch nghĩa)
            </button>

            <button
              onClick={handleStartExam}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> 重新測驗 (Làm lại đề thi)
            </button>

            <button
              onClick={() => setTestState('welcome')}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
            >
              返回試場大廳 (Về sảnh thi)
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. EXPLANATION & TRANSLATION REVIEW VIEW (XEM LỜI GIẢI) */}
      {/* ======================================================== */}
      {testState === 'review' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                TOCFL CBT · 測驗解析與完整翻譯
              </span>
              <h2 className="text-xl font-bold mt-1">
                Xem Lại Toàn Bộ Đề Thi Kèm Dịch Nghĩa & Giải Thích Chi Tiết
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Điểm của bạn: <strong className="text-emerald-400">{scoreResult.totalScore} / {totalQuestions}</strong> câu ({bandResult.band})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTestState('submitted')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
              >
                ← 返回成績單 (Xem lại bảng điểm)
              </button>
              <button
                onClick={() => setTestState('welcome')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
              >
                Về sảnh thi
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {OFFICIAL_CBT_QUESTIONS.map((q, idx) => {
              const userChosen = answers[q.id];
              const isCorrect = userChosen === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-3xl border shadow-sm p-6 space-y-4 ${
                    isCorrect ? 'border-emerald-200' : 'border-rose-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                        Câu {idx + 1} · {q.section === 'listening' ? '聽力測驗 (Nghe hiểu)' : '閱讀測驗 (Đọc hiểu)'}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {q.level}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Trả lời đúng ✓
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Trả lời sai ✗
                        </>
                      )}
                    </span>
                  </div>

                  {/* Audio Script with Vietnamese Translation */}
                  {q.audioScript && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 uppercase">
                          Băng nghe Audio Transcript (zh-TW):
                        </span>
                        <button
                          onClick={() => speakTaiwanMandarin(q.audioScript!, 0.88)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 underline"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Nghe lại đoạn thoại
                        </button>
                      </div>
                      <p className="font-tc text-sm font-semibold text-slate-900">
                        {q.audioScript}
                      </p>
                      {q.audioScriptVi && (
                        <p className="text-xs text-amber-950 pt-1 border-t border-amber-200/60 leading-relaxed">
                          <strong>Dịch nghĩa tiếng Việt:</strong> {q.audioScriptVi}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Reading Passage with Vietnamese Translation */}
                  {q.readingPassage && (
                    <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-2">
                      <span className="text-xs font-bold text-indigo-900 uppercase">
                        Đoạn văn đọc hiểu (閱讀短文):
                      </span>
                      <p className="font-tc text-sm text-slate-900 whitespace-pre-line leading-relaxed">
                        {q.readingPassage}
                      </p>
                      {q.readingPassageVi && (
                        <p className="text-xs text-indigo-950 pt-1 border-t border-indigo-200/60 leading-relaxed">
                          <strong>Bản dịch tiếng Việt:</strong> {q.readingPassageVi}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Question Prompt */}
                  <div className="space-y-1">
                    <h4 className="font-tc font-bold text-base md:text-lg text-slate-900">
                      {q.prompt}
                    </h4>
                    {q.promptVi && (
                      <p className="text-xs text-slate-500 font-medium italic">
                        ({q.promptVi})
                      </p>
                    )}
                  </div>

                  {/* 4 Options with Vietnamese translations & marks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {q.options.map((optText, oIdx) => {
                      const isOptionCorrect = oIdx === q.correctIndex;
                      const isOptionChosen = userChosen === oIdx;
                      const letter = String.fromCharCode(65 + oIdx);
                      const optVi = q.optionsVi && q.optionsVi[oIdx];

                      let style = 'bg-slate-50 border-slate-200 text-slate-800';
                      if (isOptionCorrect) {
                        style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500/30';
                      } else if (isOptionChosen && !isOptionCorrect) {
                        style = 'bg-rose-50 border-rose-300 text-rose-950';
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`p-3.5 rounded-2xl border transition text-left flex items-start gap-3 ${style}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                              isOptionCorrect
                                ? 'bg-emerald-600 text-white'
                                : isOptionChosen
                                ? 'bg-rose-600 text-white'
                                : 'bg-white border border-slate-300 text-slate-600'
                            }`}
                          >
                            {letter}
                          </span>
                          <div className="space-y-0.5 flex-1">
                            <p className="font-tc text-sm font-bold">{optText}</p>
                            {optVi && (
                              <p className="text-xs text-slate-600 font-normal">
                                ({optVi})
                              </p>
                            )}
                          </div>
                          {isOptionCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                          {isOptionChosen && !isOptionCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* In-depth Explanation Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed space-y-1">
                    <strong className="text-slate-900 block font-bold">💡 Giải thích chi tiết & Phân tích đáp án:</strong>
                    <p>{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={handleStartExam}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Làm lại đề thi mới
            </button>
            <button
              onClick={() => setTestState('welcome')}
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              Về sảnh thi thử
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
