create table if not exists wallets (
  address text primary key,
  provider text not null,
  balance_cents integer not null,
  last_faucet timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists memes (
  id text primary key,
  wallet text not null,
  title text not null,
  ticker text not null,
  caption text not null default '',
  media_kind text not null,
  media_url text not null,
  is_seed boolean not null default false,
  status text not null,
  reject_reason text,
  hour_key text,
  slot_index integer,
  launch_at timestamptz,
  seed_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists memes_launch_idx on memes (launch_at);
create index if not exists memes_wallet_idx on memes (wallet);
create index if not exists memes_hour_idx on memes (hour_key);

create table if not exists positions (
  wallet text not null,
  meme_id text not null,
  qty_cents integer not null default 0,
  cost_cents integer not null default 0,
  held_seconds integer not null default 0,
  last_tick timestamptz not null default now(),
  holding boolean not null default true,
  qualified boolean not null default false,
  primary key (wallet, meme_id)
);

create table if not exists settlements (
  id text primary key,
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists rewards (
  id text primary key,
  wallet text not null,
  meme_id text,
  kind text not null,
  amount_cents integer not null,
  note text not null,
  hour_key text,
  day_key text,
  created_at timestamptz not null default now()
);

create index if not exists rewards_wallet_idx on rewards (wallet);

create unique index if not exists memes_slot_uidx
  on memes (hour_key, slot_index)
  where status = 'scheduled';

