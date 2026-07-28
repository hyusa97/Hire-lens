create table public.application_evidence_matches (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null unique
    references public.applications(id)
    on delete cascade,

  total_requirements integer not null default 0
    check (total_requirements >= 0),

  evaluated_requirements integer not null default 0
    check (evaluated_requirements >= 0),

  verified_matches integer not null default 0
    check (verified_matches >= 0),

  supported_matches integer not null default 0
    check (supported_matches >= 0),

  claimed_matches integer not null default 0
    check (claimed_matches >= 0),

  missing_requirements integer not null default 0
    check (missing_requirements >= 0),

  unmapped_requirements integer not null default 0
    check (unmapped_requirements >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table public.application_skill_alignments (
  id uuid primary key default gen_random_uuid(),

  application_match_id uuid not null
    references public.application_evidence_matches(id)
    on delete cascade,

  required_skill text not null,
  canonical_skill text,
  display_name text not null,

  alignment_status text not null
    check (
      alignment_status in (
        'verified_match',
        'supported_match',
        'claimed_match',
        'missing',
        'unmapped_requirement'
      )
    ),

  claimed_in_application boolean not null default false,
  observed_in_resume boolean not null default false,
  observed_in_github boolean not null default false,

  evidence_strength text
    check (
      evidence_strength is null
      or evidence_strength in (
        'weak',
        'moderate',
        'strong'
      )
    ),

  verification_status text
    check (
      verification_status is null
      or verification_status in (
        'unverified',
        'partially_supported',
        'supported'
      )
    ),

  evidence_count integer not null default 0
    check (evidence_count >= 0),

  source_count integer not null default 0
    check (source_count >= 0),

  created_at timestamptz not null default now()
);



create index application_skill_alignments_match_idx
  on public.application_skill_alignments(application_match_id);


create index application_skill_alignments_status_idx
  on public.application_skill_alignments(alignment_status);