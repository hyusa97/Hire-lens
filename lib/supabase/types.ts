export type Job = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  description: string | null;
  requirements: string | null;
  required_skills: string[] | null;
  experience_level: string | null;
  status: "active" | "closed" | "draft";
  created_at: string;
  updated_at: string;
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  skills: string[];
  experience_years: number;
  profile_summary: string;
  github_url: string | null;
  portfolio_url: string | null;
  created_at: string;
};

export type EvidenceSource = {
  id: string;
  candidate_id: string;
  source_type: "resume" | "github" | "portfolio" | "certification";
  source_url: string | null;
  storage_path: string | null;
  original_filename: string | null;
  mime_type: string | null;
  status: "uploaded" | "processing" | "processed" | "failed";
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  job_id: string;
  candidate_id: string;
  match_score: number | null;
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  concerns: string[];
  ai_summary: string | null;
  recommendation: string | null;
  status: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: Job;
        Insert: Partial<Job>;
        Update: Partial<Job>;
        Relationships: [];
      };
      candidates: {
        Row: Candidate;
        Insert: Partial<Omit<Candidate, "created_at">>;
        Update: Partial<Omit<Candidate, "created_at">>;
        Relationships: [];
      };
      applications: {
        Row: Application;
        Insert: Partial<Omit<Application, "id" | "created_at">>;
        Update: Partial<Omit<Application, "id" | "created_at">>;
        Relationships: [];
      };
      evidence_sources: {
        Row: EvidenceSource;
        Insert: Partial<Omit<EvidenceSource, "id" | "created_at" | "updated_at">> & {
          candidate_id: string;
          source_type: EvidenceSource["source_type"];
        };
        Update: Partial<Omit<EvidenceSource, "id" | "candidate_id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
