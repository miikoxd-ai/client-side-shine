import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/verify")({
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
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="mx-auto max-w-md rounded-2xl bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">✓</div>
          <h1 className="text-lg font-semibold">Licence Verified</h1>
        </div>
        {photo && (
          <img src={photo} alt="Licence photo" className="mb-4 aspect-[4/5] w-40 rounded-lg object-cover" />
        )}
        <div className="space-y-2">
          <Row label="Name" value={name} />
          <Row label="Licence number" value={license} />
          <Row label="Licence type" value={licensetype} />
          <Row label="Proficiency" value={proficiency} />
          <Row label="Expiry" value={expiry} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border pb-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value || "—"}</p>
    </div>
  );
}
