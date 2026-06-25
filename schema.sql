-- ═══════════════════════════════════════════════════════════════
--  ArchiPrompts — Supabase Schema (aligned to README spec)
--  Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- ─── Profiles ──────────────────────────────────────────────────
-- Extends Supabase Auth users with ArchiPrompts-specific fields.
create table if not exists profiles (
  id                    uuid primary key references auth.users on delete cascade,
  email                 text not null,
  plan                  text not null default 'free' check (plan in ('free', 'monthly', 'lifetime')),
  plan_expires_at       timestamptz,          -- null for lifetime/free, date for monthly
  paystack_customer_code text,
  country_code          text,                 -- for multi-currency routing
  prompts_used          integer not null default 0,  -- free prompt counter
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_profiles_email on profiles (email);

-- Auto-create profile when a new user signs up via Supabase Auth
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if any, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── Payments ──────────────────────────────────────────────────
-- Immutable log of every Paystack transaction.
create table if not exists payments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles (id) on delete cascade,
  paystack_ref    text unique not null,
  amount          integer not null,         -- in kobo (NGN × 100)
  currency        text not null default 'NGN',
  plan            text not null,
  status          text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  metadata        jsonb default '{}',       -- raw Paystack event data
  created_at      timestamptz not null default now()
);

-- ─── Prompts ───────────────────────────────────────────────────
-- Saved prompt history for each user.
create table if not exists prompts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles (id) on delete cascade,
  label           text,                     -- user-assigned name
  building_type   text,
  ai_tool         text,
  form_data       jsonb,                    -- full form state snapshot
  generated_text  text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_prompts_user on prompts (user_id, created_at desc);

-- ─── Prompt Options ─────────────────────────────────────────────
-- Optional builder options can be seeded here for each section.
create table if not exists prompt_options (
  id          uuid primary key default gen_random_uuid(),
  field       text not null,
  label       text not null,
  value       text not null,
  option_type text not null default 'select' check (option_type in ('select', 'chip')),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_prompt_options_field on prompt_options (field, sort_order);

create or replace function prompt_options_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger prompt_options_updated_at
  before update on prompt_options
  for each row execute function prompt_options_updated_at();

-- ─── RLS (Row Level Security) ──────────────────────────────────
alter table profiles enable row level security;
alter table payments enable row level security;
alter table prompts enable row level security;

-- Users can read/update their own profile
create policy "Users read own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users update own profile" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Users can read their own prompts and insert new ones
create policy "Users read own prompts" on prompts
  for select using (auth.uid() = user_id);
create policy "Users insert own prompts" on prompts
  for insert with check (auth.uid() = user_id);

-- Payments: read own only (inserts via service role webhook)
create policy "Users read own payments" on payments
  for select using (auth.uid() = user_id);

-- ─── Updated-at trigger ────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ─── Specs (Embedding-backed) ─────────────────────────────────
-- A lightweight table for domain-specific spec items to support
-- retrieval-augmented generation. Requires the pgvector extension.
create extension if not exists vector;

create table if not exists specs (
  id uuid primary key default gen_random_uuid(),
  field text not null,
  label text not null,
  value text not null,
  source text default 'catalog',
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create index if not exists idx_specs_field on specs (field);
-- create an ivfflat index for similarity search (requires pgvector)
do $$ begin
  if not exists (
    select 1 from pg_indexes where indexname = 'idx_specs_embedding_ivf'
  ) then
    execute 'create index idx_specs_embedding_ivf on specs using ivfflat (embedding vector_l2_ops) with (lists = 100);';
  end if;
end $$;

-- RPC: match_spec_items(query_embedding vector, p_field text, p_limit int)
-- returns top-N most similar rows for the given field
create or replace function match_spec_items(query_embedding vector, p_field text, p_limit int)
returns table(id uuid, label text, value text, source text) as $$
  select id, label, value, source
  from specs
  where field = p_field and embedding is not null
  order by embedding <-> query_embedding
  limit p_limit;
$$ language sql;
