import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div
        className="mx-auto min-h-screen max-w-[440px] bg-background"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
          paddingBottom: "calc(6rem + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
