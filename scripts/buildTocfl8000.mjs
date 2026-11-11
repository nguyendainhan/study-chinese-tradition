import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { pinyin } from 'pinyin-pro';
import cedict from 'cc-cedict';
import { hanvietData } from 'hanviet-pinyin-words';

// Pinyin syllable to Zhuyin (Bopomofo) converter
const INITIAL_MAP = {
  b: 'ㄅ', p: 'ㄆ', m: 'ㄇ', f: 'ㄈ',
  d: 'ㄉ', t: 'ㄊ', n: 'ㄋ', l: 'ㄌ',
  g: 'ㄍ', k: 'ㄎ', h: 'ㄏ',
  j: 'ㄐ', q: 'ㄑ', x: 'ㄒ',
  zh: 'ㄓ', ch: 'ㄔ', sh: 'ㄕ', r: 'ㄖ',
  z: 'ㄗ', c: 'ㄘ', s: 'ㄙ',
};

const FINAL_MAP = {
  a: 'ㄚ', o: 'ㄛ', e: 'ㄜ', ai: 'ㄞ', ei: 'ㄟ', ao: 'ㄠ', ou: 'ㄡ',
  an: 'ㄢ', en: 'ㄣ', ang: 'ㄤ', eng: 'ㄥ', er: 'ㄦ',
  i: 'ㄧ', ia: 'ㄧㄚ', io: 'ㄧㄛ', ie: 'ㄧㄝ', iai: 'ㄧㄞ', iao: 'ㄧㄠ',
  iu: 'ㄧㄡ', iou: 'ㄧㄡ', ian: 'ㄧㄢ', in: 'ㄧㄣ', iang: 'ㄧㄤ', ing: 'ㄧㄥ',
  u: 'ㄨ', ua: 'ㄨㄚ', uo: 'ㄨㄛ', uai: 'ㄨㄞ', ui: 'ㄨㄟ', uei: 'ㄨㄟ',
  uan: 'ㄨㄢ', un: 'ㄨㄣ', uen: 'ㄨㄣ', uang: 'ㄨㄤ', ueng: 'ㄨㄥ', ong: 'ㄨㄥ',
  v: 'ㄩ', ü: 'ㄩ', ue: 'ㄩㄝ', üe: 'ㄩㄝ', van: 'ㄩㄢ', üan: 'ㄩㄢ',
  vn: 'ㄩㄣ', ün: 'ㄩㄣ', iong: 'ㄩㄥ',
};

const WHOLE_SYLLABLES = {
  zhi: 'ㄓ', chi: 'ㄔ', shi: 'ㄕ', ri: 'ㄖ',
  zi: 'ㄗ', ci: 'ㄘ', si: 'ㄙ',
  yi: 'ㄧ', ya: 'ㄧㄚ', yo: 'ㄧㄛ', ye: 'ㄧㄝ', yai: 'ㄧㄞ', yao: 'ㄧㄠ',
  you: 'ㄧㄡ', yan: 'ㄧㄢ', yin: 'ㄧㄣ', yang: 'ㄧㄤ', ying: 'ㄧㄥ',
  wu: 'ㄨ', wa: 'ㄨㄚ', wo: 'ㄨㄛ', wai: 'ㄨㄞ', wei: 'ㄨㄟ',
  wan: 'ㄨㄢ', wen: 'ㄨㄣ', wang: 'ㄨㄤ', weng: 'ㄨㄥ',
  yu: 'ㄩ', yue: 'ㄩㄝ', yuan: 'ㄩㄢ', yun: 'ㄩㄣ', yong: 'ㄩㄥ',
};

const TONE_MARKS = { 1: '', 2: 'ˊ', 3: 'ˇ', 4: 'ˋ', 5: '˙', 0: '˙' };

function singlePinyinToZhuyin(pyWithNumber) {
  const cleaned = pyWithNumber.trim().toLowerCase();
  if (!cleaned) return '';
  const match = cleaned.match(/^([a-züv]+?)([0-5])?$/);
  if (!match) return '';
  const base = match[1];
  const tone = match[2] ? parseInt(match[2], 10) : 1;
  const toneMark = TONE_MARKS[tone] ?? '';

  if (WHOLE_SYLLABLES[base]) {
    return tone === 5 || tone === 0 ? `˙${WHOLE_SYLLABLES[base]}` : `${WHOLE_SYLLABLES[base]}${toneMark}`;
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

function getZhuyinForWord(cleanHanzi) {
  const pyNumArray = pinyin(cleanHanzi, { toneType: 'num', type: 'array' });
  return pyNumArray.map((s) => singlePinyinToZhuyin(s)).filter(Boolean).join(' ');
}

function getHanVietForWord(cleanHanzi) {
  const chars = Array.from(cleanHanzi);
  const parts = chars.map((ch) => {
    const entry = hanvietData[ch];
    if (!entry) return '';
    const allReadings = Object.values(entry).flat();
    return allReadings[0] || '';
  }).filter(Boolean);
  return parts.join(' ') || '—';
}

// Comprehensive Vietnamese dictionary for Novice 1, Novice 2, Level 1 (A1), Level 2 (A2) & common B1 words
const VIET_DICT = {
  // Novice 1 (160 words)
  '我': 'Tôi, mình', '你': 'Bạn, cậu', '妳': 'Bạn (nữ)', '他': 'Anh ấy, ông ấy', '她': 'Cô ấy, bà ấy',
  '我們': 'Chúng tôi, chúng ta', '你們': 'Các bạn', '他們': 'Họ, bọn họ', '您': 'Ngài, ông/bà (kính ngữ)',
  '誰': 'Ai, người nào', '姓名': 'Họ và tên', '人': 'Người, con người', '國': 'Nước, quốc gia',
  '中國': 'Trung Quốc', '美國': 'Nước Mỹ', '日本': 'Nhật Bản', '臺灣': 'Đài Loan', '台灣': 'Đài Loan',
  '名字': 'Tên', '家': 'Nhà, gia đình', '電話': 'Điện thoại', '時間': 'Thời gian', '小時': 'Tiếng đồng hồ, giờ',
  '現在': 'Bây giờ, hiện tại', '今年': 'Năm nay', '今天': 'Hôm nay', '明天': 'Ngày mai', '昨天': 'Hôm qua',
  '早上': 'Buổi sáng sớm', '上午': 'Buổi sáng (trước 12h)', '中午': 'Buổi trưa', '下午': 'Buổi chiều', '晚上': 'Buổi tối',
  '一': 'Số 1 (một)', '二': 'Số 2 (hai)', '三': 'Số 3 (ba)', '四': 'Số 4 (bốn)', '五': 'Số 5 (năm)',
  '六': 'Số 6 (sáu)', '七': 'Số 7 (bảy)', '八': 'Số 8 (tám)', '九': 'Số 9 (chín)', '十': 'Số 10 (mười)',
  '兩': 'Hai (dùng trước lượng từ)', '時候': 'Lúc, khi', '百': 'Trăm (100)', '半': 'Một nửa, rưỡi', '千': 'Nghìn (1000)',
  '爸爸': 'Bố, ba', '媽媽': 'Mẹ, má', '哥哥': 'Anh trai', '弟弟': 'Em trai', '姊姊': 'Chị gái', '姐姐': 'Chị gái',
  '妹妹': 'Em gái', '小孩': 'Trẻ em, con nhỏ', '小孩子': 'Trẻ con', '的': 'Của (trợ từ sở hữu)',
  '第': 'Thứ... (số thứ tự)', '分': 'Phút / Điểm / Phần', '點': 'Giờ / Chấm / Gọi món', '個': 'Cái, người (lượng từ chung)',
  '歲': 'Tuổi', '年': 'Năm', '住': 'Sống, ở, cư trú', '來': 'Đến, tới', '是': 'Là, đúng', '姓': 'Mang họ, họ là',
  '覺得': 'Cảm thấy', '喜歡': 'Thích, yêu thích', '打電話': 'Gọi điện thoại', '漂亮': 'Đẹp, xinh đẹp',
  '高': 'Cao', '老': 'Già, cũ, lâu năm', '好': 'Tốt, khỏe, được', '很': 'Rất', '真': 'Thật, thật là',
  '電腦': 'Máy tính', '老師': 'Giáo viên, thầy/cô giáo', '買': 'Mua', '忙': 'Bận, bận rộn',
  '學生': 'Học sinh, sinh viên', '大學': 'Trường đại học', '學校': 'Trường học', '中文': 'Tiếng Trung Quốc',
  '同學': 'Bạn cùng lớp, bạn học', '字': 'Chữ, chữ viết', '筆': 'Bút viết', '學': 'Học', '問': 'Hỏi',
  '說': 'Nói', '寫': 'Viết', '聽': 'Nghe', '對': 'Đúng / Đối với', '能': 'Có thể (năng lực)', '可以': 'Có thể (cho phép)',
  '上課': 'Lên lớp, vào học', '知道': 'Biết', '電視': 'Ti-vi, truyền hình', '電視機': 'Chiếc ti-vi',
  '水': 'Nước', '久': 'Lâu (thời gian)', '早': 'Sớm / Chào buổi sáng', '再': 'Lại, thêm lần nữa',
  '書': 'Sách', '電影': 'Phim điện ảnh', '以前': 'Trước đây, trước kia', '以後': 'Sau này, về sau',
  '走': 'Đi bộ, rời đi', '等': 'Đợi, chờ', '看': 'Xem, nhìn, đọc', '就': 'Thì, ngay, liền',
  '什麼': 'Cái gì, gì', '朋友': 'Bạn bè', '東西': 'Đồ đạc, thứ, món đồ', '吧': 'Nhé, nhỉ, đi (trợ từ cuối câu)',
  '呢': 'Thế, còn... thì sao (trợ từ)', '嗎': 'Không? (trợ từ nghi vấn)', '找': 'Tìm, kiếm / Thối tiền',
  '做': 'Làm', '再見': 'Tạm biệt, hẹn gặp lại', '怎麼樣': 'Như thế nào, ra sao', '叫': 'Gọi là, tên là',
  '謝謝': 'Cảm ơn', '對不起': 'Xin lỗi', '請問': 'Xin hỏi, cho hỏi thăm', '這': 'Này, đây', '那': 'Đó, kia',
  '公車': 'Xe buýt', '公共汽車': 'Xe buýt công cộng', '車': 'Xe cộ', '車子': 'Chiếc xe',
  '到': 'Đến, tới nơi', '去': 'Đi', '回': 'Về, quay về', '坐': 'Ngồi / Đi bằng (tàu, xe)',
  '這裡': 'Ở đây, chỗ này', '那裡': 'Ở đó, chỗ kia', '哪裡': 'Ở đâu / Có gì đâu (khiêm tốn)',
  '開車': 'Lái xe ô tô', '錢': 'Tiền, tiền bạc', '多少': 'Bao nhiêu', '給': 'Cho, đưa cho',
  '貴': 'Đắt, mắc tiền', '便宜': 'Rẻ', '大': 'To, lớn', '小': 'Nhỏ, bé', '難': 'Khó', '容易': 'Dễ, dễ dàng',
  '有': 'Có', '想': 'Muốn, nhớ, suy nghĩ', '幾': 'Mấy, vài', '塊': 'Đồng (tiền tệ) / Miếng, cục',
  '位': 'Vị (lượng từ lịch sự chỉ người)', '飯': 'Cơm, bữa ăn', '吃': 'Ăn', '請': 'Mời, xin vui lòng',
  '也': 'Cũng', '不': 'Không', '沒': 'Chưa, không có', '都': 'Đều, tất cả', '只': 'Chỉ',
  '可是': 'Nhưng, thế nhưng', '還是': 'Hay là (chọn lựa) / Vẫn còn', '了': 'Rồi (trợ từ hoàn thành)',
  '得': 'Phải (děi) / Trợ từ bổ ngữ (de) / Đạt được (dé)', '過': 'Đã từng / Qua', '沒有': 'Không có, chưa',

  // Novice 2 (234 words)
  '男': 'Nam, con trai', '女': 'Nữ, con gái', '孩子': 'Con cái, đứa trẻ', '小姐': 'Cô, tiểu thư',
  '先生': 'Ông, anh, chồng', '太太': 'Bà, vợ', '女兒': 'Con gái (trong gia đình)', '兒子': 'Con trai (trong gia đình)',
  '大家': 'Mọi người', '路': 'Đường, con đường', '手機': 'Điện thoại di động', '明年': 'Năm sau', '去年': 'Năm ngoái',
  '生日': 'Sinh nhật', '月': 'Tháng / Mặt trăng', '日': 'Ngày / Mặt trời', '星期': 'Tuần lễ, thứ',
  '星期天': 'Chủ nhật', '星期日': 'Chủ nhật', '禮拜天': 'Chủ nhật', '週末': 'Cuối tuần', '號': 'Ngày (trong tháng) / Số',
  '天': 'Ngày / Trời', '從': 'Từ (địa điểm, thời gian)', '在': 'Ở tại / Đang', '愛': 'Yêu, thích',
  '快樂': 'Vui vẻ, hạnh phúc', '太': 'Quá, lắm', '公園': 'Công viên', '國家': 'Đất nước, quốc gia',
  '分鐘': 'Phút (thời lượng)', '家人': 'Người nhà, gia đình', '胖': 'Béo, mập', '矮': 'Thấp, lùn', '瘦': 'Gầy, ốm',
  '萬': 'Vạn (10.000)', '鐘頭': 'Tiếng đồng hồ', '晚': 'Muộn, trễ / Buổi tối', '前天': 'Hôm kia', '後天': 'Ngày kia (ngày mốt)',
  '前年': 'Năm kia', '後年': 'Năm tới nữa (2 năm sau)', '自己': 'Bản thân, tự mình', '它': 'Nó (đồ vật, con vật)',
  '它們': 'Chúng nó (vật)', '最': 'Nhất (so sánh nhất)', '怕': 'Sợ, e rằng', '美': 'Đẹp',
  '應該': 'Nên, cần phải', '真的': 'Thật sự, thật đấy', '非常': 'Vô cùng, cực kỳ', '工作': 'Công việc, làm việc',
  '醫生': 'Bác sĩ', '醫師': 'Bác sĩ (cách gọi trang trọng ở Đài)', '一點': 'Một chút, một ít', '一些': 'Một vài, một số',
  '本': 'Quyển, cuốn (lượng từ sách)', '張': 'Tờ, tấm, cái bàn/giường (lượng từ)', '英文': 'Tiếng Anh',
  '紙': 'Giấy', '問題': 'Câu hỏi, vấn đề', '意思': 'Ý nghĩa', '餐廳': 'Nhà hàng, quán ăn', '飯館': 'Quán cơm, tiệm ăn',
  '畫': 'Vẽ / Bức tranh', '讀': 'Đọc, theo học', '會': 'Biết (kỹ năng) / Sẽ', '為什麼': 'Tại sao, vì sao',
  '下課': 'Tan học, hết tiết', '說話': 'Nói chuyện', '考試': 'Thi, kiểm tra', '懂': 'Hiểu',
  '念': 'Đọc to / Theo học (rất phổ biến ở Đài)', '課': 'Bài học, môn học, tiết học', '教': 'Dạy học',
  '告訴': 'Nói cho biết, bảo', '錯': 'Sai, lỗi', '功課': 'Bài tập về nhà', '教室': 'Phòng học, lớp học',
  '句子': 'Câu văn', '休息': 'Nghỉ ngơi', '房子': 'Ngôi nhà, căn hộ', '房間': 'Căn phòng', '樓': 'Tầng lầu, tòa nhà',
  '門': 'Cửa', '門口': 'Cổng, trước cửa', '桌子': 'Cái bàn', '椅子': 'Cái ghế', '床': 'Cái giường',
  '開': 'Mở, bật / Lái xe', '低': 'Thấp', '不錯': 'Khá tốt, không tệ', '天氣': 'Thời tiết', '空氣': 'Không khí',
  '冷': 'Lạnh', '熱': 'Nóng', '雨': 'Mưa', '下雨': 'Trời mưa', '風': 'Gió', '山': 'Núi', '花': 'Hoa / Tiêu (tiền, thời gian)',
  '枝': 'Cành, cây (lượng từ bút, hoa)', '魚': 'Cá', '雞': 'Gà', '牛': 'Bò', '豬': 'Heo, lợn',
  '咖啡': 'Cà phê', '茶': 'Trà', '用': 'Dùng, sử dụng', '穿': 'Mặc (quần áo), đi (giày)', '起床': 'Thức dậy',
  '方便': 'Thuận tiện, tiện lợi', '睡覺': 'Ngủ', '起來': 'Đứng dậy, thức dậy', '先': 'Trước tiên',
  '常常': 'Thường xuyên', '每': 'Mỗi, mọi', '打': 'Đánh, chơi (thể thao), gọi (điện)', '玩': 'Chơi, đi chơi',
  '運動': 'Tập thể dục, thể thao', '走路': 'Đi bộ', '唱歌': 'Hát, ca hát', '跳': 'Nhảy', '還': 'Vẫn còn / Trả lại (huán)',
  '唱': 'Hát', '歌': 'Bài hát', '跳舞': 'Khiêu vũ, nhảy múa', '又': 'Lại, vừa... vừa...', '球': 'Quả bóng, môn bóng',
  '介紹': 'Giới thiệu', '沒關係': 'Không sao đâu', '事': 'Việc, sự việc', '怎麼': 'Làm sao, thế nào',
  '哪': 'Nào (nghi vấn)', '裡面': 'Bên trong', '上面': 'Bên trên', '下面': 'Bên dưới', '外面': 'Bên ngoài',
  '外頭': 'Bên ngoài', '前面': 'Phía trước', '後面': 'Phía sau', '左邊': 'Bên trái', '右邊': 'Bên phải',
  '旁邊': 'Bên cạnh', '裡': 'Trong', '中': 'Giữa, trong', '地方': 'Nơi, địa phương, chỗ', '附近': 'Gần đây, vùng lân cận',
  '帶': 'Mang theo, dẫn theo', '拿': 'Cầm, lấy', '站': 'Đứng / Trạm, bến xe', '快': 'Nhanh, sắp', '慢': 'Chậm',
  '計程車': 'Xe taxi', '火車': 'Tàu hỏa, xe lửa', '飛機': 'Máy bay', '輛': 'Chiếc (lượng từ xe cộ)',
  '出': 'Ra ngoài', '進': 'Đi vào', '外國': 'Nước ngoài', '手': 'Tay', '腳': 'Chân', '身體': 'Cơ thể, sức khỏe',
  '眼睛': 'Đôi mắt', '鼻子': 'Cái mũi', '藥': 'Thuốc', '累': 'Mệt mỏi', '頭': 'Đầu', '耳朵': 'Tai',
  '感冒': 'Cảm cúm', '生病': 'Bị ốm, đổ bệnh', '餓': 'Đói bụng', '痛': 'Đau', '嘴巴': 'Miệng', '病': 'Bệnh',
  '看病': 'Khám bệnh', '元': 'Đồng, Đài tệ (đơn vị tiền)', '鞋子': 'Giày dép', '衣服': 'Quần áo',
  '比': 'So với (câu so sánh)', '要': 'Muốn, cần, sắp', '長': 'Dài / Lớn lên (zhǎng)', '新': 'Mới',
  '一樣': 'Giống nhau', '見': 'Gặp, thấy', '看見': 'Nhìn thấy', '聽見': 'Nghe thấy', '店': 'Cửa hàng, tiệm',
  '短': 'Ngắn', '飽': 'No bụng', '舊': 'Cũ (đồ vật)', '像': 'Giống như', '一共': 'Tổng cộng', '夠': 'Đủ',
  '筷子': 'Đũa', '件': 'Chiếc, bộ (lượng từ áo, sự việc)', '杯': 'Cốc, ly', '杯子': 'Cái cốc, cái ly',
  '菜': 'Món ăn, rau xanh', '肉': 'Thịt', '酒': 'Rượu, bia', '喝': 'Uống', '少': 'Ít', '多': 'Nhiều',
  '小吃': 'Món ăn vặt, đặc sản đường phố', '牛奶': 'Sữa bò', '蛋': 'Trứng', '餃子': 'Sủi cảo, há cảo',
  '麵': 'Mì, bún, phở', '湯': 'Canh, súp', '包子': 'Bánh bao', '蛋糕': 'Bánh kem, bánh ngọt',
  '麵包': 'Bánh mì', '水果': 'Trái cây, hoa quả', '香蕉': 'Quả chuối', '食物': 'Thức ăn, thực phẩm',
  '飲料': 'Đồ uống, thức uống', '果汁': 'Nước ép trái cây', '甜': 'Ngọt', '菜單': 'Thực đơn (Menu)',
  '巧克力': 'Sô-cô-la', '碗': 'Bát, chén', '冰': 'Đá lạnh, kem đá', '一起': 'Cùng nhau', '因為': 'Bởi vì',
  '和': 'Và, với', '所以': 'Cho nên, vì vậy', '跟': 'Cùng với, đi theo', '一定': 'Nhất định, chắc chắn',
  '可能': 'Có lẽ, có thể', '邊': 'Bên, phía / Vừa... vừa...', '別': 'Đừng / Khác', '馬上': 'Ngay lập tức',
  '然後': 'Sau đó', '著': 'Đang (trợ từ trạng thái tiếp diễn)', '有點': 'Hơi, có chút',

  // High-frequency Level 1 (A1) & Level 2 (A2) & Level 3 (B1)
  '零': 'Số 0 (không)', '爺爺': 'Ông nội', '奶奶': 'Bà nội', '家庭': 'Gia đình', '別人': 'Người khác',
  '大人': 'Người lớn', '老人': 'Người già', '年輕': 'Trẻ tuổi', '男生': 'Nam sinh, con trai', '女生': 'Nữ sinh, con gái',
  '號碼': 'Số (điện thoại, nhà, thứ tự)', '地址': 'Địa chỉ', '市': 'Thành phố / Chợ', '城市': 'Thành phố',
  '街': 'Đường phố, phố', '電子郵件': 'Email, thư điện tử', '禮拜': 'Tuần lễ, thứ', '從前': 'Ngày xưa, trước đây',
  '剛剛': 'Vừa mới', '一會兒': 'Một lát, chốc lát', '結婚': 'Kết hôn, cưới', '春天': 'Mùa xuân',
  '夏天': 'Mùa hè', '秋天': 'Mùa thu', '冬天': 'Mùa đông', '笑': 'Cười', '哭': 'Khóc', '高興': 'Vui mừng, phấn khởi',
  '緊張': 'Hồi hộp, căng thẳng', '可愛': 'Đáng yêu, dễ thương', '生氣': 'Tức giận', '難過': 'Buồn bã',
  '聰明': 'Thông minh', '相信': 'Tin tưởng', '經驗': 'Kinh nghiệm', '辛苦': 'Vất vả, cực nhọc',
  '願意': 'Bằng lòng, sẵn lòng', '習慣': 'Thói quen, quen với', '當然': 'Đương nhiên, tất nhiên', '更': 'Càng, hơn nữa',
  '醫院': 'Bệnh viện', '公司': 'Công ty', '辦公室': 'Văn phòng làm việc', '工人': 'Công nhân',
  '護士': 'Y tá, điều dưỡng', '司機': 'Tài xế, lái xe', '老闆': 'Ông chủ, sếp', '上班': 'Đi làm', '下班': 'Tan làm',
  '能力': 'Năng lực, khả năng', '努力': 'Cố gắng, nỗ lực', '準備': 'Chuẩn bị', '打算': 'Dự định, tính toán',
  '計畫': 'Kế hoạch', '機會': 'Cơ hội', '如果': 'Nếu như', '小學': 'Trường tiểu học', '高中': 'Trường cấp 3 (THPT)',
  '上學': 'Đi học', '開學': 'Khai giảng, bắt đầu học kỳ', '班': 'Lớp học / Ca làm việc', '年級': 'Khối lớp, năm học',
  '作業': 'Bài tập', '成績': 'Thành tích, điểm số', '語言': 'Ngôn ngữ', '華語': 'Tiếng Hoa (cách gọi chuẩn Đài Loan)',
  '黑板': 'Bảng đen', '課本': 'Sách giáo khoa, giáo trình', '字典': 'Từ điển', '注意': 'Chú ý',
  '讀書': 'Đọc sách, đi học', '回答': 'Trả lời', '部分': 'Bộ phận, phần', '想法': 'Suy nghĩ, ý tưởng',
  '學習': 'Học tập', '練習': 'Luyện tập', '參加': 'Tham gia', '文化': 'Văn hóa', '認為': 'Cho rằng, nghĩ rằng',
  '清楚': 'Rõ ràng', '決定': 'Quyết định', '記得': 'Nhớ', '忘': 'Quên', '棒': 'Tuyệt vời, giỏi',
  '辦法': 'Cách giải quyết', '方法': 'Phương pháp', '有用': 'Hữu ích, có ích', '進步': 'Tiến bộ',
  '圖書館': 'Thư viện', '洗手間': 'Nhà vệ sinh', '廁所': 'Nhà vệ sinh', '宿舍': 'Ký túc xá',
  '大樓': 'Tòa nhà lớn, cao ốc', '樓上': 'Tầng trên', '樓下': 'Tầng dưới', '樓梯': 'Cầu thang bộ',
  '電梯': 'Thang máy', '廚房': 'Nhà bếp', '客廳': 'Phòng khách', '窗戶': 'Cửa sổ', '家具': 'Đồ nội thất',
  '沙發': 'Ghế sô-pha', '盒子': 'Cái hộp', '關': 'Đóng, tắt', '燈': 'Đèn', '冷氣': 'Máy lạnh, điều hòa',
  '冰箱': 'Tủ lạnh', '乾淨': 'Sạch sẽ', '房租': 'Tiền thuê nhà', '租': 'Thuê, cho thuê', '世界': 'Thế giới',
  '太陽': 'Mặt trời', '洗澡': 'Tắm rửa', '有空': 'Có thời gian rảnh', '發現': 'Phát hiện, nhận ra',
  '過年': 'Đón Tết, ăn Tết', '新年': 'Năm mới', '游泳': 'Bơi lội', '跑步': 'Chạy bộ', '比賽': 'Thi đấu, cuộc thi',
  '開始': 'Bắt đầu', '騎': 'Cưỡi, đi (xe máy, xe đạp)', '腳踏車': 'Xe đạp', '上網': 'Lên mạng Internet',
  '網路': 'Mạng Internet', '網站': 'Trang web (Website)', '報紙': 'Báo giấy', '電影院': 'Rạp chiếu phim',
  '音樂': 'Âm nhạc', '票': 'Vé', '活動': 'Hoạt động, sự kiện', '故事': 'Câu chuyện', '聊天': 'Trò chuyện, tán gẫu',
  '有時候': 'Có lúc, thỉnh thoảng', '平常': 'Bình thường, ngày thường', '總是': 'Luôn luôn', '已經': 'Đã... rồi',
  '後來': 'Sau đó (trong quá khứ)', '客人': 'Khách, khách hàng', '客氣': 'Khách sáo, lịch sự',
  '不客氣': 'Không có chi, đừng khách sáo', '不好意思': 'Xin lỗi làm phiền / Ngại quá', '麻煩': 'Làm phiền / Phiền phức',
  '禮物': 'Món quà', '歡迎': 'Hoan nghênh, chào mừng', '郵局': 'Bưu điện', '銀行': 'Ngân hàng',
  '幫忙': 'Giúp đỡ', '幫助': 'Giúp đỡ, hỗ trợ', '小朋友': 'Các em nhỏ, thiếu nhi', '信封': 'Phong bì thư',
  '認識': 'Quen biết', '最近': 'Dạo này, gần đây', '聽說': 'Nghe nói', '見面': 'Gặp mặt', '事情': 'Sự việc, công việc',
  '錢包': 'Ví tiền', '怎麼辦': 'Phải làm sao đây?', '車站': 'Nhà ga, bến xe', '汽車': 'Ô tô, xe hơi',
  '飛機場': 'Sân bay', '機場': 'Sân bay', '馬路': 'Đường cái, đường lớn', '路口': 'Giao lộ, ngã đường',
  '十字路口': 'Ngã tư', '對面': 'Đối diện', '旅行': 'Du lịch, chuyến đi', '飯店': 'Khách sạn / Nhà hàng',
  '旅館': 'Khách sạn, nhà nghỉ', '袋子': 'Túi đựng', '參觀': 'Tham quan', '地圖': 'Bản đồ',
  '照相機': 'Máy ảnh', '照相': 'Chụp ảnh', '照片': 'Bức ảnh', '風景': 'Phong cảnh', '中間': 'Ở giữa',
  '離開': 'Rời khỏi', '經過': 'Đi ngang qua, trải qua', '最後': 'Cuối cùng', '病人': 'Bệnh nhân',
  '頭髮': 'Mái tóc', '手指': 'Ngón tay', '肚子': 'Bụng', '臉': 'Khuôn mặt', '健康': 'Khỏe mạnh, sức khỏe',
  '舒服': 'Thoải mái, dễ chịu', '眼鏡': 'Mắt kính', '希望': 'Hy vọng, mong muốn', '書店': 'Hiệu sách',
  '商店': 'Cửa hàng', '市場': 'Chợ, thị trường', '超級市場': 'Siêu thị', '超市': 'Siêu thị',
  '信用卡': 'Thẻ tín dụng', '重要': 'Quan trọng', '顏色': 'Màu sắc', '手錶': 'Đồng hồ đeo tay',
  '襪子': 'Tất, vớ', '裙子': 'Váy, chân váy', '褲子': 'Quần', '外套': 'Áo khoác ngoài',
  '小心': 'Cẩn thận', '比較': 'Khá là, tương đối / So sánh', '差不多': 'Xấp xỉ, gần giống nhau',
  '樣子': 'Dáng vẻ, kiểu dáng', '特別': 'Đặc biệt', '簡單': 'Đơn giản', '其他': 'Khác, những cái khác',
  '聲音': 'Âm thanh, giọng nói', '好像': 'Hình như, giống như', '奇怪': 'Kỳ lạ', '三明治': 'Bánh mì kẹp Sandwich',
  '漢堡': 'Bánh Hamburger', '蘋果': 'Quả táo', '西瓜': 'Dưa hấu', '啤酒': 'Bia', '紅茶': 'Hồng trà, trà đen',
  '點心': 'Đồ ăn nhẹ, tráng miệng, dimsum', '冰淇淋': 'Kem lạnh', '青菜': 'Rau xanh', '湯匙': 'Cái thìa, muỗng',
  '味道': 'Hương vị, mùi vị', '酸': 'Chua', '苦': 'Đắng / Khổ', '鹹': 'Mặn', '辣': 'Cay', '香': 'Thơm',
  '全部': 'Toàn bộ', '所有': 'Tất cả', '需要': 'Cần, nhu cầu', '但是': 'Nhưng mà', '或是': 'Hoặc là',
  '要是': 'Nếu như', '雖然': 'Tuy rằng, mặc dù', '本來': 'Vốn dĩ, ban đầu', '以為': 'Cứ tưởng rằng',
  '不過': 'Có điều, nhưng mà',
};

const CONTEXT_LABELS = {
  '個人資料': '個人資料 · Thông tin cá nhân',
  '工作': '工作 · Công việc & Nghề nghiệp',
  '教育': '教育 · Giáo dục & Trường học',
  '房屋與家庭、環境': '房屋與家庭、環境 · Nhà cửa & Môi trường',
  '日常生活': '日常生活 · Đời sống hàng ngày',
  '閒暇時間、娛樂': '閒暇時間、娛樂 · Giải trí & Thời gian rảnh',
  '與他人的關係': '與他人的關係 · Quan hệ xã hội',
  '旅行': '旅行 · Du lịch & Đi lại',
  '健康及身體照護': '健康及身體照護 · Sức khỏe & Y tế',
  '購物': '購物 · Mua sắm & Tiêu dùng',
  '飲食': '飲食 · Ẩm thực & Ăn uống',
  '其他': '其他 · Giao tiếp & Ngữ pháp chung',
};

const POS_CATEGORY_MAP = (pos) => {
  const p = String(pos || '').trim();
  if (p.includes('N')) return 'Danh từ & Sự vật (名詞 N)';
  if (p.includes('Vst') || p.includes('Vs')) return 'Tính từ & Trạng thái (狀態動詞 Vs/Vst)';
  if (p.includes('V')) return 'Động từ & Hành động (動詞 V/Vp)';
  if (p.includes('Adv')) return 'Phó từ (副詞 Adv)';
  if (p.includes('Conj') || p.includes('Prep')) return 'Giới từ & Liên từ (介詞/連詞)';
  if (p.includes('M') || p.includes('Det')) return 'Lượng từ & Đại từ (量詞/定詞)';
  return 'Từ loại & Biểu đạt khác (其他詞類)';
};

const SHEET_CONFIG = [
  { sheetName: '準備級一級(Novice 1)', levelCode: 'novice1', levelTag: '準備級一級 (Novice 1)', band: 'Band Novice' },
  { sheetName: '準備級二級(Novice 2)', levelCode: 'novice2', levelTag: '準備級二級 (Novice 2)', band: 'Band Novice' },
  { sheetName: '入門級(Level 1)', levelCode: 'level1', levelTag: '入門級 (Level 1 · A1)', band: 'Band A' },
  { sheetName: '基礎級(Level 2)', levelCode: 'level2', levelTag: '基礎級 (Level 2 · A2)', band: 'Band A' },
  { sheetName: '進階級(Level 3)', levelCode: 'level3', levelTag: '進階級 (Level 3 · B1)', band: 'Band B' },
  { sheetName: '高階級(Level 4)', levelCode: 'level4', levelTag: '高階級 (Level 4 · B2)', band: 'Band B' },
  { sheetName: '流利級(Level 5)', levelCode: 'level5', levelTag: '流利級 (Level 5 · C1)', band: 'Band C' },
];

function extractCleanHanzi(rawWord) {
  // Remove parenthetical zhuyin notes like (˙ㄗ) and take primary variant before /
  const withoutParen = String(rawWord).replace(/[\(（][^\)）]*[\)）]/g, '').trim();
  const variants = withoutParen.split(/[\/／]/).map((s) => s.trim()).filter(Boolean);
  // Prefer variant with 臺 if available
  const taiwanVariant = variants.find((v) => v.includes('臺')) || variants[0] || withoutParen;
  const hanziOnly = (taiwanVariant.match(/[\u4e00-\u9fff]+/g) || []).join('');
  return hanziOnly || taiwanVariant;
}

function lookupCedict(cleanHanzi, rawWord) {
  const candidates = [
    cleanHanzi,
    ...String(rawWord).replace(/[\(（][^\)）]*[\)）]/g, '').split(/[\/／]/).map((s) => s.trim()),
  ];

  for (const cand of candidates) {
    if (!cand) continue;
    const res = cedict.getByTraditional(cand);
    if (res && typeof res === 'object') {
      const entries = Object.values(res).flat();
      if (entries.length > 0) {
        const primary = entries.find((e) => !e.is_variant) || entries[0];
        const engList = Array.isArray(primary.english) ? primary.english : [primary.english];
        return {
          simplified: primary.simplified || cand,
          english: engList.slice(0, 3).join('; '),
        };
      }
    }
  }
  return { simplified: cleanHanzi, english: '' };
}

const excelPath = path.resolve('華語八千詞(內含注音字型檔)/華語八千詞表20240923.xlsx');
const wb = XLSX.readFile(excelPath);

const allItems = [];
let globalId = 1;

for (const cfg of SHEET_CONFIG) {
  const sheet = wb.Sheets[cfg.sheetName];
  if (!sheet) continue;
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  for (const row of rows) {
    const rawVocab = String(row['詞彙\r\nVocabulary'] || row['詞彙\nVocabulary'] || '').trim();
    if (!rawVocab) continue;

    const rawPinyin = String(row['漢語拼音\r\nPinyin'] || row['漢語拼音\nPinyin'] || '').trim();
    const rawPos = String(row['詞類\r\nParts of Speech'] || row['詞類\nParts of Speech'] || '').trim();
    const rawContext = String(row['任務領域\r\nContext'] || row['任務領域\nContext'] || '').trim();

    const cleanHanzi = extractCleanHanzi(rawVocab);
    const zhuyin = getZhuyinForWord(cleanHanzi);
    const hanViet = getHanVietForWord(cleanHanzi);
    const { simplified, english } = lookupCedict(cleanHanzi, rawVocab);

    const vietnamese = VIET_DICT[cleanHanzi] || '';
    const contextLabel = rawContext
      ? CONTEXT_LABELS[rawContext] || rawContext
      : POS_CATEGORY_MAP(rawPos);

    allItems.push({
      id: `tocfl-${globalId++}`,
      levelCode: cfg.levelCode,
      levelTag: cfg.levelTag,
      band: cfg.band,
      rawWord: rawVocab,
      traditional: cleanHanzi,
      simplified,
      pinyin: rawPinyin || pinyin(cleanHanzi, { toneType: 'symbol' }),
      zhuyin,
      hanViet,
      pos: rawPos || '—',
      context: rawContext || rawPos || 'Chung',
      contextLabel,
      vietnamese,
      english,
    });
  }
}

// Also extract Cross-Strait Differences sheet (兩岸常用詞語差異表)
const diffSheet = wb.Sheets['兩岸常用詞語差異表'];
const crossStraitDiffs = diffSheet ? XLSX.utils.sheet_to_json(diffSheet, { defval: '' }) : [];

const outputData = {
  totalCount: allItems.length,
  generatedAt: new Date().toISOString(),
  levels: SHEET_CONFIG.map((c) => ({
    code: c.levelCode,
    label: c.levelTag,
    band: c.band,
    count: allItems.filter((i) => i.levelCode === c.levelCode).length,
  })),
  crossStraitDiffs,
  words: allItems,
};

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/tocfl_8000_full.json', JSON.stringify(outputData));
console.log(`Successfully generated public/tocfl_8000_full.json with ${allItems.length} words!`);

