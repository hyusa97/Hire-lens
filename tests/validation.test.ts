import assert from "node:assert/strict";
import { evaluationSchema, resumeIntelligenceSchema } from "../lib/ai/schema";
import { parseApplicationValues } from "../lib/validation/applications";
import { createJobSchema } from "../lib/validation/jobs";
import { extractGitHubUsername } from "../lib/github/username";
import { selectRelevantRepositories } from "../lib/github/repositories";
import type { GitHubRepository } from "../lib/github/profile";
import { normalizeSkill } from "../lib/evidence/skill-taxonomy";
import { collectApplicationSkillEvidence } from "../lib/evidence/collect-application-skills";
import { collectResumeSkillEvidence } from "../lib/evidence/collect-resume-skills";
import { collectGitHubSkillEvidence } from "../lib/evidence/collect-github-skills";
import { aggregateSkillEvidence } from "../lib/evidence/aggregate-skill-evidence";
import { parseJsonResponse } from "../lib/ai/parse-json-response";
import { matchJobSkills } from "../lib/matching/match-job-skills";
import type { CandidateSkillEvidence } from "../lib/supabase/types";
import { summarizeJobMatch } from "../lib/matching/summarize-job-match";




const validApplication = {
  name: "Alex Morgan",
  email: "alex@example.com",
  phone: "+1 555 0100",
  experienceYears: "5",
  skills: "React, TypeScript, Product Design",
  profileSummary: "I build accessible product experiences across SaaS teams.",
  githubUrl: "https://github.com/alex",
  portfolioUrl: "https://alex.example.com",
};

const validJob = {
  title: "Senior Product Engineer",
  department: "Engineering",
  location: "Remote",
  employmentType: "full-time",
  experienceLevel: "senior",
  requiredSkills: "React, TypeScript, PostgreSQL",
  description: "Build polished recruiting workflows with a thoughtful product team.",
  requirements: "Strong frontend skills, product judgment, and reliable delivery habits.",
  status: "active" as const,
};

const validEvaluation = {
  matchScore: 87,
  matchedSkills: ["React", "TypeScript"],
  missingSkills: ["Supabase"],
  strengths: ["Strong product engineering background"],
  concerns: ["Limited database detail"],
  summary: "Strong candidate with relevant frontend and product experience.",
  recommendation: "GOOD_MATCH",
};

const validResumeIntelligence = {
  professionalSummary:
    "Software engineer focused on full-stack web applications and platform reliability.",
  skills: [
    {
      name: "TypeScript",
      evidence: ["Built production features using TypeScript in frontend and backend services."],
    },
  ],
  experience: [
    {
      company: "Acme Corp",
      role: "Software Engineer",
      startDate: "2021-06",
      endDate: null,
      description: "Developed internal hiring workflow tools and APIs.",
      skills: ["TypeScript", "PostgreSQL"],
    },
  ],
  projects: [
    {
      name: "Hiring Insights Dashboard",
      description: "Created a dashboard for recruiter analytics and application triage.",
      technologies: ["React", "TypeScript", "Supabase"],
      evidence: ["Implemented recruiter dashboard with React and Supabase."],
    },
  ],
  education: [
    {
      institution: "State University",
      degree: "B.Sc.",
      field: "Computer Science",
      startDate: "2017",
      endDate: "2021",
    },
  ],
  certifications: [
    {
      name: "AWS Certified Developer - Associate",
      issuer: "Amazon Web Services",
    },
  ],
};

const githubRepositoryFixture: GitHubRepository = {
  id: 1,
  name: "hirelens",
  full_name: "octocat/hirelens",
  html_url: "https://github.com/octocat/hirelens",
  description: "Evidence-based hiring intelligence platform",
  fork: false,
  archived: false,
  language: "TypeScript",
  stargazers_count: 0,
  forks_count: 0,
  topics: ["nextjs", "supabase"],
  updated_at: new Date().toISOString(),
  pushed_at: new Date().toISOString(),
};

const resumeEvidenceFixture = {
  id: "resume-intelligence-1",
  evidence_source_id: "resume-source-1",
  professional_summary: null,

  skills: [
    {
      name: "Python",
      evidence: ["Listed in technical skills"],
    },
    {
      name: "React.js",
      evidence: [],
    },
  ],

  experience: [
    {
      company: "Example Labs",
      role: "Software Intern",
      startDate: null,
      endDate: null,
      description: "Worked on internal applications.",
      skills: ["Python", "Postgres"],
    },
  ],

  projects: [
    {
      name: "Analytics Platform",
      description: "Built an analytics application.",
      technologies: ["Python", "pandas", "ReactJS"],
      evidence: [],
    },
  ],

  education: [],
  certifications: [],

  extraction_status: "completed" as const,
  extraction_error: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const githubEvidenceSourceFixture = {
  id: "github-source-1",
  candidate_id: "candidate-1",
  source_type: "github" as const,
  source_url: "https://github.com/example",
  storage_path: null,
  original_filename: null,
  mime_type: null,
  status: "processed" as const,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const githubRepositoryEvidenceFixture = {
  id: "repo-evidence-1",
  github_intelligence_id: "github-intelligence-1",

  repository_name: "example-project",
  repository_url: "https://github.com/example/example-project",
  description: null,

  languages: {
    TypeScript: 10000,
    JavaScript: 2000,
  },

  topics: ["react", "unknown-topic"],

  npm_dependencies: [
    "next",
    "react",
    "@supabase/supabase-js",
  ],

  python_dependencies: [],

  readme_excerpt: null,

  has_package_json: true,
  has_requirements_txt: false,
  has_pyproject_toml: false,
  has_dockerfile: false,
  has_docker_compose: false,

  evidence_score: 10,
  pushed_at: null,
  created_at: "2026-01-01T00:00:00.000Z",
};

const candidateSkillEvidenceFixture: CandidateSkillEvidence[] = [
  {
    id: "skill-python",
    candidate_id: "candidate-1",
    canonical_skill: "python",
    display_name: "Python",

    claimed_in_application: true,
    observed_in_resume: true,
    observed_in_github: true,

    evidence_strength: "strong",
    verification_status: "supported",

    evidence_count: 6,
    source_count: 3,

    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
  id: "skill-react",
  candidate_id: "candidate-1",
  canonical_skill: "react",
  display_name: "React",

  claimed_in_application: true,
  observed_in_resume: false,
  observed_in_github: true,

  evidence_strength: "strong",
  verification_status: "partially_supported",

  evidence_count: 6,
  source_count: 2,

  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
},
{
  id: "skill-docker",
  candidate_id: "candidate-1",
  canonical_skill: "docker",
  display_name: "Docker",

  claimed_in_application: true,
  observed_in_resume: false,
  observed_in_github: false,

  evidence_strength: "weak",
  verification_status: "unverified",

  evidence_count: 1,
  source_count: 1,

  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
},
];


const tests: Array<[string, () => void]> = [
  ["accepts a valid candidate application", () => {
    const result = parseApplicationValues(validApplication);

    assert.equal(result.success, true);
    if (result.success) {
      assert.deepEqual(result.data.skills, ["React", "TypeScript", "Product Design"]);
      assert.equal(result.data.email, "alex@example.com");
    }
  }],
  ["rejects an invalid candidate email", () => {
    const result = parseApplicationValues({ ...validApplication, email: "not-an-email" });

    assert.equal(result.success, false);
  }],
  ["rejects negative candidate experience", () => {
    const result = parseApplicationValues({ ...validApplication, experienceYears: "-1" });

    assert.equal(result.success, false);
  }],
  ["rejects empty candidate skills", () => {
    const result = parseApplicationValues({ ...validApplication, skills: " , " });

    assert.equal(result.success, false);
  }],
  ["rejects invalid optional URLs", () => {
    const result = parseApplicationValues({ ...validApplication, githubUrl: "github.com/alex" });

    assert.equal(result.success, false);
  }],
  ["accepts a valid recruiter job", () => {
    const result = createJobSchema.safeParse(validJob);

    assert.equal(result.success, true);
  }],
  ["rejects an invalid recruiter job", () => {
    const result = createJobSchema.safeParse({ ...validJob, title: "", requiredSkills: "" });

    assert.equal(result.success, false);
  }],
  ["enforces AI matchScore boundaries", () => {
    assert.equal(evaluationSchema.safeParse({ ...validEvaluation, matchScore: 0 }).success, true);
    assert.equal(evaluationSchema.safeParse({ ...validEvaluation, matchScore: 100 }).success, true);
    assert.equal(evaluationSchema.safeParse({ ...validEvaluation, matchScore: -1 }).success, false);
    assert.equal(evaluationSchema.safeParse({ ...validEvaluation, matchScore: 101 }).success, false);
  }],
  ["rejects invalid AI recommendations", () => {
    const result = evaluationSchema.safeParse({ ...validEvaluation, recommendation: "HIRE_NOW" });

    assert.equal(result.success, false);
  }],
  ["accepts a valid AI evaluation schema", () => {
    const result = evaluationSchema.safeParse(validEvaluation);

    assert.equal(result.success, true);
  }],
  ["accepts a valid resume intelligence schema", () => {
    const result = resumeIntelligenceSchema.safeParse(validResumeIntelligence);

    assert.equal(result.success, true);
  }],

  ["accepts null professionalSummary", () => {
    const result = resumeIntelligenceSchema.safeParse({
      ...validResumeIntelligence,
      professionalSummary: null,
    });

    assert.equal(result.success, true);

    if (result.success) {
      assert.equal(result.data.professionalSummary, null);
    }
  }],

  ["normalizes empty professionalSummary to null", () => {
    const result = resumeIntelligenceSchema.safeParse({
      ...validResumeIntelligence,
      professionalSummary: "",
    });

    assert.equal(result.success, true);

    if (result.success) {
      assert.equal(result.data.professionalSummary, null);
    }
  }],

    ["rejects invalid resume intelligence shape", () => {
    const result = resumeIntelligenceSchema.safeParse({
      ...validResumeIntelligence,
      skills: [{ name: "", evidence: ["TypeScript"] }],
    });

    assert.equal(result.success, false);
  }],

  ["extracts a username from a GitHub profile URL", () => {
    assert.equal(
      extractGitHubUsername("https://github.com/octocat"),
      "octocat",
    );
  }],

  ["accepts www GitHub URLs", () => {
    assert.equal(
      extractGitHubUsername("https://www.github.com/octocat"),
      "octocat",
    );
  }],

  ["rejects GitHub repository URLs", () => {
    assert.equal(
      extractGitHubUsername("https://github.com/octocat/Hello-World"),
      null,
    );
  }],

  ["rejects non-GitHub URLs", () => {
    assert.equal(
      extractGitHubUsername("https://example.com/octocat"),
      null,
    );
  }],

  ["rejects invalid GitHub input", () => {
    assert.equal(
      extractGitHubUsername("not-a-url"),
      null,
    );
  }],

  ["filters forks and archived GitHub repositories", () => {
  const repositories: GitHubRepository[] = [
    githubRepositoryFixture,
    {
      ...githubRepositoryFixture,
      id: 2,
      name: "forked-project",
      fork: true,
    },
    {
      ...githubRepositoryFixture,
      id: 3,
      name: "archived-project",
      archived: true,
    },
  ];

  const result = selectRelevantRepositories(repositories);

  assert.equal(result.length, 1);
  assert.equal(result[0].name, "hirelens");
}],

["limits selected GitHub repositories", () => {
  const repositories: GitHubRepository[] = Array.from(
    { length: 12 },
    (_, index) => ({
      ...githubRepositoryFixture,
      id: index + 1,
      name: `project-${index + 1}`,
    }),
  );

  const result = selectRelevantRepositories(repositories, 5);

  assert.equal(result.length, 5);
}],

["ranks repositories with stronger technical context higher", () => {
  const repositories: GitHubRepository[] = [
    {
      ...githubRepositoryFixture,
      id: 1,
      name: "empty-project",
      description: null,
      language: null,
      topics: [],
      pushed_at: null,
    },
    {
      ...githubRepositoryFixture,
      id: 2,
      name: "technical-project",
    },
  ];

  const result = selectRelevantRepositories(repositories);

  assert.equal(result[0].name, "technical-project");
}],

[
  "normalizes React aliases to one canonical skill",
  () => {
    assert.deepEqual(normalizeSkill("React.js"), {
      canonical: "react",
      displayName: "React",
    });

    assert.deepEqual(normalizeSkill("reactjs"), {
      canonical: "react",
      displayName: "React",
    });
  },
],

[
  "normalizes PostgreSQL aliases",
  () => {
    assert.deepEqual(normalizeSkill("Postgres"), {
      canonical: "postgresql",
      displayName: "PostgreSQL",
    });
  },
],

[
  "normalizes scikit-learn aliases",
  () => {
    assert.deepEqual(normalizeSkill("sklearn"), {
      canonical: "scikit-learn",
      displayName: "Scikit-learn",
    });
  },
],

[
  "normalizes skills case-insensitively",
  () => {
    assert.deepEqual(normalizeSkill("  PYTHON  "), {
      canonical: "python",
      displayName: "Python",
    });
  },
],

[
  "does not confuse JavaScript with Java",
  () => {
    assert.equal(normalizeSkill("Java"), null);

    assert.deepEqual(normalizeSkill("JavaScript"), {
      canonical: "javascript",
      displayName: "JavaScript",
    });
  },
],

[
  "does not infer related technologies",
  () => {
    assert.deepEqual(normalizeSkill("Next.js"), {
      canonical: "next.js",
      displayName: "Next.js",
    });

    assert.notDeepEqual(
      normalizeSkill("Next.js"),
      normalizeSkill("React"),
    );
  },
],

[
  "returns null for unknown skills",
  () => {
    assert.equal(
      normalizeSkill("Some Totally Unknown Framework"),
      null,
    );
  },
],

[
  "returns null for empty input",
  () => {
    assert.equal(normalizeSkill("   "), null);
  },
],
[
  "collects normalized application skill evidence",
  () => {
    const result = collectApplicationSkillEvidence([
      "Python",
      "React.js",
      "Postgres",
    ]);

    assert.deepEqual(
      result.map((item) => item.canonicalSkill),
      ["python", "react", "postgresql"],
    );

    assert.equal(result[0]?.origin, "application");
    assert.equal(result[0]?.evidenceType, "application_claim");
    assert.equal(result[0]?.evidenceQuality, "claimed");
    assert.equal(result[0]?.evidenceSourceId, null);
    assert.equal(result[0]?.repositoryEvidenceId, null);
  },
],

[
  "deduplicates equivalent application skill aliases",
  () => {
    const result = collectApplicationSkillEvidence([
      "React",
      "React.js",
      "reactjs",
    ]);

    assert.equal(result.length, 1);
    assert.equal(result[0]?.canonicalSkill, "react");
  },
],

[
  "ignores unknown application skills",
  () => {
    const result = collectApplicationSkillEvidence([
      "Python",
      "Unknown Framework 9000",
    ]);

    assert.equal(result.length, 1);
    assert.equal(result[0]?.canonicalSkill, "python");
  },
],

[
  "returns no evidence for only unknown skills",
  () => {
    const result = collectApplicationSkillEvidence([
      "Unknown Framework",
      "Another Mystery Technology",
    ]);

    assert.deepEqual(result, []);
  },
],

[
  "collects explicit resume skill evidence",
  () => {
    const result = collectResumeSkillEvidence(resumeEvidenceFixture);

    const pythonSkill = result.find(
      (item) =>
        item.canonicalSkill === "python" &&
        item.evidenceType === "resume_skill",
    );

    assert.ok(pythonSkill);
    assert.equal(pythonSkill.evidenceQuality, "claimed");
    assert.equal(pythonSkill.origin, "resume");
    assert.equal(
      pythonSkill.evidenceSourceId,
      "resume-source-1",
    );
  },
],

[
  "collects contextual resume project evidence",
  () => {
    const result = collectResumeSkillEvidence(resumeEvidenceFixture);

    const pandasProject = result.find(
      (item) =>
        item.canonicalSkill === "pandas" &&
        item.evidenceType === "resume_project",
    );

    assert.ok(pandasProject);
    assert.equal(pandasProject.evidenceQuality, "contextual");
    assert.equal(
      pandasProject.sourceReference,
      "Analytics Platform",
    );
  },
],

[
  "collects contextual resume experience evidence",
  () => {
    const result = collectResumeSkillEvidence(resumeEvidenceFixture);

    const postgresExperience = result.find(
      (item) =>
        item.canonicalSkill === "postgresql" &&
        item.evidenceType === "resume_experience",
    );

    assert.ok(postgresExperience);
    assert.equal(
      postgresExperience.sourceReference,
      "Example Labs — Software Intern",
    );
  },
],

[
  "keeps independent resume contexts for the same skill",
  () => {
    const result = collectResumeSkillEvidence(resumeEvidenceFixture);

    const pythonEvidence = result.filter(
      (item) => item.canonicalSkill === "python",
    );

    assert.equal(pythonEvidence.length, 3);

    assert.deepEqual(
      new Set(pythonEvidence.map((item) => item.evidenceType)),
      new Set([
        "resume_skill",
        "resume_experience",
        "resume_project",
      ]),
    );
  },
],

[
  "collects GitHub language artifact evidence",
  () => {
    const result = collectGitHubSkillEvidence(
      githubEvidenceSourceFixture,
      [githubRepositoryEvidenceFixture],
    );

    const typescript = result.find(
      (item) =>
        item.canonicalSkill === "typescript" &&
        item.evidenceType === "github_language",
    );

    assert.ok(typescript);
    assert.equal(typescript.evidenceQuality, "artifact");
    assert.equal(typescript.origin, "github");
    assert.equal(
      typescript.repositoryEvidenceId,
      "repo-evidence-1",
    );
  },
],

[
  "maps known GitHub dependencies to canonical skills",
  () => {
    const result = collectGitHubSkillEvidence(
      githubEvidenceSourceFixture,
      [githubRepositoryEvidenceFixture],
    );

    const skills = new Set(
      result
        .filter(
          (item) => item.evidenceType === "github_dependency",
        )
        .map((item) => item.canonicalSkill),
    );

    assert.ok(skills.has("next.js"));
    assert.ok(skills.has("react"));
    assert.ok(skills.has("supabase"));
  },
],

[
  "treats GitHub topics as contextual evidence",
  () => {
    const result = collectGitHubSkillEvidence(
      githubEvidenceSourceFixture,
      [githubRepositoryEvidenceFixture],
    );

    const reactTopic = result.find(
      (item) =>
        item.canonicalSkill === "react" &&
        item.evidenceType === "github_topic",
    );

    assert.ok(reactTopic);
    assert.equal(
      reactTopic.evidenceQuality,
      "contextual",
    );
  },
],

[
  "does not infer parent skills from GitHub dependencies",
  () => {
    const pythonRepository = {
      ...githubRepositoryEvidenceFixture,
      id: "repo-evidence-python",
      languages: {},
      topics: [],
      npm_dependencies: [],
      python_dependencies: ["pandas"],
    };

    const result = collectGitHubSkillEvidence(
      githubEvidenceSourceFixture,
      [pythonRepository],
    );

    assert.ok(
      result.some(
        (item) => item.canonicalSkill === "pandas",
      ),
    );

    assert.equal(
      result.some(
        (item) => item.canonicalSkill === "python",
      ),
      false,
    );

    assert.equal(
      result.some(
        (item) =>
          item.canonicalSkill === "machine-learning",
      ),
      false,
    );
  },
],

[
  "deduplicates the same GitHub skill evidence within one repository",
  () => {
    const repository = {
      ...githubRepositoryEvidenceFixture,
      topics: ["react", "reactjs"],
    };

    const result = collectGitHubSkillEvidence(
      githubEvidenceSourceFixture,
      [repository],
    );

    const reactTopics = result.filter(
      (item) =>
        item.canonicalSkill === "react" &&
        item.evidenceType === "github_topic",
    );

    assert.equal(reactTopics.length, 1);
  },
],

[
  "marks application-only skill claims as weak and unverified",
  () => {
    const applicationEvidence =
      collectApplicationSkillEvidence(["Python"]);

    const result = aggregateSkillEvidence(applicationEvidence);

    assert.equal(result.length, 1);
    assert.equal(result[0]?.canonicalSkill, "python");
    assert.equal(result[0]?.claimedInApplication, true);
    assert.equal(result[0]?.evidenceStrength, "weak");
    assert.equal(result[0]?.verificationStatus, "unverified");
  },
],

[
  "partially supports a claim corroborated by resume evidence",
  () => {
    const applicationEvidence =
      collectApplicationSkillEvidence(["Python"]);

    const resumeEvidence =
      collectResumeSkillEvidence(resumeEvidenceFixture).filter(
        (item) => item.canonicalSkill === "python",
      );

    const result = aggregateSkillEvidence([
      ...applicationEvidence,
      ...resumeEvidence,
    ]);

    assert.equal(result[0]?.verificationStatus, "partially_supported");
    assert.equal(result[0]?.observedInResume, true);
  },
],

[
  "strongly supports a skill observed across resume and GitHub",
  () => {
    const applicationEvidence =
      collectApplicationSkillEvidence(["React"]);

    const resumeEvidence =
      collectResumeSkillEvidence(resumeEvidenceFixture).filter(
        (item) => item.canonicalSkill === "react",
      );

    const githubEvidence =
      collectGitHubSkillEvidence(
        githubEvidenceSourceFixture,
        [githubRepositoryEvidenceFixture],
      ).filter(
        (item) => item.canonicalSkill === "react",
      );

    const result = aggregateSkillEvidence([
      ...applicationEvidence,
      ...resumeEvidence,
      ...githubEvidence,
    ]);

    assert.equal(result[0]?.verificationStatus, "supported");
    assert.equal(result[0]?.evidenceStrength, "strong");
    assert.equal(result[0]?.sourceCount, 3);
  },
],

[
  "creates observed skills even when candidate did not claim them",
  () => {
    const githubEvidence =
      collectGitHubSkillEvidence(
        githubEvidenceSourceFixture,
        [githubRepositoryEvidenceFixture],
      ).filter(
        (item) => item.canonicalSkill === "supabase",
      );

    const result = aggregateSkillEvidence(githubEvidence);

    assert.equal(result[0]?.claimedInApplication, false);
    assert.equal(result[0]?.observedInGitHub, true);
    assert.equal(
      result[0]?.verificationStatus,
      "partially_supported",
    );
  },
],

[
  "gives strong evidence to artifacts across multiple repositories",
  () => {
    const repositoryTwo = {
      ...githubRepositoryEvidenceFixture,
      id: "repo-evidence-2",
      repository_name: "second-project",
      npm_dependencies: ["react"],
      topics: [],
      languages: {},
    };

    const githubEvidence =
      collectGitHubSkillEvidence(
        githubEvidenceSourceFixture,
        [
          githubRepositoryEvidenceFixture,
          repositoryTwo,
        ],
      ).filter(
        (item) =>
          item.canonicalSkill === "react" &&
          item.evidenceType === "github_dependency",
      );

    const result = aggregateSkillEvidence(githubEvidence);

    assert.equal(result[0]?.evidenceStrength, "strong");
    assert.equal(
      result[0]?.verificationStatus,
      "partially_supported",
    );
  },
],

[
  "parses valid AI JSON responses",
  () => {
    const result = parseJsonResponse(
      '{"matchScore":75,"recommendation":"GOOD_MATCH"}',
    );

    assert.deepEqual(result, {
      matchScore: 75,
      recommendation: "GOOD_MATCH",
    });
  },
],

[
  "parses JSON wrapped in markdown fences",
  () => {
    const result = parseJsonResponse(
      '```json\n{"matchScore":75}\n```',
    );

    assert.deepEqual(result, {
      matchScore: 75,
    });
  },
],

[
  "rejects malformed AI JSON",
  () => {
    assert.throws(
      () =>
        parseJsonResponse(
          '{"matchScore": -}',
        ),
      /AI returned malformed JSON/,
    );
  },
],

[
  "rejects empty AI responses",
  () => {
    assert.throws(
      () => parseJsonResponse("   "),
      /AI response was empty/,
    );
  },
],

[
  "classifies strongly verified job skills as verified matches",
  () => {
    const result = matchJobSkills(
      ["Python"],
      candidateSkillEvidenceFixture,
    );

    assert.equal(result.length, 1);
    assert.equal(result[0]?.requiredSkill, "Python");
    assert.equal(result[0]?.canonicalSkill, "python");
    assert.equal(result[0]?.status, "verified_match");
    assert.equal(result[0]?.evidenceCount, 6);
    assert.equal(result[0]?.sourceCount, 3);
  },
],
[
  "classifies independently observed skills as supported matches",
  () => {
    const result = matchJobSkills(
      ["React"],
      candidateSkillEvidenceFixture,
    );

    assert.equal(result.length, 1);
    assert.equal(result[0]?.canonicalSkill, "react");
    assert.equal(result[0]?.status, "supported_match");
    assert.equal(result[0]?.claimedInApplication, true);
    assert.equal(result[0]?.observedInResume, false);
    assert.equal(result[0]?.observedInGitHub, true);
    assert.equal(
      result[0]?.verificationStatus,
      "partially_supported",
    );
  },
],
[
  "classifies application-only skills as claimed matches",
  () => {
    const result = matchJobSkills(
      ["Docker"],
      candidateSkillEvidenceFixture,
    );

    assert.equal(result.length, 1);
    assert.equal(result[0]?.canonicalSkill, "docker");
    assert.equal(result[0]?.status, "claimed_match");

    assert.equal(result[0]?.claimedInApplication, true);
    assert.equal(result[0]?.observedInResume, false);
    assert.equal(result[0]?.observedInGitHub, false);

    assert.equal(result[0]?.evidenceStrength, "weak");
    assert.equal(
      result[0]?.verificationStatus,
      "unverified",
    );
  },
],
[
  "classifies known skills without candidate evidence as missing",
  () => {
    const result = matchJobSkills(
      ["MongoDB"],
      candidateSkillEvidenceFixture,
    );

    assert.equal(result.length, 1);
    assert.equal(result[0]?.requiredSkill, "MongoDB");
    assert.equal(result[0]?.canonicalSkill, "mongodb");
    assert.equal(result[0]?.displayName, "MongoDB");

    assert.equal(result[0]?.status, "missing");

    assert.equal(result[0]?.claimedInApplication, false);
    assert.equal(result[0]?.observedInResume, false);
    assert.equal(result[0]?.observedInGitHub, false);

    assert.equal(result[0]?.evidenceStrength, null);
    assert.equal(result[0]?.verificationStatus, null);
    assert.equal(result[0]?.evidenceCount, 0);
    assert.equal(result[0]?.sourceCount, 0);
  },
],
[
  "does not treat unknown job requirements as missing skills",
  () => {
    const result = matchJobSkills(
      ["Some Completely Unknown Framework"],
      candidateSkillEvidenceFixture,
    );

    assert.equal(result.length, 1);

    assert.equal(
      result[0]?.requiredSkill,
      "Some Completely Unknown Framework",
    );

    assert.equal(result[0]?.canonicalSkill, null);
    assert.equal(
      result[0]?.displayName,
      "Some Completely Unknown Framework",
    );

    assert.equal(
      result[0]?.status,
      "unmapped_requirement",
    );

    assert.equal(result[0]?.evidenceStrength, null);
    assert.equal(result[0]?.verificationStatus, null);
    assert.equal(result[0]?.evidenceCount, 0);
    assert.equal(result[0]?.sourceCount, 0);
  },
],
[
  "matches job skill aliases against canonical candidate evidence",
  () => {
    const result = matchJobSkills(
      ["React.js"],
      candidateSkillEvidenceFixture,
    );

    assert.equal(result.length, 1);

    assert.equal(result[0]?.requiredSkill, "React.js");
    assert.equal(result[0]?.canonicalSkill, "react");
    assert.equal(result[0]?.displayName, "React");

    assert.equal(result[0]?.status, "supported_match");
    assert.equal(result[0]?.observedInGitHub, true);
  },
],
[
  "summarizes job skill alignment across all match states",
  () => {
    const alignments = matchJobSkills(
      [
        "Python",
        "React",
        "Docker",
        "MongoDB",
        "Some Completely Unknown Framework",
      ],
      candidateSkillEvidenceFixture,
    );

    const summary = summarizeJobMatch(alignments);

    assert.equal(summary.totalRequirements, 5);

    assert.equal(summary.verifiedMatches, 1);
    assert.equal(summary.supportedMatches, 1);
    assert.equal(summary.claimedMatches, 1);
    assert.equal(summary.missingRequirements, 1);
    assert.equal(summary.unmappedRequirements, 1);

    assert.equal(summary.evaluatedRequirements, 4);
  },
],

];

for (const [name, run] of tests) {
  run();
  console.log(`ok - ${name}`);
}

console.log(`${tests.length} tests passed`);


