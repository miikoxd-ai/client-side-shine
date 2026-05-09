import { useState } from "react";
import { EditLicenceDialog } from "./EditLicenceDialog";
import logoUrl from "@/assets/vicroads-logo.png";
import logoMarkUrl from "@/assets/vicroads-logo-mark.png";

export function VicRoadsLogo({
  size = 40,
  variant = "mark",
}: {
  size?: number;
  variant?: "default" | "mark";
}) {
  const [open, setOpen] = useState(false);
  const src = variant === "mark" ? logoMarkUrl : logoUrl;
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
          src={src}
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
