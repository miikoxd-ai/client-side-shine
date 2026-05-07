import { Link, useLocation } from "@tanstack/react-router";
import { Home, Car, IdCard, Banknote, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/vehicles", label: "Vehicles", icon: Car },
  { to: "/licence", label: "Licence", icon: IdCard },
  { to: "/payments", label: "Payments", icon: Banknote },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background">
      <div className="mx-auto flex max-w-[440px] items-center justify-between px-2 py-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = pathname === t.to;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[11px] ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-green-700" : ""}`} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
