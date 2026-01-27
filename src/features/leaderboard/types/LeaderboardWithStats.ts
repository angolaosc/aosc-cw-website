import { Leaderboard } from "./Leaderboard";

/**
 * Leaderboard with participant count
 */
export interface LeaderboardWithStats extends Leaderboard {
  participant_count?: number;
  total_contributions?: number;
}
