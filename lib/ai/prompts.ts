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

export function buildResumeTextExtractionPrompt() {
  return [
    "Extract plain text from the provided resume PDF.",
    "Return only text content from the document in reading order.",
    "Do not summarize, classify, score, or evaluate the candidate.",
    "Do not add any information that is not present in the resume.",
  ].join("\n");
}

export function buildResumeIntelligencePrompt(normalizedResumeText: string) {
  return [
    "You are an evidence extraction assistant for resumes.",
    "Extract only information explicitly supported by the supplied resume text.",
    "Do not infer likely skills, companies, dates, technologies, certifications, or job history.",
    "Do not produce quality scores, personality judgments, hiring recommendations, proficiency levels, or inferred years per skill.",
    "If information is missing, return null for nullable fields or empty arrays where required.",
    "Evidence arrays must contain short verbatim snippets grounded in the resume text.",
    "Return ONLY valid JSON with this exact shape:",
    "{",
    '  "professionalSummary": string,',
    '  "skills": [{ "name": string, "evidence": string[] }],',
    '  "experience": [{ "company": string, "role": string, "startDate": string | null, "endDate": string | null, "description": string, "skills": string[] }],',
    '  "projects": [{ "name": string, "description": string, "technologies": string[], "evidence": string[] }],',
    '  "education": [{ "institution": string, "degree": string, "field": string | null, "startDate": string | null, "endDate": string | null }],',
    '  "certifications": [{ "name": string, "issuer": string | null }]',
    "}",
    "Do not include additional fields.",
    "",
    "Resume text:",
    normalizedResumeText,
  ].join("\n");
}
