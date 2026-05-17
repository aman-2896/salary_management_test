import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Users, BarChart3, Building2 } from "lucide-react";
import EmployeesPage from "./pages/EmployeesPage";
import InsightsPage from "./pages/InsightsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30, retry: 1 },
  },
});

const navItems = [
  { to: "/",         label: "Employees",  icon: Users },
  { to: "/insights", label: "Insights",   icon: BarChart3 },
];

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-60 bg-brand-900 text-white flex flex-col fixed h-full">
            <div className="px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-brand-100" />
                <span className="font-semibold text-sm tracking-wide">
                  HR Portal
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1">Salary Management</p>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-white/15 text-white font-medium"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    )
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="px-6 py-4 border-t border-white/10">
              <p className="text-xs text-white/30">v1.0.0</p>
            </div>
          </aside>

          {/* Main content */}
          <main className="ml-60 flex-1 min-h-screen">
            <Routes>
              <Route path="/"         element={<EmployeesPage />} />
              <Route path="/insights" element={<InsightsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}