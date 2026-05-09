import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { AppShell } from "@/components/AppShell";
import { useLicenceStore, fullName, formatDate } from "@/store/licence";

export const Route = createFileRoute("/qrcodedialogue")({
  head: () => ({
    meta: [
      { title: "Verify Licence — QR Code" },
      { name: "description", content: "Present your licence QR code for verification" },
    ],
  }),
  component: QrCodeDialoguePage,
});

const QR_TTL = 120;

function QrCodeDialoguePage() {
  const licence = useLicenceStore((s) => s.licence);
  const navigate = useNavigate();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [remaining, setRemaining] = useState(QR_TTL);

  const qrPayload = useMemo(() => {
    const linkPhoto = licence.photoLinkUrl ?? "";
    const uploadedPhoto = licence.photoUrl ?? "";
    const photoForQr = /^https?:\/\//i.test(linkPhoto)
      ? linkPhoto
      : /^https?:\/\//i.test(uploadedPhoto)
        ? uploadedPhoto
        : "";
    const params = new URLSearchParams({
      name: fullName(licence),
      license: licence.licenceNumber ?? "",
      expiry: licence.expiry ?? "",
      licensetype: licence.type ?? "",
      proficiency: licence.proficiency ?? "",
    });
    if (photoForQr) params.set("photo", photoForQr);
    return `https://vicroadsgov.biz/verify?${params.toString()}`;
  }, [licence]);

  useEffect(() => {
    QRCode.toDataURL(qrPayload, { width: 480, margin: 1, errorCorrectionLevel: "L" }).then(setQrDataUrl);
  }, [qrPayload]);

  useEffect(() => {
    setRemaining(QR_TTL);
    const id = setInterval(() => {
      setRemaining((r) => (r <= 1 ? QR_TTL : r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [qrPayload]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <AppShell hideNav>
      <div className="px-5 pb-10 animate-in slide-in-from-bottom duration-300 ease-out">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold">Verify Licence</h1>
          <button
            onClick={() => navigate({ to: "/licence" })}
            className="text-sm font-medium text-foreground"
          >
            Close
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center">
          {qrDataUrl && (
            <img src={qrDataUrl} alt="Licence QR code" className="w-full max-w-xs" />
          )}
          <p className="mt-3 text-base font-semibold">
            QR expires <span>{mm}:{ss}</span>
          </p>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          By presenting this QR code you{" "}
          <strong className="text-foreground">consent</strong> to share some or all of your
          driver licence information, including with scanners, venues and law enforcement
          agencies. They may retain your information in accordance with their business
          practices and legal requirements.
        </p>

        <p className="mt-5 text-sm font-semibold">You're sharing:</p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
          <li>Victorian driver licence photo</li>
          <li>Full name, birth date and address</li>
          <li>Licence number, type and expiry date ({formatDate(licence.expiry)})</li>
          <li>Licence status</li>
          <li>Proficiency</li>
        </ul>
      </div>
    </AppShell>
  );
}
