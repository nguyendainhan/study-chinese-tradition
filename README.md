# Formosa Hoa Ngữ — Web Học Tiếng Trung Phồn Thể & Luyện Thi TOCFL 8000 (繁體中文)

Ứng dụng web học tiếng Trung Phồn thể chuẩn Đài Loan, tích hợp đầy đủ **7.517 từ vựng chuẩn TOCFL** (từ file `華語八千詞表20240923.xlsx`), hệ thống tài khoản, bài kiểm tra xác nhận hoàn thành từng cấp bậc và lộ trình ôn tập thông minh (Spaced Repetition System - SRS).

## Tính năng nổi bật
1. **Học 8000 Từ TOCFL (`準備級 Novice 1–2`, `入門級 A1`, `基礎級 A2`, `進階級 B1`, `高階級 B2`, `流利級 C1`):**
   - Phân loại theo **7 cấp bậc** và **12 lĩnh vực phục vụ (`任務領域 Context`)**.
   - Chia nhỏ thành từng bài 20 từ dễ học, kèm **Chú âm (`ㄅㄆㄇㄈ`)**, **Pinyin**, **Âm Hán Việt**, **Nghĩa Tiếng Việt & Tiếng Anh**, phát âm giọng Đài Loan (`zh-TW`) và bảng tập viết thứ tự nét chữ Hán (`HanziWriter`).
   - Kiểm tra bài học 20 từ với thuật toán xáo trộn ngẫu nhiên câu hỏi và vị trí đáp án (A, B, C, D).
   - Bảng đối chiếu 41 từ khác biệt Đài Loan vs. Đại Lục (HSK).
2. **Hệ Thống Thi Xác Nhận Cấp Bậc (Level Certification):**
   - Số lượng câu hỏi tỉ lệ thuận theo dung lượng và độ khó từng cấp (Novice 1: 20 câu, Novice 2: 25 câu, A1: 30 câu, A2: 35 câu, B1: 45 câu, B2: 50 câu, C1: 60 câu).
   - Đạt $\ge 80\%$ để nhận huy hiệu **`🏆 Đã đạt`** và đưa từ vựng cấp đó vào kho ôn tập hàng ngày.
3. **Lộ Trình Ôn Tập Mỗi Ngày (SRS) & Độ Chăm Chỉ Tuần:**
   - **Độ chăm chỉ tuần (% Diligence):** Tính theo tỷ lệ hoàn thành mục tiêu trung bình theo tuần (Thứ 2 – Chủ Nhật) kèm mini tracker 7 ngày trực quan.
   - **Xáo trộn ngẫu nhiên & Giãn cách từ cặp:** Thuật toán chống dồn cụm tự động phân tán các cặp từ trái nghĩa / liền kề (như năm nay/năm sau, hôm qua/hôm nay).
   - **Ẩn phiên âm:** Phần "Nghe chọn chữ" ẩn hoàn toàn Pinyin/Chú âm trước khi chọn đáp án để rèn luyện phản xạ mặt chữ.
   - **Lưu & Tiếp tục tiến độ làm dở (Resume Quiz):** Thoát ra đột xuất hay tải lại trang vẫn tiếp tục câu đang làm mà không mất điểm.
   - **Công tắc từ mới học hôm nay:** Linh hoạt chọn giữa *"Bao gồm"* và *"Để dành mai"* (để kiểm tra trí nhớ qua đêm).
   - **Bảo toàn kết quả khi đổi mục tiêu:** Chuyển đổi giữa 50, 100, 200, 300, 500 từ giữ nguyên các bài đã hoàn thành.
   - **Lên kế hoạch mục tiêu cho ngày mai (Adaptive Goals):** Tự động đề xuất đặt mục tiêu ngày mai ngay sau khi xong hôm nay và tự kích hoạt vào sáng hôm sau.
4. **Đọc hiểu & Ngữ pháp Đương Đại (B1–B2), Giao tiếp thực tế Đài Loan, Luyện nói AI (`zh-TW`) & Thi thử TOCFL.**
5. **Quản lý tài khoản:** Đồng bộ dữ liệu đa thiết bị qua Supabase Cloud Database hoặc xuất/nhập file `.json`.

## Chạy trên máy (Local Development)
```bash
npm install
npm run dev
```

## Tự động cập nhật lên GitHub & Vercel / Netlify
Mỗi khi chỉnh sửa web, chạy lệnh sau (hoặc nhấp đúp file `cap-nhat-web.bat`):
```bash
npm run sync-web
```
