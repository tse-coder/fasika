import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  UserPlus,
  Menu,
  X,
  LogOut,
  AlertTriangle,
  UsersIcon,
  User,
  LayoutDashboardIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/stores/auth.store";
import { useModalStore } from "@/stores/overlay.store";
import { Button } from "@/components/ui/button";
import { UserInfoOverlay } from "@/components/user/UserInfoOverlay";
import { useUserProfile } from "@/hooks/useUserProfile";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/children", icon: Users, label: "Children" },
  { path: "/register", icon: UserPlus, label: "Register Child" },
  { path: "/payments", icon: CreditCard, label: "Payments" },
  { path: "/late-payments", icon: AlertTriangle, label: "Unpaid" },
  { path: "/admins", icon: UsersIcon, label: "Admins" },
  { path: "/payment-info", icon: LayoutDashboardIcon, label: "Payment Info" },
];

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const { name, email, role } = useUserProfile();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUserClick = () => {
    openModal(
      <UserInfoOverlay
        name={name}
        email={email}
        role={role}
        onClose={closeModal}
      />
    );
  };

  return (
    <div className="max-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <img src="logo.png" alt="logo" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 pr-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              if (role === "USER" && item.path in ["/admins", "/payment-info"]) return null
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground rounded-l-none border-r-3 border-r-primary"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:rounded-l-none"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleUserClick}
            >
              <div className="flex items-center gap-3 w-full">
                <User className="w-4 h-4" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground">
                    {user?.name || user?.email || "User"}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60">
                    {user?.role === "ADMIN" ? "Admin" : "User"}
                  </p>
                </div>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-foreground">
              {navItems.find((item) => item.path === location.pathname)
                ?.label || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* a drop down menu to select a branch for the superadmin */}
            
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
