create table if not exists public.resume_intelligence (
  id uuid primary key default gen_random_uuid(),

  evidence_source_id uuid not null unique
    references public.evidence_sources(id)
    on delete cascade,

  professional_summary text,

  skills jsonb not null default '[]'::jsonb,
  experience jsonb not null default '[]'::jsonb,
  projects jsonb not null default '[]'::jsonb,
  education jsonb not null default '[]'::jsonb,
  certifications jsonb not null default '[]'::jsonb,

  extraction_status text not null default 'pending'
    check (
      extraction_status in (
        'pending',
        'processing',
        'completed',
        'failed'
      )
    ),

  extraction_error text,

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists resume_intelligence_evidence_source_id_idx
  on public.resume_intelligence(evidence_source_id);