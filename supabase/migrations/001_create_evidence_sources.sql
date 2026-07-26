-- HireLens Evidence Intelligence
-- Migration 001: Candidate evidence sources

create table if not exists public.evidence_sources (
  id uuid primary key default gen_random_uuid(),

  candidate_id uuid not null
    references public.candidates(id)
    on delete cascade,

  source_type text not null
    check (
      source_type in (
        'resume',
        'github',
        'portfolio',
        'certification'
      )
    ),

  source_url text,

  storage_path text,

  original_filename text,

  mime_type text,

  status text not null default 'uploaded'
    check (
      status in (
        'uploaded',
        'processing',
        'processed',
        'failed'
      )
    ),

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists evidence_sources_candidate_id_idx
  on public.evidence_sources(candidate_id);

create index if not exists evidence_sources_source_type_idx
  on public.evidence_sources(source_type);