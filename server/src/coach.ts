import Anthropic from "@anthropic-ai/sdk";
import { getSessions } from "./store";
import { getGames } from "./gameStore";
import { getProfile, PlayerRole } from "./profileStore";
import { getPlansInRange } from "./planStore";
import { buildAnalytics, Role } from "./analytics";

let cachedClient: Anthropic | null | undefined;

function getAnthropicClient(): Anthropic | null {
  if (cachedClient !== undefined) return cachedClient;

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    cachedClient = null;
    return cachedClient;
  }

  try {
    cachedClient = new Anthropic();
  } catch {
    cachedClient = null;
  }
  return cachedClient;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function mapRoleForAnalytics(role: PlayerRole): Role {
  if (role === "wicketkeeper") return "battingAllrounder";
  return role;
}

function buildCoachContext(): string {
  const profile = getProfile();
  const sessions = [...getSessions()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const games = [...getGames()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const today = new Date();
  const weekAhead = new Date(today);
  weekAhead.setDate(today.getDate() + 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(today.getDate() - 30);
  const plans = getPlansInRange(toDateKey(monthAgo), toDateKey(weekAhead));

  const analytics =
    sessions.length > 0 ? buildAnalytics(sessions, mapRoleForAnalytics(profile.role)) : null;

  const lines: string[] = [
    "## Player Profile",
    JSON.stringify(profile, null, 2),
    "",
    `## Practice Sessions (${sessions.length} total, most recent first, capped at 60)`,
    JSON.stringify(sessions.slice(0, 60), null, 2),
    "",
    `## Games (${games.length} total, most recent first)`,
    JSON.stringify(games, null, 2),
    "",
    "## Weekly Plans (last 30 days through next 7 days)",
    JSON.stringify(plans, null, 2),
  ];

  if (analytics) {
    lines.push("", "## This Week's Analytics Summary", JSON.stringify(analytics, null, 2));
  }

  return lines.join("\n");
}

export type CoachMessage = { role: "user" | "assistant"; content: string };

export async function askCoach(question: string, history: CoachMessage[]): Promise<string> {
  const anthropic = getAnthropicClient();
  if (!anthropic) {
    throw new Error("NOT_CONFIGURED");
  }

  const context = buildCoachContext();

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: question },
  ];

  const response = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 1024,
    output_config: { effort: "medium" },
    system: [
      {
        type: "text",
        text:
          "You are the CricketFit AI Coach, embedded in a cricket training app. Answer the " +
          "player's questions using ONLY the data provided below about their practice sessions, " +
          "games, plans, and profile. Be specific and cite real numbers, dates, and notes from " +
          "the data. Keep answers concise (a few sentences unless the question calls for more) " +
          "and encouraging, like a coach would be. If the data doesn't cover the question, say " +
          "so honestly instead of making anything up.\n\n" +
          context,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}
