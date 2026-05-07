import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import QRCode from "qrcode";
import { AppShell } from "@/components/AppShell";
import { VicRoadsLogo } from "@/components/VicRoadsLogo";
import {
  useLicenceStore,
  fullName,
  fullAddress,
  formatDate,
  proficiencyBadge,
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
  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const badge = proficiencyBadge(licence.proficiency);

  // Live-updating "last refreshed" timestamp (per-minute resolution)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const refreshedLabel = now.toLocaleString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Static QR payload — same code every time, derived from licence number only.
  const qrPayload = useMemo(
    () => `VICROADS:LICENCE:${licence.licenceNumber}`,
    [licence.licenceNumber],
  );

  useEffect(() => {
    QRCode.toDataURL(qrPayload, { width: 480, margin: 1 }).then(setQrDataUrl);
  }, [qrPayload]);

  // Countdown loop (display only — does not refresh QR). Resets when revealed.
  useEffect(() => {
    if (!revealed) return;
    setRemaining(QR_TTL);
    const id = setInterval(() => {
      setRemaining((r) => (r <= 1 ? QR_TTL : r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [revealed]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <AppShell>
      <div className="flex items-center gap-2 px-5 pt-6 pb-4">
        <button onClick={() => navigate({ to: "/" })} className="rounded p-1 hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-base font-semibold">View details</h1>
        <div className="w-7" />
      </div>

      <p className="border-t border-border py-2 text-center text-xs text-muted-foreground">
        Last refreshed: {refreshedLabel}
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
            backgroundImage:
              "repeating-linear-gradient(-30deg, rgba(220,38,38,0.10) 0 2px, transparent 2px 14px), radial-gradient(circle at 20% 30%, rgba(220,38,38,0.08), transparent 40%), radial-gradient(circle at 80% 70%, rgba(220,38,38,0.08), transparent 45%)",
          }}
        >
          <div className="relative grid grid-cols-2 gap-3">
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-muted">
              {licence.photoUrl ? (
                <img src={licence.photoUrl} alt="Licence photo" className="h-full w-full object-cover" />
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground">
                  <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" />
                </svg>
              )}
            </div>
            <div className="flex aspect-square w-full flex-col items-center justify-center rounded-lg bg-white p-3 text-center">
              <p className="text-[11px] leading-snug text-foreground">
                Presenting a QR code allows your driver licence information to be scanned and shared.
              </p>
              <p className="mt-2 text-xs font-bold text-foreground">
                Do you consent to share your information?
              </p>
              <button
                onClick={() => setRevealed(true)}
                className="mt-2 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white"
              >
                Reveal QR code
              </button>
            </div>
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

function LicenceTab() {
  const licence = useLicenceStore((s) => s.licence);
  const badge = proficiencyBadge(licence.proficiency);
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

      {licence.proficiency !== "Full" && (
        <div className="mt-6 rounded-xl bg-muted/60 p-4">
          <p className="font-semibold">{licence.type} learner permit details</p>
          <div className="mt-3 space-y-3">
            <Field label="Permit status">
              <p className="flex items-center gap-2 text-sm">
                <span className="inline-block h-3 w-3 rounded-full bg-green-600" />
                {licence.permitStatus}
              </p>
            </Field>
            <Field label="Proficiency">
              <p className="flex items-center gap-2 text-sm">
                {badge.chip && <Chip {...badge.chip} />}
                {licence.proficiency}
              </p>
            </Field>
            <Field label="Issue date">
              <p className="text-sm">{formatDate(licence.permitIssueDate)}</p>
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

function IdentityTab() {
  const licence = useLicenceStore((s) => s.licence);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold uppercase tracking-wide">{fullName(licence)}</h2>
      <Field label="Date of birth">
        <p>{formatDate(licence.dob)}</p>
      </Field>
      <Field label="Address">
        <p className="whitespace-pre-line">{fullAddress(licence)}</p>
      </Field>
    </div>
  );
}

function AgeTab() {
  const licence = useLicenceStore((s) => s.licence);
  const age = ageFromHook(licence.dob);
  return (
    <div className="space-y-4">
      <Field label="Date of birth">
        <p className="text-lg font-semibold">{formatDate(licence.dob)}</p>
      </Field>
      <div className="rounded-xl bg-green-100 py-8 text-center">
        <p className="text-5xl font-bold">{age}</p>
        <p className="mt-1 text-sm text-muted-foreground">years old</p>
      </div>
    </div>
  );
}

function ageFromHook(dob: string) {
  const d = new Date(dob);
  if (isNaN(d.getTime())) return 0;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
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
