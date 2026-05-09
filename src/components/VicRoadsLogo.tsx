import { useState } from "react";
import { EditLicenceDialog } from "./EditLicenceDialog";
import logoUrl from "@/assets/vicroads-logo.png";

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
        <img
          src={logoUrl}
          alt="VicRoads"
          width={size}
          height={size}
          className="object-contain"
          style={{ width: size, height: size }}
        />
      </button>
      <EditLicenceDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
