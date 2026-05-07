import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, User } from "lucide-react";
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
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          {licence.photoUrl ? (
            <img src={licence.photoUrl} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <User className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
        <p className="mt-4 text-xl font-semibold">{fullName(licence)}</p>
        <p className="text-sm text-muted-foreground">{licence.type} Licence holder</p>
      </div>

      <div className="mx-5 mt-4 divide-y divide-border rounded-xl border border-border">
        <Row label="Licence number" value={licence.licenceNumber} />
        <Row label="Date of birth" value={formatDate(licence.dob)} />
        <Row label="Expiry" value={formatDate(licence.expiry)} />
        <Row label="Address" value={fullAddress(licence)} />
      </div>
    </AppShell>
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
