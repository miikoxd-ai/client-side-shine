import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, User, LogOut, Bell, Shield, HelpCircle, FileText, Settings } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { VicRoadsLogo } from "@/components/VicRoadsLogo";
import { useLicenceStore, fullName, fullAddress, formatDate } from "@/store/licence";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "VicState ID — Profile" },
      { name: "description", content: "Your profile" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const licence = useLicenceStore((s) => s.licence);
  const setUnlocked = useLicenceStore((s) => s.setUnlocked);
  return (
    <AppShell>
      <div className="flex items-center gap-2 px-5 pt-6 pb-4">
        <button onClick={() => navigate({ to: "/" })} className="rounded p-1 hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-base font-semibold">Profile</h1>
        <VicRoadsLogo size={28} />
      </div>

      <div className="flex flex-col items-center bg-muted/40 px-5 py-8">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-muted">
          {licence.photoUrl ? (
            <img src={licence.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <User className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
        <p className="mt-4 text-xl font-semibold">{fullName(licence)}</p>
        <p className="text-sm text-muted-foreground">{licence.type} Licence holder</p>
      </div>

      <Section title="Personal details">
        <Row label="Licence number" value={licence.licenceNumber} />
        <Row label="Date of birth" value={formatDate(licence.dob)} />
        <Row label="Expiry" value={formatDate(licence.expiry)} />
        <Row label="Address" value={fullAddress(licence)} />
      </Section>

      <Section title="Settings">
        <NavRow icon={Bell} label="Notifications" />
        <NavRow icon={Shield} label="Privacy & security" />
        <NavRow icon={Settings} label="App preferences" />
      </Section>

      <Section title="Support">
        <NavRow icon={HelpCircle} label="Help centre" />
        <NavRow icon={FileText} label="Terms & conditions" />
        <NavRow icon={FileText} label="Privacy policy" />
      </Section>

      <div className="mx-5 mb-8 mt-4">
        <button
          onClick={() => setUnlocked(false)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-destructive hover:bg-muted/40"
        >
          <LogOut className="h-4 w-4" /> Lock app
        </button>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="px-5 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="mx-5 divide-y divide-border rounded-xl border border-border bg-card">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm font-medium">{value}</p>
    </div>
  );
}

function NavRow({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted/40">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
    </button>
  );
}
