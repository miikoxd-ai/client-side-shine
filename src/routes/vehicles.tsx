import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLicenceStore } from "@/store/licence";

export const Route = createFileRoute("/vehicles")({
  head: () => ({
    meta: [
      { title: "VicState ID — Registered Vehicles" },
      { name: "description", content: "Your registered vehicles" },
    ],
  }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const navigate = useNavigate();
  const vehicles = useLicenceStore((s) => s.licence.vehicles);
  const addVehicle = useLicenceStore((s) => s.addVehicle);
  const removeVehicle = useLicenceStore((s) => s.removeVehicle);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ rego: "", make: "", model: "", year: "" });

  return (
    <AppShell>
      <div className="flex items-center gap-2 px-5 pt-6 pb-4">
        <button onClick={() => navigate({ to: "/" })} className="rounded p-1 hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-base font-semibold">Registered vehicles</h1>
        <div className="w-7" />
      </div>

      <div className="space-y-3 px-5">
        {vehicles.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No vehicles registered yet.</p>
        )}
        {vehicles.map((v) => (
          <div key={v.id} className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <p className="font-semibold">{v.rego}</p>
              <p className="text-sm text-muted-foreground">{v.year} {v.make} {v.model}</p>
            </div>
            <button onClick={() => removeVehicle(v.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-sm text-muted-foreground hover:bg-muted/40"
        >
          <Plus className="h-4 w-4" /> Add vehicle
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(["rego", "make", "model", "year"] as const).map((k) => (
              <div key={k}>
                <Label className="text-xs capitalize">{k}</Label>
                <Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (form.rego) {
                  addVehicle(form);
                  setForm({ rego: "", make: "", model: "", year: "" });
                  setOpen(false);
                }
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
