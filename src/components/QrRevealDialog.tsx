import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLicenceStore, fullName, fullAddress, formatDate } from "@/store/licence";

const TTL = 120; // seconds

export function QrRevealDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const licence = useLicenceStore((s) => s.licence);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [remaining, setRemaining] = useState(TTL);

  useEffect(() => {
    if (!open) return;
    setRemaining(TTL);
    const photo = licence.photoUrl ?? "";
    const isHttpPhoto = /^https?:\/\//i.test(photo);
    const params = new URLSearchParams({
      name: fullName(licence),
      license: licence.licenceNumber ?? "",
      expiry: licence.expiry ?? "",
      licensetype: licence.type ?? "",
    });
    if (isHttpPhoto) params.set("photo", photo);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const verifyUrl = `${origin}/verify?${params.toString()}`;
    console.log("[QR] verify URL:", verifyUrl);
    try {
      localStorage.setItem("vicstate-id:verify-url", verifyUrl);
    } catch {}
    QRCode.toDataURL(verifyUrl, { width: 480, margin: 1, errorCorrectionLevel: "L" }).then(setDataUrl);

    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          onOpenChange(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open, licence, onOpenChange]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Licence</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center">
          {dataUrl && <img src={dataUrl} alt="Licence QR code" className="h-72 w-72" />}
          <p className="mt-3 font-semibold text-foreground">
            QR expires {mm}:{ss}
          </p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          By presenting this QR code you <strong>consent</strong> to share some or all of your driver licence
          information, including with scanners, venues and law enforcement agencies. They may retain your information
          in accordance with their business practices and legal requirements.
        </p>
        <div>
          <p className="text-sm font-semibold text-foreground">You're sharing:</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
            <li>Victorian driver licence photo</li>
            <li>Full name, birth date and address</li>
            <li>Licence number, type and expiry date ({formatDate(licence.expiry)})</li>
            <li>Licence status</li>
            <li>Proficiency</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
