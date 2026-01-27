import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/api/client";
import { ProjectCard } from "@/shared/components/projects/ProjectCard";
import { Input } from "@/shared/components/ui/input";
import { Search, FolderGit2, TrendingUp, Users } from "lucide-react";

export default function Project() {
  const [search, setSearch] = useState("");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const [projectsRes, contributorsRes, prsRes] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("contributions").select("id", { count: "exact", head: true }),
      ]);

      return {
        projects: projectsRes.count || 0,
        contributors: contributorsRes.count || 0,
        prs: prsRes.count || 0,
      };
    },
  });

  const filteredProjects = projects?.filter(
    (project) =>
      project.github_repo.toLowerCase().includes(search.toLowerCase()) ||
      project.github_owner.toLowerCase().includes(search.toLowerCase()) ||
      project.labels?.some((label: string) =>
        label.toLowerCase().includes(search.toLowerCase())
      )
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Track Your <span className="gradient-text">Open Source</span> Impact
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Join the community, contribute to amazing projects, and climb the leaderboard
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
          <div className="glass-card p-4 text-center">
            <div className="flex justify-center mb-2">
              <FolderGit2 className="h-5 w-5 text-primary" />
            </div>
            <p className="stat-number text-2xl text-primary">{stats?.projects || 0}</p>
            <p className="text-xs text-muted-foreground">Projects</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex justify-center mb-2">
              <Users className="h-5 w-5 text-success" />
            </div>
            <p className="stat-number text-2xl text-success">{stats?.contributors || 0}</p>
            <p className="text-xs text-muted-foreground">Contributors</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <p className="stat-number text-2xl text-warning">{stats?.prs || 0}</p>
            <p className="text-xs text-muted-foreground">Merged PRs</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects or labels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border focus:border-primary input-glow"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredProjects?.length === 0 ? (
        <div className="text-center py-16">
          <FolderGit2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground">
            {search ? "Try a different search term" : "Projects will appear here once added by admins"}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects?.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
