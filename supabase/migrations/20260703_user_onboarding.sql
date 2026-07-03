-- ============================================================
-- user_onboarding — first-run onboarding state, one row per auth user.
-- Ported from the ONBOARDING_PLAYBOOK (ja-stock-platform reference).
--
-- Dual-DB note: auth users live in the Core hub (jexp) while this table lives in
-- the RENTAL DB (mmwud) next to tenant_entitlements — so there is NO FK to
-- auth.users (different project). user_id/tenant_id follow the same-id convention
-- across projects. All access goes through createRentalServiceClient(); RLS is
-- enabled with NO policies (deny-all for anon/authenticated) because browser
-- sessions are jexp-issued and never authenticate against this project anyway.
-- ============================================================

create table if not exists public.user_onboarding (
  user_id                uuid primary key,
  tenant_id              uuid not null,
  completed_steps        jsonb not null default '[]'::jsonb,
  seen_coachmarks        jsonb not null default '[]'::jsonb,
  welcome_dismissed_at   timestamptz,
  tour_completed_at      timestamptz,
  checklist_dismissed_at timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists idx_user_onboarding_tenant on public.user_onboarding (tenant_id);

alter table public.user_onboarding enable row level security;
