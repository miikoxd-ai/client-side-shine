import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, DollarSign, CreditCard, Receipt, Plus } from "lucide-react";
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

      <div className="mx-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white">
        <p className="text-xs uppercase tracking-wide text-white/70">Total outstanding</p>
        <p className="mt-1 text-3xl font-bold">$0.00</p>
        <p className="mt-2 text-xs text-white/70">No active payments due</p>
      </div>

      <p className="mt-5 px-5 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Outstanding</p>
      <div className="mx-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-semibold">No payments due</p>
        <p className="mt-1 text-xs text-muted-foreground">Any outstanding fees or fines will appear here.</p>
      </div>

      <p className="mt-5 px-5 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment methods</p>
      <div className="mx-5 divide-y divide-border rounded-xl border border-border bg-card">
        <Method label="Visa •••• 4242" sub="Expires 04/28" />
        <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-muted-foreground hover:bg-muted/40">
          <Plus className="h-4 w-4" /> Add payment method
        </button>
      </div>

      <p className="mt-5 px-5 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent activity</p>
      <div className="mx-5 mb-8 divide-y divide-border rounded-xl border border-border bg-card">
        <Activity title="Licence renewal" date="12 Mar 2026" amount="$87.30" />
        <Activity title="Vehicle registration — ABC123" date="04 Feb 2026" amount="$845.10" />
        <Activity title="Demerit point check" date="18 Jan 2026" amount="$0.00" />
      </div>
    </AppShell>
  );
}

function Method({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <CreditCard className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function Activity({ title, date, amount }: { title: string; date: string; amount: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
        <Receipt className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <p className="text-sm font-semibold">{amount}</p>
    </div>
  );
}
