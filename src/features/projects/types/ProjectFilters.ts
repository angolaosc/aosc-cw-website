/**
 * Filter options for projects
 */
export interface ProjectFilters {
  search: string;
  labels: string[];
  sortBy: "stars" | "forks" | "created_at" | "name";
  sortOrder: "asc" | "desc";
}
