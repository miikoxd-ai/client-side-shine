import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, DollarSign } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "VicState ID — Payments" },
      { name: "description", content: "Outstanding fees and fines" },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="flex items-center gap-2 px-5 pt-6 pb-4">
        <button onClick={() => navigate({ to: "/" })} className="rounded p-1 hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-base font-semibold">Payments</h1>
        <div className="w-7" />
      </div>
      <div className="flex flex-col items-center justify-center px-5 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <DollarSign className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="mt-4 font-semibold">No payments due</p>
        <p className="mt-1 text-sm text-muted-foreground">Any outstanding fees or fines will appear here.</p>
      </div>
    </AppShell>
  );
}
