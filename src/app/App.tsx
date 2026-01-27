import { BrowserRouter } from "react-router-dom";
import { QueryProvider, ThemeProvider, AuthProvider } from "./providers";
import { AppRoutes } from "./routes";
import { Navbar } from "@/shared/components/layout/Navbar";

const App = () => (
  <QueryProvider>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <div className="min-h-screen">
            <Navbar />
            <AppRoutes />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </QueryProvider>
);

export default App;
