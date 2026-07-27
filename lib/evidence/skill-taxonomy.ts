export type SkillDefinition = {
  canonical: string;
  displayName: string;
  aliases: string[];
};

export type NormalizedSkill = {
  canonical: string;
  displayName: string;
};

export const SKILL_TAXONOMY: SkillDefinition[] = [
  {
    canonical: "python",
    displayName: "Python",
    aliases: ["python", "python3"],
  },
  {
    canonical: "javascript",
    displayName: "JavaScript",
    aliases: ["javascript", "js"],
  },
  {
    canonical: "typescript",
    displayName: "TypeScript",
    aliases: ["typescript", "ts"],
  },
  {
    canonical: "react",
    displayName: "React",
    aliases: ["react", "react.js", "reactjs", "react js"],
  },
  {
    canonical: "next.js",
    displayName: "Next.js",
    aliases: ["next.js", "nextjs", "next js"],
  },
  {
    canonical: "node.js",
    displayName: "Node.js",
    aliases: ["node.js", "nodejs", "node js"],
  },
  {
    canonical: "postgresql",
    displayName: "PostgreSQL",
    aliases: ["postgresql", "postgres", "psql"],
  },
  {
    canonical: "supabase",
    displayName: "Supabase",
    aliases: ["supabase"],
  },
  {
    canonical: "docker",
    displayName: "Docker",
    aliases: ["docker"],
  },
  {
    canonical: "fastapi",
    displayName: "FastAPI",
    aliases: ["fastapi", "fast api"],
  },
  {
    canonical: "streamlit",
    displayName: "Streamlit",
    aliases: ["streamlit"],
  },
  {
    canonical: "pandas",
    displayName: "pandas",
    aliases: ["pandas"],
  },
  {
    canonical: "numpy",
    displayName: "NumPy",
    aliases: ["numpy", "numpy"],
  },
  {
    canonical: "scikit-learn",
    displayName: "Scikit-learn",
    aliases: [
      "scikit-learn",
      "scikit learn",
      "sklearn",
      "scikit_learn",
    ],
  },
  {
    canonical: "tensorflow",
    displayName: "TensorFlow",
    aliases: ["tensorflow", "tensor flow"],
  },
  {
    canonical: "pytorch",
    displayName: "PyTorch",
    aliases: ["pytorch", "py torch"],
  },
  {
    canonical: "sql",
    displayName: "SQL",
    aliases: ["sql"],
  },
  {
    canonical: "mongodb",
    displayName: "MongoDB",
    aliases: ["mongodb", "mongo db"],
  },
  {
    canonical: "machine-learning",
    displayName: "Machine Learning",
    aliases: ["machine learning", "machine-learning", "ml"],
  },
  {
    canonical: "deep-learning",
    displayName: "Deep Learning",
    aliases: ["deep learning", "deep-learning", "dl"],
  },
];

function normalizeAlias(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const aliasMap = new Map<string, SkillDefinition>();

for (const skill of SKILL_TAXONOMY) {
  for (const alias of skill.aliases) {
    aliasMap.set(normalizeAlias(alias), skill);
  }

  aliasMap.set(normalizeAlias(skill.canonical), skill);
  aliasMap.set(normalizeAlias(skill.displayName), skill);
}

export function normalizeSkill(value: string): NormalizedSkill | null {
  const normalized = normalizeAlias(value);

  if (!normalized) {
    return null;
  }

  const skill = aliasMap.get(normalized);

  if (!skill) {
    return null;
  }

  return {
    canonical: skill.canonical,
    displayName: skill.displayName,
  };
}