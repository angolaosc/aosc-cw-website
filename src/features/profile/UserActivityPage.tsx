import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/api/client";
import { User, GitPullRequest, Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Profile, ContributionWithProject } from "./types";

export function UserActivityPage() {
  const { userId } = useParams<{ userId: string }>();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: contributions, isLoading: contributionsLoading } = useQuery({
    queryKey: ["user-contributions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contributions")
        .select(`
          *,
          projects(github_repo, github_owner)
        `)
        .eq("user_id", userId)
        .order("merged_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const isLoading = profileLoading || contributionsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-card h-32 animate-pulse" />
          <div className="glass-card h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">User not found</h2>
          <Link to="/leaderboard">
            <Button variant="outline">Back to Leaderboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Link to="/leaderboard">
          <Button variant="ghost" className="gap-2 text-muted-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Leaderboard
          </Button>
        </Link>

        {/* User Header */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            {profile.github_avatar_url ? (
              <img
                src={profile.github_avatar_url}
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
                {profile.github_username || profile.display_name || "Contributor"}
              </h1>
              {profile.github_username && profile.display_name && (
                <p className="text-muted-foreground">{profile.display_name}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <GitPullRequest className="h-5 w-5 text-success" />
              <span className="stat-number text-xl">{contributions?.length || 0}</span>
              <span className="text-muted-foreground">Merged PRs</span>
            </div>
          </div>
        </div>

        {/* Contributions */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Contribution History</h2>

          {contributions?.length === 0 ? (
            <div className="text-center py-8">
              <GitPullRequest className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No contributions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contributions?.map((contribution: any) => (
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
                        {contribution.projects?.github_owner}/{contribution.projects?.github_repo} #
                        {contribution.pr_number}
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
export default UserActivityPage;
