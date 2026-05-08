import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/verify")({
  component: VerifyPage,
  validateSearch: (search: Record<string, unknown>) => ({
    name: (search.name as string) ?? "",
    license: (search.license as string) ?? "",
    expiry: (search.expiry as string) ?? "",
    photo: (search.photo as string) ?? "",
    licensetype: (search.licensetype as string) ?? "",
  }),
});

function VerifyPage() {
  const { name, license, expiry, photo, licensetype } = Route.useSearch();

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <h1 className="text-xl font-bold text-foreground">Licence Verified</h1>
        </div>
        {photo && (
          <img
            src={photo}
            alt={name}
            className="w-32 h-40 object-cover rounded-md mb-4 border border-border"
          />
        )}
        <dl className="space-y-2 text-sm">
          <Row label="Name" value={name} />
          <Row label="Licence #" value={license} />
          <Row label="Type" value={licensetype} />
          <Row label="Expiry" value={expiry} />
        </dl>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground text-right">{value || "—"}</dd>
    </div>
  );
}
