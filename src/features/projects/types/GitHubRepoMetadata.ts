/**
 * GitHub repository metadata from API
 */
export interface GitHubRepoMetadata {
  stars: number;
  forks: number;
  description: string | null;
  defaultBranch: string;
  language: string | null;
  topics: string[];
}
