export function buildEvaluationPrompt(job: {
  title: string;
  department: string | null;
  description: string | null;
  requirements: string | null;
  requiredSkills: string[] | null;
  experienceLevel: string | null;
}, candidate: {
  skills: string[];
  experienceYears: number;
  profileSummary: string;
}) {
  const jobSummary = [
    `Title: ${job.title}`,
    job.department ? `Department: ${job.department}` : null,
    job.description ? `Description: ${job.description}` : null,
    job.requirements ? `Requirements: ${job.requirements}` : null,
    job.requiredSkills && job.requiredSkills.length > 0
      ? `Required skills: ${job.requiredSkills.join(", ")}`
      : null,
    job.experienceLevel ? `Experience level: ${job.experienceLevel}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const candidateSummary = [
    `Skills: ${candidate.skills.join(", ") || "No skills provided"}`,
    `Experience years: ${candidate.experienceYears}`,
    `Profile summary: ${candidate.profileSummary}`,
  ].join("\n");

  return [
    "You are an evaluation assistant for job fit. Evaluate only the supplied professional evidence.",
    "Compare the candidate's provided skills, experience, and summary against the job requirements.",
    "Do not infer skills that are not present in the supplied profile.",
    "Do not consider or infer protected characteristics.",
    "Missing information is not proof of incompetence.",
    "Return ONLY valid JSON with these exact property names and types:",
    "{",
    '  "matchScore": number,',
    '  "matchedSkills": string[],',
    '  "missingSkills": string[],',
    '  "strengths": string[],',
    '  "concerns": string[],',
    '  "summary": string,',
    '  "recommendation": "STRONG_MATCH" | "GOOD_MATCH" | "REVIEW" | "WEAK_MATCH"',
    "}",
    "All seven fields are required.",
    "Do not include any other fields.",
    "",
    "Job details:",
    jobSummary,
    "",
    "Candidate profile:",
    candidateSummary,
  ].join("\n");
}
