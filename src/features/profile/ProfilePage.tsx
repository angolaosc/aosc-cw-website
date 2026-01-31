import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/api/client";
import { useAuth } from "@/features/auth/useAuth";
import { useToast } from "@/shared/hooks/use-toast";
import { User, Github, GitPullRequest, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Contribution } from "@/features/profile/types";
import { Navigate } from "react-router-dom";

export function ProfilePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState("");
  const [githubUsername, setGithubUsername] = useState("");

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: contributions } = useQuery({
    queryKey: ["my-contributions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("contributions")
        .select(`
          *,
          projects(github_repo, github_owner)
        `)
        .eq("user_id", user.id)
        .order("merged_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setGithubUsername(profile.github_username || "");
    } else if (user) {
      // Auto-populate from GitHub OAuth data
      const githubUsername = user.user_metadata?.user_name || user.user_metadata?.preferred_username;
      if (githubUsername) {
        setGithubUsername(githubUsername);
      }
      // Set display name from GitHub name if available
      const displayName = user.user_metadata?.full_name || user.user_metadata?.name;
      if (displayName) {
        setDisplayName(displayName);
      }
    }
  }, [profile, user]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          display_name: displayName,
          github_username: githubUsername,
          github_avatar_url: user.user_metadata?.avatar_url || (githubUsername ? `https://github.com/${githubUsername}.png` : null),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast({
        title: "Perfil actualizado",
        description: "O seu perfil foi guardado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  if (loading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-card h-64 animate-pulse" />
          <div className="glass-card h-48 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Profile Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-6">
            {profile?.github_avatar_url || user?.user_metadata?.avatar_url ? (
              <img
                src={profile?.github_avatar_url || user?.user_metadata?.avatar_url}
                alt=""
                className="h-16 w-16 rounded-full border-2 border-primary/20"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "O Seu Perfil"}
              </h1>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Github className="h-4 w-4" />
                  <span>@{profile?.github_username || user?.user_metadata?.user_name || user?.user_metadata?.preferred_username || "utilizador-github"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>@{user?.user_metadata?.location || "localização desconhecida"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contributions */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <GitPullRequest className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">As Suas Contribuições</h2>
          </div>

          {contributions?.length === 0 ? (
            <div className="text-center py-8">
              <GitPullRequest className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Ainda sem contribuições. Comece a contribuir para projectos rastreados!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contributions?.map((contribution: Contribution) => (
                <a
                  key={contribution.id}
                  href={contribution.pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block glass-card-hover p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{contribution.pr_title}</p>
                      <p className="text-sm text-muted-foreground">
                        #12
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(contribution.merged_at), "MMM d, yyyy")}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Default export for backward compatibility
export default ProfilePage;
