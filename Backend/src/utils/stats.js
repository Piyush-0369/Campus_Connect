import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load configuration files
const xpRules = JSON.parse(
  readFileSync(join(__dirname, "../config/xpRules.json"), "utf-8")
);
const levelThresholds = JSON.parse(
  readFileSync(join(__dirname, "../config/levelThresholds.json"), "utf-8")
);

const day = 1000 * 60 * 60 * 24;
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const norm01 = (v, lo, hi) => (hi === lo ? 0 : (v - lo) / (hi - lo));
const wmean = (pairs) => {
  let num = 0,
  den = 0;
  for (const [v, w] of pairs) {
      num += v * w;
    den += w;
  }
  return den === 0 ? 0 : num / den;
};



// ------------------------------
// LLM Enrichment
// ------------------------------
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
function extractJSON(rawText) {
  if (!rawText) return null;

  // 1. Remove markdown code fences
  rawText = rawText.replace(/```json/g, "").replace(/```/g, "");

  // 2. Trim whitespace
  rawText = rawText.trim();

  // 3. Extract JSON inside text (handles extra text before/after)
  const first = rawText.indexOf("[");
  const last = rawText.lastIndexOf("]");

  if (first === -1 || last === -1) {
    throw new Error("No JSON array found in Gemini output");
  }

  return rawText.slice(first, last + 1);
}

async function llmEnrich(exps) {
  try {
    // Filter out experiences that already have valid tags
    const toEnrich = exps.filter(e => !e.llmTags || Object.keys(e.llmTags).length === 0);

    if (toEnrich.length === 0) {
      return exps;
    }
    const prompt = `
Return ONLY a JSON array. No code blocks. No explanations.
Each item must be a JSON object with fields:
"innovation", "creativity", "collaboration", 
"complexity", "problem_solving", "leadership".

Experiences:
${toEnrich.map((e, i) => `[${i}] ${e.title} | ${e.description}`).join("\n")}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    });

    let rawText =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      response.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("Gemini produced no text output");

    // ✅ Fix: sanitize markdown fences + extract JSON
    const clean = extractJSON(rawText);
    const json = JSON.parse(clean);

    let enrichIndex = 0;
    return exps.map((e) => {
      if (!e.llmTags || Object.keys(e.llmTags).length === 0) {
        const tags = json[enrichIndex] || {};
        enrichIndex++;
        return { ...e, llmTags: tags };
      }
      return e;
    });
  } catch (err) {
    console.error("LLM enrichment failed:", err);
    return exps;
  }
}

// ------------------------------
// Agents
// ------------------------------
async function SkillExtractorAgent(profile) {
  const now = Date.now();
  const techSignals = {};

  for (const exp of profile.experiences) {
    const endTime = exp.end ? new Date(exp.end).getTime() : now;
    const recency = 0.6 + 0.4 * norm01(endTime, now - 2 * 365 * day, now);

    const complexity = exp.llmTags?.complexity ?? 5;
    const roleW = { contributor: 0.8, lead: 1.0, owner: 1.2 }[exp.role] ?? 1.0;

    for (const t of exp.technologies) {
      const tech = t.toLowerCase();
      techSignals[tech] ??= 0;
      techSignals[tech] +=
        (0.4 * exp.impact + 0.3 * complexity + 0.3 * roleW * 10) * recency;
    }
  }

  const values = Object.values(techSignals);
  const lo = Math.min(0, ...values);
  const hi = Math.max(10, ...values, 10);

  const levels = {};
  for (const [tech, score] of Object.entries(techSignals)) {
    levels[tech] = Math.round(10 * norm01(score, lo, hi));
  }

  return { techLevelsDelta: levels };
}

async function LevelIncrementAgent(profile) {
  const inc = {};
  for (const [tech, lvl] of Object.entries(profile.techLevels)) {
    const strong = profile.experiences.filter(
      (e) =>
        e.technologies.map((t) => t.toLowerCase()).includes(tech) &&
        (e.impact >= 7 || (e.llmTags?.problem_solving ?? 0) >= 7)
    ).length;

    if (strong >= 2) inc[tech] = Math.min(lvl + 1, 10);
  }

  return { techLevelsDelta: inc };
}

// ------------------------------
// Stats Agent
// ------------------------------
function StatsScorerAgent(profile) {
  const expList = profile.experiences;
  const achievements = profile.achievements || [];

  const techPairs = Object.entries(profile.techLevels).map(([t, lvl]) => [
    lvl,
    1
  ]);

  const technicalMastery = clamp(wmean(techPairs) * 10);

  const projectPower = clamp(
    expList.reduce((a, e) => a + e.impact * 10, 0) / 5
  );

  const collaboration = clamp(
    expList.reduce((a, e) => a + (e.llmTags?.collaboration ?? 5), 0) * 2
  );

  const innovationCreativity = clamp(
    expList.reduce((a, e) => a + (e.llmTags?.creativity ?? 5), 0) * 2+
    achievements.reduce((a, ach) => a + (ach.llmTags?.innovation ?? 3), 0)
  );

  const problemSolving = clamp(
    expList.reduce((a, e) => a + (e.llmTags?.problem_solving ?? 5), 0) * 2
  );

  const academicEndurance = clamp(
    // proxy: duration and count of experiences
    Math.min(
      100,
      expList.reduce((a, e) => {
        const start = new Date(e.start).getTime();
        const end = new Date(e.end || Date.now()).getTime();
        const months = Math.max(0, (end - start) / (30 * day));
        return a + months;
      }, 0) * 2
    )
  );

  const leadership = clamp(
    expList.reduce((a, e) => a + (e.llmTags?.leadership ?? 5), 0) * 2 +
    achievements.reduce((a, ach) => a + (ach.llmTags?.leadership ?? 3), 0)
  );

  // Calculate extracurricular based on achievements
  const achievementScore = Math.min(100, achievements.length * 10);
  const categoryBonus = achievements.reduce((acc, ach) => {
    const category = (ach.category || '').toLowerCase();
    if (['sports', 'cultural', 'volunteering', 'club'].includes(category)) {
      return acc + 5;
    }
    return acc;
  }, 0);
  const extracurricular = clamp(achievementScore + categoryBonus);

  const overall = clamp(
    wmean([
      [technicalMastery, 0.25],
      [projectPower, 0.2],
      [collaboration, 0.15],
      [innovationCreativity, 0.1],
      [problemSolving, 0.15],
      [academicEndurance, 0.05],
      [leadership, 0.1],
      [extracurricular, 0.05]
    ])
  );

  return {
    stats: {
      technicalMastery,
      projectPower,
      collaboration,
      innovationCreativity,
      problemSolving,
      academicEndurance,
      leadership,
      extracurricular,
      overall
    }
  };
}

// ------------------------------
// Governance
// ------------------------------
function GovernanceAgent(result) {
  const cleaned = {};
  for (const [k, v] of Object.entries(result.stats)) {
    cleaned[k] = clamp(v);
  }
  return { stats: cleaned };
}

// ------------------------------
// Main Orchestrator
// ------------------------------
function computeXPFromStats(stats) {
  // Sum xpPerPoint weights from config
  const sCfg = xpRules.stats;
  let xp = 0;
  xp += (stats.technicalMastery ?? 0) * (sCfg.technicalMastery?.xpPerPoint ?? 0);
  xp += (stats.projectPower ?? 0) * (sCfg.projectPower?.xpPerPoint ?? 0);
  xp += (stats.collaboration ?? 0) * (sCfg.collaboration?.xpPerPoint ?? 0);
  xp += (stats.innovationCreativity ?? 0) * (sCfg.innovationCreativity?.xpPerPoint ?? 0);
  xp += (stats.problemSolving ?? 0) * (sCfg.problemSolving?.xpPerPoint ?? 0);
  xp += (stats.academicEndurance ?? 0) * (sCfg.academicEndurance?.xpPerPoint ?? 0);
  xp += (stats.leadership ?? 0) * (sCfg.leadership?.xpPerPoint ?? 0);
  xp += (stats.extracurricular ?? 0) * (sCfg.extracurricular?.xpPerPoint ?? 0);
  return Math.round(xp);
}

function mapXPToLevel(xp) {
  const item = levelThresholds.levels.find(
    (l) => xp >= l.minXP && xp < l.maxXP
  ) || levelThresholds.levels[levelThresholds.levels.length - 1];
  return { level: item.level, currentXP: xp, nextLevelXP: item.maxXP };
}

export async function evaluateProfile(profile) {
  profile.experiences = await llmEnrich(profile.experiences);

  const [s1, s2] = await Promise.all([
    SkillExtractorAgent(profile),
    LevelIncrementAgent(profile)
  ]);

  const merged = { ...profile.techLevels };

  for (const [tech, lvl] of Object.entries(s1.techLevelsDelta)) {
    merged[tech] = Math.max(merged[tech] || 0, lvl);
  }

  for (const [tech, lvl] of Object.entries(s2.techLevelsDelta)) {
    merged[tech] = Math.max(merged[tech] || 0, lvl);
  }

  const updated = { ...profile, techLevels: merged };

  const stats1 = StatsScorerAgent(updated);
  const final = GovernanceAgent(stats1);

  const xp = computeXPFromStats(final.stats);
  const levelInfo = mapXPToLevel(xp);

  return {
    profile: updated,
    stats: final.stats,
    xp: xp,
    level: levelInfo.level,
    nextLevelXP: levelInfo.nextLevelXP
  };
}


export function transformStudentToProfile(student) {
  // 1. Convert skills → techLevels with default level=1
  const techLevels = {};
  for (const s of student.skills) {
    // Handle both string (legacy) and object (new) formats
    const skillName = typeof s === 'string' ? s : s.name;
    if (skillName) {
      techLevels[skillName.toLowerCase()] = 1; // default baseline skill
    }
  }

  // 2. Convert experiences into evaluator format
  const experiences = student.experience.map((exp) => ({
    _id: exp._id,
    type: 'experience',
    title: exp.title,
    description: exp.description,
    technologies: exp.technologies || [],
    company: exp.company,
    location: exp.location,
    start: exp.start_date,
    end: exp.end_date || new Date(),
    role: "contributor", // Students are contributors by default
    impact: 6,           // you can compute real impact later
    mode: "team",
    teamSize: 1,
    prsMerged: 0,
    reviewsDone: 0,
    wonHackathon: false,
    filedPatent: false,
    llmTags: exp.llmTags || {},
  }));

  // 3. Convert projects into evaluator format
  const projectExperiences = student.projects.map((project) => ({
    _id: project._id,
    type: 'project',
    title: project.title,
    description: project.description,
    technologies: project.technologies || [],
    company: "Self/College",
    location: "Remote",
    start: new Date("2024-01-01"),  // fake date
    end: new Date(),
    role: "owner",
    impact: 7,
    mode: "solo",
    teamSize: 1,
    prsMerged: 0,
    reviewsDone: 0,
    wonHackathon: false,
    filedPatent: false,
    llmTags: project.llmTags || {},
  }));

  // 4. Convert achievements into evaluator format
  const achievements = (student.achievements || []).map((achievement) => ({
    _id: achievement._id,
    title: achievement.title,
    description: achievement.description,
    date: achievement.date,
    category: achievement.category,
    llmTags: achievement.llmTags || {},
  }));

  return {
    userId: String(student._id),
    techLevels,
    experiences: [...experiences, ...projectExperiences],
    achievements,
    signals: {
      extracurricularScore: 40, // optional default
    },
  };
}

