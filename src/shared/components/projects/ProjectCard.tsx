import { ExternalLink, Star, GitFork } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Project } from "@/features/projects/types";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <div
      className="glass-card-hover p-6 flex flex-col"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{project.github_repo}</h3>
          <p className="text-sm text-muted-foreground">{project.github_owner}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          asChild
        >
          <a href={project.github_repo_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      {project.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {project.labels?.map((label) => (
          <span key={label} className="badge-label">
            {label}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4" />
          <span className="font-mono">{project.stars?.toLocaleString() || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <GitFork className="h-4 w-4" />
          <span className="font-mono">{project.forks?.toLocaleString() || 0}</span>
        </div>
      </div>
    </div>
  );
}
