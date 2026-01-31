import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/api/client";
import { Trophy, Medal, Award, GitPullRequest, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { LeaderboardEntry, Leaderboard } from "./types";

export function LeaderboardPage() {
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<string>("all");

  const { data: leaderboards } = useQuery({
    queryKey: ["leaderboards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leaderboards")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: entries, isLoading } = useQuery({
    queryKey: ["leaderboard-entries", selectedLeaderboard],
    queryFn: async () => {
      let query = supabase
        .from("contributions")
        .select(`
          user_id,
          profiles!inner(display_name, github_username, github_avatar_url)
        `);

      if (selectedLeaderboard !== "all") {
        query = query.eq("leaderboard_id", selectedLeaderboard);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by user and count PRs
      const userCounts = data.reduce((acc: Record<string, LeaderboardEntry>, curr: any) => {
        const userId = curr.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            pr_count: 0,
            display_name: curr.profiles?.display_name,
            github_username: curr.profiles?.github_username,
            github_avatar_url: curr.profiles?.github_avatar_url,
          };
        }
        acc[userId].pr_count++;
        return acc;
      }, {});

      return Object.values(userCounts).sort((a, b) => b.pr_count - a.pr_count);
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-mono text-muted-foreground w-5 text-center">{rank + 1}</span>;
    }
  };

  const currentLeaderboard = leaderboards?.find((l) => l.id === selectedLeaderboard);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Dropdown */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground">
            Principais contribuidores classificados por pull requests fundidos
          </p>
          {currentLeaderboard && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(currentLeaderboard.start_date), "MMM d, yyyy")} -{" "}
                {format(new Date(currentLeaderboard.end_date), "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>

        {/* Leaderboard Selector - Top Right */}
        <div className="w-full md:w-64 shrink-0">
          <Select value={selectedLeaderboard} onValueChange={setSelectedLeaderboard}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Select leaderboard" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tempos</SelectItem>
              {leaderboards?.map((lb) => (
                <SelectItem key={lb.id} value={lb.id}>
                  {lb.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="max-w-3xl mx-auto">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={`skeleton-${i}`} className="glass-card h-16 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && entries?.length === 0 && (
          <div className="glass-card p-12 text-center">
            <GitPullRequest className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Ainda sem contribuições</h3>
            <p className="text-muted-foreground">
              Seja o primeiro a contribuir e aparecer na Leaderboard!
            </p>
          </div>
        )}

        {!isLoading && entries && entries.length > 0 && (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <Link
                key={entry.user_id}
                to={`/user/${entry.user_id}`}
                className="block"
              >
                <div
                  className={`glass-card-hover p-4 flex items-center gap-4 ${
                    index < 3 ? "border-primary/20" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index)}
                  </div>

                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {entry.github_avatar_url ? (
                      <img
                        src={entry.github_avatar_url}
                        alt=""
                        className="h-10 w-10 rounded-full border border-border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {(entry.display_name || "U")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {entry.github_username || entry.display_name || "Anonymous"}
                      </p>
                      {entry.github_username && entry.display_name && (
                        <p className="text-sm text-muted-foreground truncate">
                          {entry.display_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <GitPullRequest className="h-4 w-4 text-success" />
                    <span className="stat-number text-lg text-success">{entry.pr_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Default export for backward compatibility
export default LeaderboardPage;
