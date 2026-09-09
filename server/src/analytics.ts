import { PracticeSession } from "./store";

export type Role = "batsman" | "bowler" | "battingAllrounder" | "bowlingAllrounder";

const ROLE_TARGETS: Record<Role, { batting: number; bowling: number }> = {
  batsman: { batting: 360, bowling: 0 },
  bowler: { batting: 60, bowling: 240 },
  battingAllrounder: { batting: 240, bowling: 120 },
  bowlingAllrounder: { batting: 180, bowling: 220 },
};

function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function buildAnalytics(sessions: PracticeSession[], role: Role) {
  if (sessions.length === 0) {
    return { hasData: false as const };
  }

  const weeks = new Map<string, PracticeSession[]>();
  for (const s of sessions) {
    const week = getWeekStart(s.date);
    if (!weeks.has(week)) weeks.set(week, []);
    weeks.get(week)!.push(s);
  }

  const latestWeek = [...weeks.keys()].sort().at(-1)!;
  const latestSessions = weeks.get(latestWeek)!;

  const minutesByType: Record<string, number> = {};
  for (const s of latestSessions) {
    minutesByType[s.sessionType] = (minutesByType[s.sessionType] || 0) + s.duration;
  }

  const battingMinutes = minutesByType["Batting"] || 0;
  const bowlingMinutes = minutesByType["Bowling"] || 0;
  const totalMinutes = latestSessions.reduce((sum, s) => sum + s.duration, 0);
  const avgFatigue = average(latestSessions.map((s) => s.fatigueLevel));
  const avgPerformance = average(latestSessions.map((s) => s.performanceRating));

  const targets = ROLE_TARGETS[role];
  const battingStatus =
    battingMinutes >= targets.batting
      ? "Good batting practice this week."
      : `You need to bat ${targets.batting - battingMinutes} more minutes this week.`;
  const bowlingStatus =
    targets.bowling === 0
      ? null
      : bowlingMinutes >= targets.bowling
        ? "Great bowling practice."
        : `You need to bowl ${targets.bowling - bowlingMinutes} more minutes this week.`;

  let fatigueRecommendation: string;
  if (avgFatigue >= 9) fatigueRecommendation = "Tired, take a rest day.";
  else if (avgFatigue >= 7) fatigueRecommendation = "Fatigue is a little high, do a lighter session.";
  else fatigueRecommendation = "Fatigue is okay, you can continue normal practice.";

  let trainingReadinessScore = 0;
  if (totalMinutes >= 300) trainingReadinessScore += 30;
  if (avgFatigue <= 6) trainingReadinessScore += 30;
  if (avgPerformance >= 7) trainingReadinessScore += 40;

  return {
    hasData: true as const,
    latestWeek,
    totalMinutes,
    minutesByType,
    avgFatigue,
    avgPerformance,
    battingStatus,
    bowlingStatus,
    fatigueRecommendation,
    trainingReadinessScore,
  };
}
