import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useLicenceStore } from "@/store/licence";

export const Route = createFileRoute("/demerit")({
  head: () => ({
    meta: [
      { title: "VicState ID — Demerit Points" },
      { name: "description", content: "Your demerit point balance" },
    ],
  }),
  component: DemeritPage,
});

function DemeritPage() {
  const navigate = useNavigate();
  const points = useLicenceStore((s) => s.licence.demeritPoints);
  const safe = points < 6;

  return (
    <AppShell>
      <div className="flex items-center gap-2 px-5 pt-6 pb-4">
        <button onClick={() => navigate({ to: "/" })} className="rounded p-1 hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-base font-semibold">Demerit points</h1>
        <div className="w-7" />
      </div>

      <div className="space-y-4 px-5">
        <div className={`rounded-2xl p-5 text-white ${safe ? "bg-green-700" : "bg-red-600"}`}>
          <p className="text-sm">Current Balance</p>
          <p className="mt-2">
            <span className="text-5xl font-bold">{points}</span>
            <span className="ml-1 text-lg opacity-80">/ 12</span>
          </p>
          <p className="mt-2 text-sm">demerit points</p>
        </div>

        <div className="rounded-2xl bg-muted/60 p-4 text-sm">
          <p className="font-semibold">Information</p>
          <p className="mt-1 text-muted-foreground">
            Demerit points are recorded against your licence when you commit certain driving offences. If you accumulate too many points, your licence may be suspended.
          </p>
        </div>

        <div className="rounded-2xl border border-border p-4 text-sm">
          <p className="font-semibold">{safe ? "Good driving record" : "Caution"}</p>
          <p className="mt-1 text-muted-foreground">
            You currently have {points} demerit points. {safe ? "Keep up the safe driving!" : "Drive carefully to avoid losing your licence."}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
