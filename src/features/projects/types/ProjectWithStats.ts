import { Project } from "./Project";

/**
 * Project with contribution count
 */
export interface ProjectWithStats extends Project {
  contribution_count?: number;
}
