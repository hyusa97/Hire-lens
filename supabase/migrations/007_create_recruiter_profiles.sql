-- =====================================================
-- Recruiter Profiles
-- =====================================================

create table recruiter_profiles (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null unique
        references auth.users(id)
        on delete cascade,

    slug text not null unique,

    display_name text not null,

    headline text,

    about text,

    avatar_url text,

    hiring_type text not null
        check (
            hiring_type in (
                'company',
                'startup',
                'agency',
                'freelancer',
                'government',
                'university',
                'consultancy',
                'ngo'
            )
        ),

    company_name text,

    company_website text,

    company_linkedin text,

    recruiter_linkedin text,

    professional_email text,

    location text,

    show_email boolean not null default false,

    show_linkedin boolean not null default true,

    allow_direct_contact boolean not null default false,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

-- =====================================================
-- Indexes
-- =====================================================

create index recruiter_profiles_user_id_idx
    on recruiter_profiles (user_id);

create index recruiter_profiles_slug_idx
    on recruiter_profiles (slug);

-- =====================================================
-- Trigger
-- =====================================================

create trigger recruiter_profiles_set_updated_at
before update on recruiter_profiles
for each row
execute function update_updated_at_column();