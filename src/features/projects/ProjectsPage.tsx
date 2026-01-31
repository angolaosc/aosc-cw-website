import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/api/client";
import { ProjectCard } from "@/shared/components/projects/ProjectCard";
import { Input } from "@/shared/components/ui/input";
import { Search, FolderGit2, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";

export default function Project() {
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");

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

  // Extract unique languages/frameworks from all project labels
  const availableLanguages = useMemo(() => {
    if (!projects) return [];
    
    const languagesSet = new Set<string>();
    projects.forEach((project) => {
      project.labels?.forEach((label: string) => {
        languagesSet.add(label);
      });
    });
    
    return Array.from(languagesSet).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter((project) => {
      const matchesSearch =
        project.github_repo.toLowerCase().includes(search.toLowerCase()) ||
        project.github_owner.toLowerCase().includes(search.toLowerCase()) ||
        (project.description?.toLowerCase() || "").includes(search.toLowerCase()) ||
        project.labels?.some((label: string) =>
          label.toLowerCase().includes(search.toLowerCase())
        );

      const matchesLanguage =
        selectedLanguage === "all" ||
        project.labels?.includes(selectedLanguage);

      return matchesSearch && matchesLanguage;
    });
  }, [projects, search, selectedLanguage]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <span className="gradient-text">Projectos</span>
        </h1>
        <p className="text-muted-foreground">
          Explore e descubra projectos open source para contribuir
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Procurar projectos, proprietários ou descrições..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary border-border focus:border-primary input-glow"
              />
            </div>
          </div>

          {/* Language Filter */}
          <div className="w-full md:w-64">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="bg-secondary border-border">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by language" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Linguagens</SelectItem>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {(search || selectedLanguage !== "all") && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filtros activos:</span>
            {search && (
              <Badge variant="secondary" className="gap-1">
                Procura: {search}
                <button
                  onClick={() => setSearch("")}
                  className="ml-1 hover:text-primary"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedLanguage !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {selectedLanguage}
                <button
                  onClick={() => setSelectedLanguage("all")}
                  className="ml-1 hover:text-primary"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        {filteredProjects && (
          <p className="text-sm text-muted-foreground">
            {filteredProjects.length} {filteredProjects.length === 1 ? "projecto" : "projectos"} encontrado{filteredProjects.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {/* Projects Grid */}
      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={`skeleton-project-${i}`} className="glass-card h-48 animate-pulse" />
          ))}
        </div>
      )}
      
      {!isLoading && filteredProjects?.length === 0 && (
        <div className="text-center py-16">
          <FolderGit2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum projecto encontrado</h3>
          <p className="text-muted-foreground">
            {search || selectedLanguage !== "all"
              ? "Tente ajustar os seus filtros"
              : "Os projectos aparecerão aqui quando forem adicionados pelos administradores"}
          </p>
        </div>
      )}
      
      {!isLoading && filteredProjects && filteredProjects.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
