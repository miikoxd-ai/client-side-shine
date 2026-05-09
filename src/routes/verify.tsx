import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Licence Verified — myVicRoads" },
      { name: "description", content: "Verify a Victorian driver licence." },
    ],
  }),
  component: VerifyPage,
  validateSearch: (search: Record<string, unknown>) => ({
    name: (search.name as string) ?? "",
    license: (search.license as string) ?? "",
    expiry: (search.expiry as string) ?? "",
    photo: (search.photo as string) ?? "",
    licensetype: (search.licensetype as string) ?? "",
    proficiency: (search.proficiency as string) ?? "",
  }),
});

function VerifyPage() {
  const { name, license, expiry, photo, licensetype, proficiency } = Route.useSearch();
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow">
        <div className="flex items-center gap-2 bg-green-700 px-5 py-4 text-white">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-green-700">
            <Check className="h-4 w-4" />
          </span>
          <h1 className="text-base font-bold">Licence Verified</h1>
        </div>
        {photo && (
          <div className="flex justify-center bg-muted p-4">
            <img src={photo} alt="Licence holder" className="h-48 w-40 rounded-md object-cover" />
          </div>
        )}
        <div className="space-y-3 p-5">
          <Row label="Name" value={name} />
          <Row label="Licence number" value={license} />
          <Row label="Expiry" value={expiry} />
          <Row label="Licence type" value={licensetype} />
          <Row label="Proficiency" value={proficiency} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border pb-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value || "—"}</p>
    </div>
  );
}
