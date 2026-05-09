import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto min-h-screen max-w-[440px] bg-background pb-24 pt-[max(env(safe-area-inset-top),2rem)]">{children}</div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
