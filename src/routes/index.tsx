import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { VicRoadsLogo } from "@/components/VicRoadsLogo";
import { PasscodeKeypad } from "@/components/PasscodeKeypad";
import { useLicenceStore } from "@/store/licence";
import { hashPasscode } from "@/lib/passcode";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VicState ID — Home" },
      { name: "description", content: "Your Victorian digital driver licence" },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  const passcodeHash = useLicenceStore((s) => s.passcodeHash);
  const unlocked = useLicenceStore((s) => s.unlocked);
  const hasHydrated = useLicenceStore((s) => s.hasHydrated);
  const setUnlocked = useLicenceStore((s) => s.setUnlocked);
  const setPasscodeHash = useLicenceStore((s) => s.setPasscodeHash);

  const [step, setStep] = useState<"create" | "confirm" | "enter">("create");
  const [first, setFirst] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Don't render passcode UI until persisted state has rehydrated from localStorage,
  // otherwise iOS PWA / SSR shows "Create Passcode" even when a hash already exists.
  if (!hasHydrated) return null;

  const activeStep: "create" | "confirm" | "enter" = passcodeHash ? "enter" : step;

  if (!unlocked) {
    if (activeStep === "create") {
      return (
        <PasscodeKeypad
          title="Create Passcode"
          subtitle="Choose a 4-digit passcode"
          value={code}
          error={error}
          onChange={(v) => {
            setError(null);
            setCode(v);
            if (v.length === 4) {
              setFirst(v);
              setCode("");
              setStep("confirm");
            }
          }}
        />
      );
    }
    if (activeStep === "confirm") {
      return (
        <PasscodeKeypad
          title="Confirm Passcode"
          subtitle="Re-enter your passcode to confirm"
          value={code}
          error={error}
          onChange={async (v) => {
            setError(null);
            setCode(v);
            if (v.length === 4) {
              if (v === first) {
                const h = await hashPasscode(v);
                setPasscodeHash(h);
                setUnlocked(true);
              } else {
                setError("Passcodes do not match");
                setCode("");
                setStep("create");
              }
            }
          }}
        />
      );
    }
    return (
      <PasscodeKeypad
        title="Enter Passcode"
        subtitle="Enter your 4-digit passcode to continue"
        value={code}
        error={error}
        onChange={async (v) => {
          setError(null);
          setCode(v);
          if (v.length === 4) {
            const h = await hashPasscode(v);
            if (h === passcodeHash) setUnlocked(true);
            else {
              setError("Incorrect passcode. Try again.");
              setCode("");
            }
          }
        }}
      />
    );
  }

  return <Home />;
}

function Home() {
  const licence = useLicenceStore((s) => s.licence);
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <VicRoadsLogo />
        <h1 className="text-2xl font-semibold text-foreground">Hi {licence.firstName}</h1>
      </div>

      <div className="space-y-3 px-5">
        <Link
          to="/demerit"
          className="block rounded-2xl bg-card p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center">
            <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
              <line x1="2" y1="10" x2="30" y2="10" stroke="#16803c" strokeWidth="2" />
              <circle cx="10" cy="10" r="5" fill="white" stroke="#16803c" strokeWidth="2" />
            </svg>
          </div>
          <p className="font-semibold text-foreground">Demerit point balance</p>
        </Link>

        <Link
          to="/vehicles"
          className="block rounded-2xl bg-card p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center">
            <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
              <path d="M4 14 L6 8 L26 8 L28 14 L28 17 L4 17 Z" stroke="#16803c" strokeWidth="2" fill="white" />
              <circle cx="10" cy="17" r="2" fill="#16803c" />
              <circle cx="22" cy="17" r="2" fill="#16803c" />
            </svg>
          </div>
          <p className="font-semibold text-foreground">Registered vehicles</p>
        </Link>
      </div>

      <button
        type="button"
        onClick={() => navigate({ to: "/licence" })}
        className="fixed bottom-20 left-1/2 z-20 flex w-[calc(100%-2.5rem)] max-w-[400px] -translate-x-1/2 items-center justify-between rounded-2xl bg-slate-900 p-5 text-left text-white shadow-lg transition hover:bg-slate-800"
      >
        <div>
          <p className="font-semibold">My licence</p>
          <p className="text-sm text-white/70">Tap to view licence</p>
        </div>
        <ArrowUpRight className="h-5 w-5" />
      </button>
    </AppShell>
  );
}
