import { Routes, Route } from "react-router-dom";
import LandingPage from "@/features/landing/LandingPage";
import ProjectsPage from "@/features/projects/ProjectsPage";
import { LeaderboardPage } from "@/features/leaderboard/LeaderboardPage";
import { AuthPage } from "@/features/auth/AuthPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { UserActivityPage } from "@/features/profile/UserActivityPage";
import { AdminPage } from "@/features/admin/AdminPage";
import NotFound from "@/shared/pages/NotFound";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/projects" element={<ProjectsPage />} />
    <Route path="/leaderboard" element={<LeaderboardPage />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/user/:userId" element={<UserActivityPage />} />
    <Route path="/admin" element={<AdminPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
