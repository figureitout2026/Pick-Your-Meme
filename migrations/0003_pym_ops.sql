alter table rewards add column if not exists payout_key text;
create unique index if not exists rewards_payout_key_uidx on rewards (payout_key) where payout_key is not null;

alter table wallets add column if not exists owed_cents integer not null default 0;

alter table positions add column if not exists opened_at timestamptz;
