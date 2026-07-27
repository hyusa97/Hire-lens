import assert from "node:assert/strict";
import { evaluationSchema, resumeIntelligenceSchema } from "../lib/ai/schema";
import { parseApplicationValues } from "../lib/validation/applications";
import { createJobSchema } from "../lib/validation/jobs";
import { extractGitHubUsername } from "../lib/github/username";
import { selectRelevantRepositories } from "../lib/github/repositories";
import type { GitHubRepository } from "../lib/github/profile";



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
];

for (const [name, run] of tests) {
  run();
  console.log(`ok - ${name}`);
}

console.log(`${tests.length} tests passed`);


