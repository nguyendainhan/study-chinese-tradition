import React, { useState } from 'react';
import { speakTaiwanMandarin } from '../utils/speech';
import { Volume2, Headphones, BookOpen, CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react';

interface MockQuestion {
  id: string;
  section: 'listening' | 'reading';
  level: 'TOCFL Band A' | 'TOCFL Band B1';
  audioScript?: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const MOCK_EXAM_QUESTIONS: MockQuestion[] = [
  {
    id: 'm-1',
    section: 'listening',
    level: 'TOCFL Band A',
    audioScript: '請問，這班捷運會到臺北車站嗎？',
    prompt: 'Nghe câu hỏi (bấm nút Nghe Audio) và chọn câu trả lời phù hợp nhất:',
    options: [
      'A. 對，坐三站就到了。(Đúng rồi, đi 3 trạm là tới.)',
      'B. 我昨天買了一輛腳踏車。(Hôm qua tôi mới mua một chiếc xe đạp.)',
      'C. 這家餐廳的牛肉麵很好吃。(Mì bò của quán này rất ngon.)',
      'D. 機票已經訂好了。(Vé máy bay đã đặt xong rồi.)'
    ],
    correctIndex: 0,
    explanation: 'Người nói hỏi: 「請問，這班捷運會到臺北車站嗎？」(Cho hỏi chuyến MRT này có đến ga Đài Bắc không?) → Đáp án A (Đi 3 trạm là tới) là hợp lý nhất.'
  },
  {
    id: 'm-2',
    section: 'listening',
    level: 'TOCFL Band A',
    audioScript: '男：不好意思，我要一杯珍珠奶茶，微糖去冰。女：好的，一共是五十五元，請問發票要存載具嗎？',
    prompt: 'Nghe đoạn hội thoại ngắn và cho biết hai người đang ở đâu?',
    options: [
      'A. 圖書館 (Thư viện)',
      'B. 飲料店 (Quán nước / Trà sữa)',
      'C. 郵局 (Bưu điện)',
      'D. 醫院 (Bệnh viện)'
    ],
    correctIndex: 1,
    explanation: 'Khách gọi「一杯珍珠奶茶，微糖去冰」và nhân viên hỏi lưu hóa đơn「存載具」, đây là tình huống tại quán nước/trà sữa (飲料店).'
  },
  {
    id: 'm-3',
    section: 'listening',
    level: 'TOCFL Band B1',
    audioScript: '雖然這份工作的薪水比以前高，但是每天都要加班到九點，讓我覺得壓力很大，正在考慮要不要換工作。',
    prompt: 'Nghe độc thoại (TOCFL B1) và cho biết ý chính của người nói là gì?',
    options: [
      'A. 他對現在的工作非常滿意。(Anh ấy rất hài lòng với công việc hiện tại.)',
      'B. 他剛找到一份輕鬆的新工作。(Anh ấy vừa tìm được công việc mới nhàn hạ.)',
      'C. 因為經常加班壓力大，他想換工作。(Vì thường xuyên tăng ca áp lực lớn nên anh ấy muốn đổi việc.)',
      'D. 老闆決定幫他加薪水。(Sếp quyết định tăng lương cho anh ấy.)'
    ],
    correctIndex: 2,
    explanation: 'Người nói cho biết tuy lương cao hơn trước nhưng ngày nào cũng tăng ca đến 9h tối (加班到九點), áp lực lớn (壓力很大) nên đang cân nhắc đổi việc.'
  },
  {
    id: 'm-4',
    section: 'reading',
    level: 'TOCFL Band B1',
    prompt: 'Điền liên từ thích hợp vào chỗ trống: 「______你已經決定要去臺灣留學了，______應該從現在開始好好練習繁體字。」',
    options: [
      'A. 雖然……但是…… (Tuy... nhưng...)',
      'B. 既然……就…… (Đã... thì...)',
      'C. 不但……而且…… (Không những... mà còn...)',
      'D. 哪怕……也…… (Cho dù... cũng...)'
    ],
    correctIndex: 1,
    explanation: 'Cấu trúc B1「既然……就……」(Đã... thì...): Vế trước nêu quyết định đã rõ (đã quyết định đi du học Đài Loan), vế sau đưa ra lời khuyên hợp lý (thì nên luyện chữ Phồn thể ngay từ bây giờ).'
  },
  {
    id: 'm-5',
    section: 'reading',
    level: 'TOCFL Band B1',
    prompt: '【捷運公告】凡持悠遊卡搭乘臺北捷運，並於一小時內轉乘公車者，即可享有轉乘優惠。請問這則公告的意思是什麼？',
    options: [
      'A. 搭捷運不能使用悠遊卡。(Đi tàu MRT không được dùng thẻ EasyCard.)',
      'B. 用悠遊卡搭捷運在一小時內轉搭公車有折扣。(Dùng EasyCard đi MRT rồi chuyển sang xe buýt trong vòng 1 tiếng sẽ được giảm giá.)',
      'C. 週末搭公車完全免費。(Cuối tuần đi xe buýt hoàn toàn miễn phí.)',
      'D. 買捷運票必須先網路報名。(Mua vé MRT bắt buộc phải đăng ký online trước.)'
    ],
    correctIndex: 1,
    explanation: 'Từ khóa B1: 轉乘 (chuyển tuyến tàu/xe), 優惠 (ưu đãi/giảm giá). Quẹt thẻ EasyCard chuyển giữa MRT và xe buýt trong 1 giờ được hưởng ưu đãi giảm giá.'
  }
];

export const TocflMockExamSection: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const score = MOCK_EXAM_QUESTIONS.reduce((acc, q) => {
    return answers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const handleRestart = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-900 text-white rounded-3xl p-6 md:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full">
            <Award className="w-4 h-4 text-amber-300" /> Mô phỏng Kỳ thi Năng lực Hoa ngữ Đài Loan
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-2">
            Phòng Thi Thử TOCFL Nghe Hiểu & Đọc Hiểu (Band A → Band B1)
          </h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
            Làm quen với dạng câu hỏi Nghe hội thoại thực tế (Listening) và Đọc hiểu thông báo/ngữ pháp (Reading) chuẩn cấu trúc đề thi TOCFL tại Đài Loan.
          </p>
        </div>

        {submitted && (
          <div className="bg-white text-slate-900 rounded-2xl p-4 text-center shrink-0 shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-400 block">Kết quả của bạn</span>
            <span className="text-3xl font-bold text-emerald-600">
              {score} / {MOCK_EXAM_QUESTIONS.length}
            </span>
            <span className="text-xs font-semibold text-slate-600 block mt-0.5">
              {score >= 4 ? 'Đạt chuẩn TOCFL B1 🎉' : score >= 2 ? 'Đạt chuẩn TOCFL A2 👍' : 'Cần ôn thêm Band A1 💪'}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {MOCK_EXAM_QUESTIONS.map((q, idx) => {
          const chosen = answers[q.id];
          return (
            <div
              key={q.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                      q.section === 'listening'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-indigo-100 text-indigo-900'
                    }`}
                  >
                    {q.section === 'listening' ? (
                      <>
                        <Headphones className="w-3.5 h-3.5" /> Phần Nghe hiểu (聽力)
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3.5 h-3.5" /> Phần Đọc hiểu (閱讀)
                      </>
                    )}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {q.level}
                  </span>
                </div>

                {q.audioScript && (
                  <button
                    onClick={() => speakTaiwanMandarin(q.audioScript!, 0.88)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition shadow-sm"
                  >
                    <Volume2 className="w-4 h-4" /> Bấm nghe băng đọc (zh-TW)
                  </button>
                )}
              </div>

              <p className="font-tc font-bold text-slate-900 text-base md:text-lg">
                Câu {idx + 1}. {q.prompt}
              </p>

              {submitted && q.audioScript && (
                <p className="text-xs font-tc bg-amber-50 border border-amber-200 text-amber-950 p-3 rounded-xl">
                  <strong>Nội dung băng nghe (Transcript):</strong> {q.audioScript}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {q.options.map((opt, oIdx) => {
                  const isSelected = chosen === oIdx;
                  const isCorrect = oIdx === q.correctIndex;

                  let style =
                    'bg-slate-50 border-slate-200 text-slate-800 hover:bg-emerald-50/50 hover:border-emerald-300';
                  if (!submitted && isSelected) {
                    style = 'bg-slate-900 text-white border-slate-900 font-semibold';
                  } else if (submitted) {
                    if (isCorrect) {
                      style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                    } else if (isSelected) {
                      style = 'bg-rose-50 border-rose-400 text-rose-900';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => {
                        if (!submitted) {
                          setAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                        }
                      }}
                      className={`text-left p-3.5 rounded-2xl border font-tc text-sm transition flex items-center justify-between gap-2 ${style}`}
                    >
                      <span>{opt}</span>
                      {submitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <strong>Giải thích đáp án:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 pt-2">
        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
          >
            Nộp bài & Xem chấm điểm giải thích chi tiết
          </button>
        ) : (
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition"
          >
            <RotateCcw className="w-4 h-4" /> Làm lại đề thi thử
          </button>
        )}
      </div>
    </div>
  );
};

