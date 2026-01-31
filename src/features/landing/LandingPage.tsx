import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/api/client";
import { FolderGit2, TrendingUp, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";

export default function LandingPage() {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
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

  const { data: nextLeaderboard } = useQuery({
    queryKey: ["next-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leaderboards")
        .select("*")
        .eq("is_active", true)
        .gte("end_date", new Date().toISOString())
        .order("end_date", { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!nextLeaderboard?.end_date) return;

    const updateCountdown = () => {
      const now = Date.now();
      const end = new Date(nextLeaderboard.end_date).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeRemaining({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextLeaderboard]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Acompanhe o Seu Impacto em <span className="gradient-text">Open Source</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Junte-se à comunidade, contribua para projectos incríveis e suba na Leaderboard
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/projects">
            <Button size="lg" className="gap-2">
              <FolderGit2 className="h-5 w-5" />
              Explorar Projectos
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button size="lg" variant="outline" className="gap-2">
              <TrendingUp className="h-5 w-5" />
              Ver Leaderboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
        <div className="glass-card p-6 text-center">
          <div className="flex justify-center mb-3">
            <FolderGit2 className="h-8 w-8 text-primary" />
          </div>
          <p className="stat-number text-4xl text-primary mb-2">{stats?.projects || 0}</p>
          <p className="text-sm text-muted-foreground font-medium">Projectos Activos</p>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="flex justify-center mb-3">
            <Users className="h-8 w-8 text-success" />
          </div>
          <p className="stat-number text-4xl text-success mb-2">{stats?.contributors || 0}</p>
          <p className="text-sm text-muted-foreground font-medium">Contribuidores</p>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="flex justify-center mb-3">
            <TrendingUp className="h-8 w-8 text-warning" />
          </div>
          <p className="stat-number text-4xl text-warning mb-2">{stats?.prs || 0}</p>
          <p className="text-sm text-muted-foreground font-medium">PRs Fundidos</p>
        </div>
      </div>

      {/* Countdown Section */}
      {nextLeaderboard && (
        <div className="max-w-3xl mx-auto mb-12">
          <div className="glass-card p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Próxima Leaderboard</h2>
            </div>
            <p className="text-muted-foreground mb-6">{nextLeaderboard.name}</p>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-background/50 rounded-lg p-4">
                <div className="stat-number text-3xl md:text-4xl text-primary mb-1">
                  {timeRemaining.days}
                </div>
                <div className="text-xs text-muted-foreground uppercase">Dias</div>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <div className="stat-number text-3xl md:text-4xl text-primary mb-1">
                  {timeRemaining.hours}
                </div>
                <div className="text-xs text-muted-foreground uppercase">Horas</div>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <div className="stat-number text-3xl md:text-4xl text-primary mb-1">
                  {timeRemaining.minutes}
                </div>
                <div className="text-xs text-muted-foreground uppercase">Minutos</div>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <div className="stat-number text-3xl md:text-4xl text-primary mb-1">
                  {timeRemaining.seconds}
                </div>
                <div className="text-xs text-muted-foreground uppercase">Segundos</div>
              </div>
            </div>

            {nextLeaderboard.description && (
              <p className="text-sm text-muted-foreground">{nextLeaderboard.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Pronto para Fazer a Diferença?
        </h2>
        <p className="text-muted-foreground mb-6">
          Comece a contribuir para projectos open source hoje e veja o seu nome subir na Leaderboard. 
          Cada pull request conta!
        </p>
        <Link to="/projects">
          <Button size="lg" className="gap-2">
            Começar
          </Button>
        </Link>
      </div>
    </div>
  );
}
