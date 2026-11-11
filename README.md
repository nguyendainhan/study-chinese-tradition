# Formosa Hoa Ngữ — Web Học Tiếng Trung Phồn Thể & Luyện Thi TOCFL 8000 (繁體中文)

Ứng dụng web học tiếng Trung Phồn thể chuẩn Đài Loan, tích hợp đầy đủ **7.517 từ vựng chuẩn TOCFL** (từ file `華語八千詞表20240923.xlsx`), hệ thống tài khoản, bài kiểm tra xác nhận hoàn thành từng cấp bậc và lộ trình ôn tập thông minh (SRS).

## Tính năng chính
1. **Học 8000 Từ TOCFL (`準備級 Novice 1–2`, `入門級 A1`, `基礎級 A2`, `進階級 B1`, `高階級 B2`, `流利級 C1`):**
   - Phân loại theo **7 cấp bậc** và **12 lĩnh vực phục vụ (`任務領域 Context`)**.
   - Chia nhỏ thành từng bài 20 từ dễ học, kèm **Chú âm (`ㄅㄆㄇㄈ`)**, **Pinyin**, **Âm Hán Việt**, **Nghĩa Tiếng Việt & Tiếng Anh**, phát âm giọng Đài Loan (`zh-TW`) và bảng tập viết thứ tự nét chữ Hán (`HanziWriter`).
   - Bảng đối chiếu 41 từ khác biệt Đài Loan vs. Đại Lục (HSK).
2. **Đăng nhập / Đăng xuất & Bài Kiểm Tra Xác Nhận Đạt Cấp Bậc:**
   - Quản lý tiến độ riêng biệt theo từng tài khoản (hỗ trợ xuất/nhập file sao lưu `.json` và đồng bộ đám mây Supabase).
   - Thi xác nhận hoàn thành từng cấp bậc (20 câu, đạt $\ge 80\%$) để nhận huy hiệu **`🏆 Đã đạt`** và mở khóa từ vựng của cấp đó vào kho ôn tập.
3. **Ôn Tập Mỗi Ngày (SRS) & Điểm Tích Cực (XP):**
   - Chỉ ôn tập đúng những từ tài khoản đã học hoặc đã thi đạt (tuyệt đối không lẫn từ chưa học).
   - Tuỳ chỉnh khối lượng ôn tập mỗi ngày (`100`, `200`, `350`, `500`, `1.000` từ) chia thành các bài nhỏ, thưởng **+50 XP** mỗi bài và **+300 XP** khi hoàn thành hết kế hoạch ngày.
4. **Đọc hiểu & Ngữ pháp Đương Đại (B1–B2), Giao tiếp thực tế Đài Loan & Luyện nói AI (`zh-TW`).**

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
