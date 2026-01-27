import { Contribution } from "./Contribution";

/**
 * Contribution with related project information
 */
export interface ContributionWithProject extends Contribution {
  projects?: {
    github_repo: string;
    github_owner: string;
    github_repo_url?: string;
    description?: string | null;
  } | null;
}
