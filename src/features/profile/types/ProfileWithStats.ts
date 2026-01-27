import { Profile } from "./Profile";

/**
 * Profile with contribution statistics
 */
export interface ProfileWithStats extends Profile {
  contribution_count?: number;
  latest_contribution?: string;
}
