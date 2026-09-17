import { PlayerProfile, PlayerRole } from "./profileStore";
import { ReadinessEntry } from "./readinessStore";
import { SESSION_TEMPLATES, SessionTemplate, TemplateCategory } from "./templates";
import { DayPlan } from "./planStore";

const ROLE_PRIMARY_CATEGORY: Record<PlayerRole, TemplateCategory> = {
  batsman: "Batting",
  bowler: "Bowling",
  battingAllrounder: "Batting",
  bowlingAllrounder: "Bowling",
  wicketkeeper: "Wicketkeeping",
};

type FitnessCategory = "Strength" | "Conditioning" | "Recovery";

function pickTemplate(category: TemplateCategory): SessionTemplate {
  return SESSION_TEMPLATES.find((t) => t.category === category) ?? SESSION_TEMPLATES[0];
}

function pickFitnessCategory(readiness: ReadinessEntry | null): {
  category: FitnessCategory;
  note: string;
} {
  if (!readiness) {
    return {
      category: "Strength",
      note: "Log a readiness check-in for a workout matched to how you're feeling.",
    };
  }

  const strain =
    readiness.soreness + readiness.pain + (10 - readiness.energy) + (10 - readiness.sleep);

  if (readiness.pain >= 7 || strain >= 24) {
    return {
      category: "Recovery",
      note: "Your readiness numbers suggest you need a lighter day — recovery recommended.",
    };
  }

  if (strain >= 14) {
    return {
      category: "Conditioning",
      note: "Some fatigue showing — a moderate conditioning session over heavy strength work.",
    };
  }

  return {
    category: "Strength",
    note: "You're reading fresh — a good day for strength work.",
  };
}

export type TodaysPlan = {
  isRestDay: boolean;
  readinessNote: string;
  cricketSession: {
    source: "plan" | "role";
    sessionType: string;
    title: string;
    description: string;
    durationMinutes: number;
    intensity: string;
    exercises: { name: string; detail: string }[];
  } | null;
  fitnessWorkout: {
    category: FitnessCategory;
    title: string;
    description: string;
    durationMinutes: number;
    intensity: string;
  } | null;
};

export function buildTodaysPlan(
  profile: PlayerProfile,
  readiness: ReadinessEntry | null,
  dayPlan: DayPlan | null,
): TodaysPlan {
  if (dayPlan?.sessionType === "Rest") {
    return {
      isRestDay: true,
      readinessNote: "",
      cricketSession: null,
      fitnessWorkout: null,
    };
  }

  const { category: fitnessCategory, note: readinessNote } = pickFitnessCategory(readiness);

  if (dayPlan?.sessionType === "Stretching & Mobility") {
    const template = pickTemplate("Recovery");
    return {
      isRestDay: false,
      readinessNote,
      cricketSession: null,
      fitnessWorkout: {
        category: "Recovery",
        title: template.title,
        description: template.description,
        durationMinutes: template.durationMinutes,
        intensity: template.intensity,
      },
    };
  }

  const fitnessTemplate = pickTemplate(fitnessCategory);
  const fitnessWorkout = {
    category: fitnessCategory,
    title: fitnessTemplate.title,
    description: fitnessTemplate.description,
    durationMinutes: fitnessTemplate.durationMinutes,
    intensity: fitnessTemplate.intensity,
  };

  if (dayPlan?.sessionType === "Fitness") {
    return { isRestDay: false, readinessNote, cricketSession: null, fitnessWorkout };
  }

  if (dayPlan?.sessionType === "Batting" || dayPlan?.sessionType === "Bowling") {
    const template = pickTemplate(dayPlan.sessionType);
    return {
      isRestDay: false,
      readinessNote,
      cricketSession: {
        source: "plan",
        sessionType: dayPlan.sessionType,
        title: template.title,
        description: template.description,
        durationMinutes: template.durationMinutes,
        intensity: template.intensity,
        exercises: dayPlan.exercises.map((e) => ({ name: e.name, detail: e.detail })),
      },
      fitnessWorkout,
    };
  }

  const roleCategory = ROLE_PRIMARY_CATEGORY[profile.role];
  const roleTemplate = pickTemplate(roleCategory);

  return {
    isRestDay: false,
    readinessNote,
    cricketSession: {
      source: "role",
      sessionType: roleCategory,
      title: roleTemplate.title,
      description: roleTemplate.description,
      durationMinutes: roleTemplate.durationMinutes,
      intensity: roleTemplate.intensity,
      exercises: [],
    },
    fitnessWorkout,
  };
}
