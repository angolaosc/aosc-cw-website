import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { Button } from "@/shared/components/ui/button";
import { FolderGit2, Github } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

export function AuthPage() {
  const [loading, setLoading] = useState(false);

  const { signInWithGitHub } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGitHubSignIn = async () => {
    setLoading(true);

    try {
      const { error } = await signInWithGitHub();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        // OAuth redirect will handle navigation
        toast({
          title: "Redirecting...",
          description: "Taking you to GitHub to sign in.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-card p-8">
          <div className="flex justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <FolderGit2 className="h-6 w-6 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">
            Bem-vindo
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Sign in with GitHub to track your contributions
          </p>

          <Button
            onClick={handleGitHubSignIn}
            className="w-full bg-[#24292e] text-white hover:bg-[#24292e]/90 gap-2"
            disabled={loading}
          >
            <Github className="h-4 w-4" />
            {loading ? "Connecting..." : "Continue with GitHub"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Default export for backward compatibility
export default AuthPage;
