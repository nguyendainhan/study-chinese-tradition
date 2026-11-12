-- =================================================================================
-- BỘ CƠ SỞ DỮ LIỆU ĐẦY ĐỦ 5 BẢNG CHO WEB FORMOSA HOA NGỮ (SUPABASE POSTGRESQL)
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào "SQL Editor" trên Supabase
-- (https://supabase.com/dashboard/project/bdrrvegnmykeqjzfihzl/sql) và bấm "Run".
-- =================================================================================

-- 1. BẢNG TÀI KHOẢN NGƯỜI DÙNG & TIẾN ĐỘ HỌC (formosa_user_accounts)
-- Hỗ trợ chống trùng lặp tuyệt đối tại tầng Database cho cả username (Primary Key) và email (UNIQUE)
create table if not exists public.formosa_user_accounts (
  username text primary key,
  email text,
  display_name text not null,
  password_hash text not null,
  account_json jsonb not null,
  updated_at timestamptz default now()
);

-- Thêm cột email và ràng buộc UNIQUE chống trùng lặp email nếu bảng đã tồn tại từ trước
alter table public.formosa_user_accounts add column if not exists email text;
create unique index if not exists idx_formosa_accounts_email on public.formosa_user_accounts (email) where email is not null;

alter table public.formosa_user_accounts enable row level security;
drop policy if exists "Allow public read and write for accounts" on public.formosa_user_accounts;
create policy "Allow public read and write for accounts"
  on public.formosa_user_accounts for all using (true) with check (true);

-- 2. BẢNG KHO TỪ VỰNG MỚI DO NGƯỜI DÙNG TỰ NHẬP / EXCEL (formosa_custom_vocab)
create table if not exists public.formosa_custom_vocab (
  id text primary key,
  username text not null,
  traditional text not null,
  simplified text,
  pinyin text,
  zhuyin text,
  han_viet text,
  vietnamese text,
  english text,
  level text,
  vocab_json jsonb not null,
  created_at timestamptz default now()
);

alter table public.formosa_custom_vocab enable row level security;
drop policy if exists "Allow public read and write for custom vocab" on public.formosa_custom_vocab;
create policy "Allow public read and write for custom vocab"
  on public.formosa_custom_vocab for all using (true) with check (true);

-- 3. BẢNG TỪ ĐIỂN NGHĨA TIẾNG VIỆT ĐÃ DỊCH CỦA BỘ 8000 TỪ TOCFL (formosa_vi_translations)
create table if not exists public.formosa_vi_translations (
  traditional text primary key,
  vietnamese text not null,
  updated_at timestamptz default now()
);

alter table public.formosa_vi_translations enable row level security;
drop policy if exists "Allow public read and write for vi translations" on public.formosa_vi_translations;
create policy "Allow public read and write for vi translations"
  on public.formosa_vi_translations for all using (true) with check (true);

-- 4. BẢNG LỊCH SỬ THI THỬ TOCFL & THI XÁC NHẬN CẤP BẬC (formosa_exam_logs)
create table if not exists public.formosa_exam_logs (
  id text primary key,
  username text not null,
  exam_type text not null,
  band_or_level text not null,
  score integer not null,
  total_questions integer not null,
  accuracy integer not null,
  passed boolean not null,
  details_json jsonb,
  created_at timestamptz default now()
);

alter table public.formosa_exam_logs enable row level security;
drop policy if exists "Allow public read and write for exam logs" on public.formosa_exam_logs;
create policy "Allow public read and write for exam logs"
  on public.formosa_exam_logs for all using (true) with check (true);

-- 5. BẢNG SỔ TAY ĐOẠN VĂN ĐỌC HIỂU & GHI CHÚ CÁ NHÂN (formosa_saved_texts)
create table if not exists public.formosa_saved_texts (
  id text primary key,
  username text not null,
  title text not null,
  content text not null,
  note text,
  created_at timestamptz default now()
);

alter table public.formosa_saved_texts enable row level security;
drop policy if exists "Allow public read and write for saved texts" on public.formosa_saved_texts;
create policy "Allow public read and write for saved texts"
  on public.formosa_saved_texts for all using (true) with check (true);
