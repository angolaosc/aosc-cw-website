import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/api/client";
import { useAuth } from "@/features/auth/useAuth";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToast } from "@/shared/hooks/use-toast";
import {
  FolderGit2,
  Trophy,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

export function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Project form state
  const [repoUrl, setRepoUrl] = useState("");
  const [labels, setLabels] = useState("");
  const [description, setDescription] = useState("");

  // Leaderboard form state
  const [lbName, setLbName] = useState("");
  const [lbDescription, setLbDescription] = useState("");
  const [lbStartDate, setLbStartDate] = useState("");
  const [lbEndDate, setLbEndDate] = useState("");

  const { data: projects } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: leaderboards } = useQuery({
    queryKey: ["admin-leaderboards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leaderboards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const addProject = useMutation({
    mutationFn: async () => {
      // Parse GitHub URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) throw new Error("Invalid GitHub URL");

      const [, owner, repo] = match;
      const labelsArray = labels
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      const { error } = await supabase.from("projects").insert({
        github_repo_url: repoUrl,
        github_owner: owner,
        github_repo: repo.replace(".git", ""),
        labels: labelsArray,
        description,
        created_by: user?.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setRepoUrl("");
      setLabels("");
      setDescription("");
      toast({ title: "Project added successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project deleted" });
    },
  });

  const addLeaderboard = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("leaderboards").insert({
        name: lbName,
        description: lbDescription,
        start_date: new Date(lbStartDate).toISOString(),
        end_date: new Date(lbEndDate).toISOString(),
        created_by: user?.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leaderboards"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboards"] });
      setLbName("");
      setLbDescription("");
      setLbStartDate("");
      setLbEndDate("");
      toast({ title: "Leaderboard created successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const toggleLeaderboard = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("leaderboards")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leaderboards"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboards"] });
    },
  });

  const deleteLeaderboard = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leaderboards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leaderboards"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboards"] });
      toast({ title: "Leaderboard deleted" });
    },
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card h-96 animate-pulse" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="projects" className="gap-2">
              <FolderGit2 className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="leaderboards" className="gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboards
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Add Project</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addProject.mutate();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="repoUrl">GitHub Repository URL</Label>
                  <Input
                    id="repoUrl"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="bg-secondary border-border"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labels">Labels (comma-separated)</Label>
                  <Input
                    id="labels"
                    value={labels}
                    onChange={(e) => setLabels(e.target.value)}
                    placeholder="hacktoberfest, good-first-issue"
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the project..."
                    className="bg-secondary border-border"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={addProject.isPending}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {addProject.isPending ? "Adding..." : "Add Project"}
                </Button>
              </form>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Projectos Rastreado</h2>
              {projects?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum projecto adicionado ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {projects?.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {project.github_owner}/{project.github_repo}
                          </span>
                          <a
                            href={project.github_repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </a>
                        </div>
                        <div className="flex gap-2 mt-1">
                          {project.labels?.map((label: string) => (
                            <span key={label} className="badge-label text-xs">
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteProject.mutate(project.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Leaderboards Tab */}
          <TabsContent value="leaderboards" className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Create Leaderboard</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addLeaderboard.mutate();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="lbName">Name</Label>
                  <Input
                    id="lbName"
                    value={lbName}
                    onChange={(e) => setLbName(e.target.value)}
                    placeholder="Hacktoberfest 2024"
                    className="bg-secondary border-border"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lbDescription">Description</Label>
                  <Textarea
                    id="lbDescription"
                    value={lbDescription}
                    onChange={(e) => setLbDescription(e.target.value)}
                    placeholder="Description of this leaderboard..."
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lbStartDate">Start Date</Label>
                    <Input
                      id="lbStartDate"
                      type="date"
                      value={lbStartDate}
                      onChange={(e) => setLbStartDate(e.target.value)}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lbEndDate">End Date</Label>
                    <Input
                      id="lbEndDate"
                      type="date"
                      value={lbEndDate}
                      onChange={(e) => setLbEndDate(e.target.value)}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={addLeaderboard.isPending}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {addLeaderboard.isPending ? "Creating..." : "Create Leaderboard"}
                </Button>
              </form>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Manage Leaderboards</h2>
              {leaderboards?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No leaderboards created yet
                </p>
              ) : (
                <div className="space-y-3">
                  {leaderboards?.map((lb) => (
                    <div
                      key={lb.id}
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{lb.name}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              lb.is_active
                                ? "bg-success/20 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {lb.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(lb.start_date), "MMM d, yyyy")} -{" "}
                          {format(new Date(lb.end_date), "MMM d, yyyy")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleLeaderboard.mutate({
                              id: lb.id,
                              isActive: lb.is_active,
                            })
                          }
                        >
                          {lb.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteLeaderboard.mutate(lb.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Default export for backward compatibility
export default AdminPage;
