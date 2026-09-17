export type TemplateCategory =
  | "Batting"
  | "Bowling"
  | "Fielding"
  | "Wicketkeeping"
  | "Strength"
  | "Conditioning"
  | "Recovery";

export type SessionTemplate = {
  id: string;
  category: TemplateCategory;
  title: string;
  description: string;
  durationMinutes: number;
  intensity: "Low" | "Medium" | "High";
};

export const SESSION_TEMPLATES: SessionTemplate[] = [
  {
    id: "bat-nets-shot-selection",
    category: "Batting",
    title: "Nets — Shot Selection",
    description: "Face varied bowling in the nets, focusing on shot selection.",
    durationMinutes: 60,
    intensity: "Medium",
  },
  {
    id: "bat-footwork-drills",
    category: "Batting",
    title: "Footwork Drills",
    description: "Cone drills for footwork against spin and pace.",
    durationMinutes: 45,
    intensity: "Medium",
  },
  {
    id: "bowl-line-length",
    category: "Bowling",
    title: "Line & Length",
    description: "Target practice for consistent line and length.",
    durationMinutes: 45,
    intensity: "Medium",
  },
  {
    id: "bowl-variations",
    category: "Bowling",
    title: "Variations",
    description: "Work on slower balls, yorkers, and bouncers.",
    durationMinutes: 40,
    intensity: "High",
  },
  {
    id: "field-catching",
    category: "Fielding",
    title: "Catching Practice",
    description: "High catches, slip catches, and reaction drills.",
    durationMinutes: 30,
    intensity: "Medium",
  },
  {
    id: "field-ground",
    category: "Fielding",
    title: "Ground Fielding",
    description: "Pick-up and throw drills, diving stops.",
    durationMinutes: 30,
    intensity: "Medium",
  },
  {
    id: "keeping-fundamentals",
    category: "Wicketkeeping",
    title: "Keeping Fundamentals",
    description: "Glove work standing up and back, footwork behind the stumps.",
    durationMinutes: 40,
    intensity: "Medium",
  },
  {
    id: "strength-lower",
    category: "Strength",
    title: "Lower Body Strength",
    description: "Squats, lunges, and deadlifts for power.",
    durationMinutes: 45,
    intensity: "High",
  },
  {
    id: "strength-upper",
    category: "Strength",
    title: "Upper Body Strength",
    description: "Bowling-specific shoulder and core strength work.",
    durationMinutes: 45,
    intensity: "High",
  },
  {
    id: "conditioning-sprints",
    category: "Conditioning",
    title: "Sprint Conditioning",
    description: "Interval sprints for match fitness.",
    durationMinutes: 30,
    intensity: "High",
  },
  {
    id: "conditioning-endurance",
    category: "Conditioning",
    title: "Endurance Run",
    description: "Steady-state run to build match-day stamina.",
    durationMinutes: 40,
    intensity: "Medium",
  },
  {
    id: "recovery-mobility",
    category: "Recovery",
    title: "Mobility & Stretching",
    description: "Full-body mobility and stretching routine.",
    durationMinutes: 25,
    intensity: "Low",
  },
  {
    id: "recovery-active",
    category: "Recovery",
    title: "Active Recovery",
    description: "Light movement and foam rolling after a heavy week.",
    durationMinutes: 20,
    intensity: "Low",
  },
];
