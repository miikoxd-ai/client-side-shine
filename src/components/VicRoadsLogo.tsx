import { useState } from "react";
import { EditLicenceDialog } from "./EditLicenceDialog";

export function VicRoadsLogo({ size = 40 }: { size?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onDoubleClick={() => setOpen(true)}
        className="shrink-0 rounded p-1 transition hover:bg-muted/60"
        aria-label="VicRoads logo (double-click to edit licence details)"
        title="Double-click to edit"
      >
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 12 L26 50 L34 36 L20 12 Z" fill="#16803c" />
          <path d="M30 12 L48 50 L56 36 L42 12 Z" fill="#22c55e" />
        </svg>
      </button>
      <EditLicenceDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
