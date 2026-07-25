export type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  salary_min: number | null;
  salary_max: number | null;
  employment_type: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Candidate = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  headline: string | null;
  location: string | null;
  skills: string[] | null;
  experience_years: number | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  cover_letter: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: Job;
        Insert: Partial<Job>;
        Update: Partial<Job>;
      };
      candidates: {
        Row: Candidate;
        Insert: Partial<Candidate>;
        Update: Partial<Candidate>;
      };
      applications: {
        Row: Application;
        Insert: Partial<Application>;
        Update: Partial<Application>;
      };
    };
  };
};
