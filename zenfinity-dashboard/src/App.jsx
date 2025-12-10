import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { Sun, Moon } from "lucide-react";

const queryClient = new QueryClient();

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("theme-dark", theme === "dark");
    root.classList.toggle("theme-light", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const ToggleButton = () => (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-6 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 bg-white shadow-lg text-slate-800 hover:shadow-xl transition dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      <span className="text-sm">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToggleButton />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard/:imei" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;