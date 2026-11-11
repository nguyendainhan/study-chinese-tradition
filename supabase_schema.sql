-- Chạy đoạn lệnh SQL này trong mục "SQL Editor" của Supabase (https://supabase.com)
-- để tạo bảng lưu trữ Tài khoản & Tiến độ 8000 từ TOCFL trên Cloud:

create table if not exists public.formosa_user_accounts (
  username text primary key,
  display_name text not null,
  password_hash text not null,
  account_json jsonb not null,
  updated_at timestamptz default now()
);

alter table public.formosa_user_accounts enable row level security;

drop policy if exists "Allow public read and write for accounts" on public.formosa_user_accounts;

create policy "Allow public read and write for accounts"
  on public.formosa_user_accounts
  for all
  using (true)
  with check (true);

