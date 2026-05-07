import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Eye, EyeOff, Check, Maximize2 } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { VicRoadsLogo } from "@/components/VicRoadsLogo";
import policeBarcodeImg from "@/assets/police-barcode.avif";
import licenceBgImg from "@/assets/licence-bg.png";
import {
  useLicenceStore,
  fullName,
  fullAddress,
  formatDate,
  proficiencyBadge,
  conditionLabel,
  ageFrom,
} from "@/store/licence";

export const Route = createFileRoute("/licence")({
  head: () => ({
    meta: [
      { title: "VicState ID — Licence" },
      { name: "description", content: "View your Victorian driver licence" },
    ],
  }),
  component: LicencePage,
});

type Tab = "Licence" | "Identity" | "Age";

const QR_TTL = 120;

function LicencePage() {
  const licence = useLicenceStore((s) => s.licence);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Licence");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [remaining, setRemaining] = useState(QR_TTL);
  const [revealed, setRevealed] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const pullStart = useRef<number | null>(null);

  const badge = proficiencyBadge(licence.proficiency);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const refreshedLabel = now
    ? now.toLocaleString("en-AU", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const qrPayload = useMemo(
    () => `VICROADS:LICENCE:${licence.licenceNumber}:${refreshNonce}`,
    [licence.licenceNumber, refreshNonce],
  );

  useEffect(() => {
    QRCode.toDataURL(qrPayload, { width: 480, margin: 1 }).then(setQrDataUrl);
  }, [qrPayload]);

  useEffect(() => {
    setRemaining(QR_TTL);
    const id = setInterval(() => {
      setRemaining((r) => (r <= 1 ? QR_TTL : r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const doRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => {
      setNow(new Date());
      setRefreshNonce((n) => n + 1);
      setRemaining(QR_TTL);
      setRefreshing(false);
      toast.success("Licence refreshed");
    }, 900);
  };

  const onPullStart = (y: number) => {
    if (window.scrollY > 0) return;
    pullStart.current = y;
  };
  const onPullMove = (y: number) => {
    if (pullStart.current == null) return;
    const dy = y - pullStart.current;
    if (dy > 0) setPullY(Math.min(dy, 120));
  };
  const onPullEnd = () => {
    if (pullY > 70) doRefresh();
    setPullY(0);
    pullStart.current = null;
  };

  const draggingMouse = useRef(false);

  return (
    <AppShell>
      <div
        onTouchStart={(e) => onPullStart(e.touches[0].clientY)}
        onTouchMove={(e) => onPullMove(e.touches[0].clientY)}
        onTouchEnd={onPullEnd}
        onMouseDown={(e) => { draggingMouse.current = true; onPullStart(e.clientY); }}
        onMouseMove={(e) => { if (draggingMouse.current) onPullMove(e.clientY); }}
        onMouseUp={() => { draggingMouse.current = false; onPullEnd(); }}
        onMouseLeave={() => { if (draggingMouse.current) { draggingMouse.current = false; onPullEnd(); } }}
        style={{ transform: `translateY(${pullY * 0.5}px)`, transition: pullY ? "none" : "transform 200ms" }}
      >
        <div className="flex items-center gap-2 px-5 pt-6 pb-4">
          <button onClick={() => navigate({ to: "/" })} className="rounded p-1 hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold">View details</h1>
          <div className="w-7" />
        </div>

        {(refreshing || pullY > 0) && (
          <div className="flex justify-center py-2">
            <div
              className={`h-6 w-6 rounded-full border-2 border-green-600 border-t-transparent ${
                refreshing ? "animate-spin" : ""
              }`}
              style={{
                opacity: refreshing ? 1 : Math.min(pullY / 70, 1),
                transform: refreshing ? undefined : `rotate(${pullY * 3}deg)`,
              }}
            />
          </div>
        )}

        <p className="border-t border-border py-2 text-center text-xs text-muted-foreground">
          {refreshing ? "Refreshing…" : <>Last refreshed: {refreshedLabel}</>}
        </p>

        <div>
          <div className={`flex items-center justify-between px-5 py-3 text-white ${badge.color}`}>
            <div>
              <p className="text-sm font-bold tracking-wide">{badge.label}</p>
              <p className="text-[11px] opacity-90">Victoria Australia</p>
            </div>
            <VicRoadsLogo size={28} />
          </div>
          <div
            className="relative bg-green-100 p-4"
            style={{
              backgroundImage: `url(${licenceBgImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative grid grid-cols-2 items-stretch gap-3">
              <div className="relative flex aspect-square h-full w-full items-center justify-center overflow-hidden rounded-lg bg-muted">
                {licence.photoUrl ? (
                  <img src={licence.photoUrl} alt="Licence photo" className="h-full w-full object-cover" />
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground">
                    <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" />
                  </svg>
                )}
                <Hologram />
              </div>
              <button
                onClick={() => setRevealed(true)}
                className="relative flex aspect-square w-full flex-col items-center justify-center rounded-lg bg-white p-2 text-center"
                aria-label="Expand QR code"
              >
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Licence QR code"
                    className="h-full w-full object-contain transition-opacity"
                    style={{ opacity: refreshing ? 0.3 : 1 }}
                  />
                )}
                <p className="mt-1 text-[11px] font-semibold text-foreground" style={{ opacity: refreshing ? 0.3 : 1 }}>
                  QR expires <span className="font-bold">{mm}:{ss}</span>
                </p>
                {refreshing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
                  </div>
                )}
                <Maximize2 className="absolute bottom-2 right-2 h-5 w-5 text-slate-900" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        <div className="mx-5 mt-5 grid grid-cols-3 rounded-full bg-muted p-1 text-sm">
          {(["Licence", "Identity", "Age"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full py-2 transition ${
                tab === t ? "bg-slate-900 text-white" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mx-5 mt-5">
          {tab === "Licence" && <LicenceTab />}
          {tab === "Identity" && <IdentityTab />}
          {tab === "Age" && <AgeTab />}
        </div>
      </div>

      {revealed && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-background">
          <div className="mx-auto max-w-[440px] px-5 pt-6 pb-10">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Verify Licence</h2>
              <button
                onClick={() => setRevealed(false)}
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
              By presenting this QR code you <strong className="text-foreground">consent</strong> to share some or all of your driver licence information, including with scanners, venues and law enforcement agencies. They may retain your information in accordance with their business practices and legal requirements.
            </p>
            <p className="mt-5 text-sm font-semibold">You're sharing:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              <li>Victorian driver licence photo</li>
              <li>Full name, birth date and address</li>
              <li>Licence number, type and expiry date</li>
              <li>Licence status</li>
              <li>Proficiency</li>
            </ul>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Hologram() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
          mixBlendMode: "overlay",
          animation: "ddl-shimmer 3.5s linear infinite",
        }}
      />
      <svg
        viewBox="0 0 64 64"
        className="pointer-events-none absolute inset-0 m-auto h-1/2 w-1/2 opacity-25"
        style={{ mixBlendMode: "overlay" }}
        aria-hidden
      >
        <path
          d="M32 6 L52 14 V30 C52 44 42 54 32 58 C22 54 12 44 12 30 V14 Z"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        <circle cx="32" cy="28" r="6" fill="none" stroke="white" strokeWidth="2" />
        <path d="M22 40 H42 M26 46 H38" stroke="white" strokeWidth="2" />
      </svg>
      <style>{`@keyframes ddl-shimmer { 0% { transform: translateX(-100%);} 100% { transform: translateX(100%);} }`}</style>
    </>
  );
}

function LicenceTab() {
  const licence = useLicenceStore((s) => s.licence);
  const badge = proficiencyBadge(licence.proficiency);
  const [showCard, setShowCard] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold uppercase tracking-wide">{fullName(licence)}</h2>

      <Row left={["Licence number", licence.licenceNumber]} right={["Expiry", formatDate(licence.expiry)]} />
      <Row
        left={["Licence type", <span key="t" className="flex items-center gap-2">{licence.type}{badge.chip && <Chip {...badge.chip} />}</span>]}
        right={["Date of birth", formatDate(licence.dob)]}
      />
      <Field label="Address">
        <p className="whitespace-pre-line text-sm">{fullAddress(licence)}</p>
      </Field>

      <Field label="Signature">
        {licence.signatureUrl ? (
          <img src={licence.signatureUrl} alt="Signature" className="h-16 object-contain" />
        ) : (
          <p className="text-sm italic text-muted-foreground">No signature on file</p>
        )}
      </Field>

      <div className="pt-2">
        <div className="-mx-4 bg-muted px-4 py-2 text-sm">{licence.type} licence details</div>
        <div className="mt-3 space-y-3">
          <Field label="Licence status">
            <p className="flex items-center gap-2 text-sm">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-white">
                <Check className="h-3 w-3" />
              </span>
              {licence.licenceStatus}
            </p>
          </Field>
          <Field label="Proficiency">
            <p className="flex items-center gap-2 text-sm">
              {badge.chip && <Chip {...badge.chip} />}
              {licence.proficiency}
            </p>
          </Field>
          <Field label="Issue date">
            <p className="text-sm">{formatDate(licence.issueDate)}</p>
          </Field>
          <Field label="Expiry">
            <p className="text-sm">{formatDate(licence.expiry)}</p>
          </Field>
        </div>
      </div>

      <div className="pt-2">
        <div className="-mx-4 bg-muted px-4 py-2 text-sm">Other details</div>
        <div className="mt-3 space-y-3">
          <Field label="Conditions">
            {licence.conditions.length === 0 ? (
              <p className="text-sm italic text-muted-foreground">None</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {licence.conditions.map((c) => (
                  <li key={c} className="flex gap-3">
                    <span className="font-bold">{c.toUpperCase()}</span>
                    <span>{conditionLabel(c)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Field>
          <Field label="Card number">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm tracking-widest">
                {showCard ? licence.cardNumber : "•".repeat(licence.cardNumber.length)}
              </p>
              <button
                onClick={() => setShowCard((v) => !v)}
                className="rounded p-1 hover:bg-muted"
                aria-label={showCard ? "Hide card number" : "Reveal card number"}
              >
                {showCard ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field label="Victoria Police barcode">
            <PoliceBarcode seed={licence.licenceNumber} />
          </Field>
        </div>
      </div>
    </div>
  );
}

function PoliceBarcode({ seed: _seed }: { seed: string }) {
  return (
    <div className="-mx-4 w-[calc(100%+2rem)] bg-white">
      <img
        src={policeBarcodeImg}
        alt="Victoria Police barcode"
        className="h-14 w-full object-cover"
      />
    </div>
  );
}

function IdentityTab() {
  const licence = useLicenceStore((s) => s.licence);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold uppercase tracking-wide">{fullName(licence)}</h2>
      <Field label="Address">
        <p className="whitespace-pre-line text-sm">{fullAddress(licence)}</p>
      </Field>
      <Field label="Signature">
        {licence.signatureUrl ? (
          <img src={licence.signatureUrl} alt="Signature" className="h-16 object-contain" />
        ) : (
          <p className="text-sm italic text-muted-foreground">No signature on file</p>
        )}
      </Field>
    </div>
  );
}

function AgeTab() {
  const licence = useLicenceStore((s) => s.licence);
  const over18 = ageFrom(licence.dob) >= 18;
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Age status</p>
      <div className="flex items-center gap-2 text-sm font-medium">
        <span
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${
            over18 ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          <Check className="h-3 w-3" />
        </span>
        {over18 ? "Over 18" : "Under 18"}
      </div>
    </div>
  );
}

function Row({ left, right }: { left: [string, React.ReactNode]; right: [string, React.ReactNode] }) {
  return (
    <div className="grid grid-cols-2 gap-4 border-b border-border pb-3">
      <Field label={left[0]}>{typeof left[1] === "string" ? <p className="text-sm font-medium">{left[1]}</p> : left[1]}</Field>
      <Field label={right[0]}>{typeof right[1] === "string" ? <p className="text-sm font-medium">{right[1]}</p> : right[1]}</Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Chip({ letter, bg }: { letter: string; bg: string }) {
  return (
    <span className={`inline-flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-white ${bg}`}>
      {letter}
    </span>
  );
}
