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

function daysSince(dateStr: string): number {
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

const TRACKED_TYPES = ["Batting", "Bowling", "Fielding", "Fitness"] as const;

function buildInsights(
  sessions: PracticeSession[],
  weeks: Map<string, PracticeSession[]>,
  latestWeek: string,
): string[] {
  const insights: string[] = [];
  const weekKeys = [...weeks.keys()].sort();
  const currentIndex = weekKeys.indexOf(latestWeek);
  const previousWeek = currentIndex > 0 ? weekKeys[currentIndex - 1] : null;

  const currentByType: Record<string, number> = {};
  for (const s of weeks.get(latestWeek) ?? []) {
    currentByType[s.sessionType] = (currentByType[s.sessionType] || 0) + s.duration;
  }

  const previousByType: Record<string, number> = {};
  if (previousWeek) {
    for (const s of weeks.get(previousWeek) ?? []) {
      previousByType[s.sessionType] = (previousByType[s.sessionType] || 0) + s.duration;
    }
  }

  for (const type of TRACKED_TYPES) {
    const current = currentByType[type] || 0;
    const previous = previousByType[type] || 0;

    if (previous > 0) {
      const change = ((current - previous) / previous) * 100;
      if (Math.abs(change) >= 20) {
        const direction = change > 0 ? "increased" : "decreased";
        insights.push(
          `Your ${type.toLowerCase()} workload ${direction} ${Math.abs(Math.round(change))}% this week.`,
        );
      }
    }

    const lastSession = [...sessions]
      .filter((s) => s.sessionType === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (lastSession) {
      const gap = daysSince(lastSession.date);
      if (gap >= 7) {
        insights.push(`You haven't trained ${type.toLowerCase()} in ${gap} days.`);
      }
    } else {
      insights.push(`You haven't logged any ${type.toLowerCase()} sessions yet.`);
    }
  }

  return insights;
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

  const insights = buildInsights(sessions, weeks, latestWeek);

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
    insights,
  };
}
