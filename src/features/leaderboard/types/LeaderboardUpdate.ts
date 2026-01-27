import { TablesUpdate } from "@/infrastructure/api/types";

/**
 * Leaderboard data for updating an existing leaderboard
 */
export type LeaderboardUpdate = TablesUpdate<"leaderboards">;
