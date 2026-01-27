/**
 * Leaderboard entry showing user ranking and contribution count
 */
export interface LeaderboardEntry {
  user_id: string;
  pr_count: number;
  display_name: string | null;
  github_username: string | null;
  github_avatar_url: string | null;
}
