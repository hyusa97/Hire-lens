alter table public.jobs
add column recruiter_id uuid
references auth.users(id)
on delete restrict;

create index jobs_recruiter_id_idx
on public.jobs(recruiter_id);

update public.jobs
set recruiter_id = 'cdf70489-d1cd-4c02-a99b-bad8cbddf459'
where recruiter_id is null;

alter table public.jobs
alter column recruiter_id set not null;