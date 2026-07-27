create table public.candidate_skill_evidence (
  id uuid primary key default gen_random_uuid(),

  candidate_id uuid not null
    references public.candidates(id)
    on delete cascade,

  canonical_skill text not null,
  display_name text not null,

  claimed_in_application boolean not null default false,
  observed_in_resume boolean not null default false,
  observed_in_github boolean not null default false,

  evidence_strength text not null default 'weak'
    check (
      evidence_strength in (
        'weak',
        'moderate',
        'strong'
      )
    ),

  verification_status text not null default 'unverified'
    check (
      verification_status in (
        'unverified',
        'partially_supported',
        'supported'
      )
    ),

  evidence_count integer not null default 0
    check (evidence_count >= 0),

  source_count integer not null default 0
    check (source_count >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (candidate_id, canonical_skill)
);


create table public.skill_evidence_items (
  id uuid primary key default gen_random_uuid(),

  candidate_skill_evidence_id uuid not null
    references public.candidate_skill_evidence(id)
    on delete cascade,

  evidence_source_id uuid
    references public.evidence_sources(id)
    on delete cascade,

  repository_evidence_id uuid
    references public.github_repository_evidence(id)
    on delete cascade,

  evidence_type text not null
    check (
      evidence_type in (
        'application_claim',
        'resume_skill',
        'resume_project',
        'resume_experience',
        'github_language',
        'github_dependency',
        'github_topic',
        'github_readme'
      )
    ),

  evidence_quality text not null
    check (
      evidence_quality in (
        'claimed',
        'contextual',
        'artifact'
      )
    ),

  source_reference text,
  description text not null,

  created_at timestamptz not null default now()
);


create index candidate_skill_evidence_candidate_idx
  on public.candidate_skill_evidence(candidate_id);


create index skill_evidence_items_skill_idx
  on public.skill_evidence_items(candidate_skill_evidence_id);


create index skill_evidence_items_source_idx
  on public.skill_evidence_items(evidence_source_id);


create index skill_evidence_items_repository_idx
  on public.skill_evidence_items(repository_evidence_id);