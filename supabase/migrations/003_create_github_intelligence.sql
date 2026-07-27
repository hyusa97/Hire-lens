create table public.github_intelligence (
  id uuid primary key default gen_random_uuid(),

  evidence_source_id uuid not null unique
    references public.evidence_sources(id)
    on delete cascade,

  username text not null,
  profile_name text,
  profile_bio text,
  profile_url text not null,

  public_repo_count integer not null default 0,
  repositories_analyzed integer not null default 0,

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

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table public.github_repository_evidence (
  id uuid primary key default gen_random_uuid(),

  github_intelligence_id uuid not null
    references public.github_intelligence(id)
    on delete cascade,

  repository_name text not null,
  repository_url text not null,
  description text,

  languages jsonb not null default '{}'::jsonb,
  topics text[] not null default '{}',

  npm_dependencies text[] not null default '{}',
  python_dependencies text[] not null default '{}',

  readme_excerpt text,

  has_package_json boolean not null default false,
  has_requirements_txt boolean not null default false,
  has_pyproject_toml boolean not null default false,
  has_dockerfile boolean not null default false,
  has_docker_compose boolean not null default false,

  evidence_score integer not null default 0,

  pushed_at timestamptz,

  created_at timestamptz not null default now(),

  unique (github_intelligence_id, repository_name)
);


create index github_repository_evidence_intelligence_idx
  on public.github_repository_evidence(github_intelligence_id);