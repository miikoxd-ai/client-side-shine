import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminLogin, adminListKeys, adminCreateKeys } from "@/lib/access.functions";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const ADMIN_STORAGE = "vr_admin_token";

type KeyRow = {
  id: string;
  key: string;
  note: string | null;
  consumed_at: string | null;
  created_at: string;
};

function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [count, setCount] = useState(1);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const login = useServerFn(adminLogin);
  const list = useServerFn(adminListKeys);
  const create = useServerFn(adminCreateKeys);

  useEffect(() => {
    const t = sessionStorage.getItem(ADMIN_STORAGE);
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    list({ data: { adminToken: token } }).then((res) => {
      if (res.ok) setKeys(res.keys);
      else {
        sessionStorage.removeItem(ADMIN_STORAGE);
        setToken(null);
      }
    });
  }, [token, list]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginErr(null);
    const res = await login({ data: { password: pw } });
    if (res.ok) {
      sessionStorage.setItem(ADMIN_STORAGE, res.token);
      setToken(res.token);
      setPw("");
    } else {
      setLoginErr(res.error);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      const res = await create({ data: { adminToken: token, count, note: note || undefined } });
      if (res.ok) {
        setKeys((prev) => [...res.keys, ...prev]);
        setNote("");
      } else if (res.error === "Unauthorized") {
        sessionStorage.removeItem(ADMIN_STORAGE);
        setToken(null);
      }
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    sessionStorage.removeItem(ADMIN_STORAGE);
    setToken(null);
    setKeys([]);
  }

  async function copy(key: string) {
    await navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <form onSubmit={onLogin} className="w-full max-w-sm space-y-4">
          <h1 className="text-center text-2xl font-semibold text-foreground">Admin</h1>
          <input
            type="password"
            placeholder="Admin password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          {loginErr && <p className="text-center text-sm text-destructive">{loginErr}</p>}
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }

  const used = keys.filter((k) => k.consumed_at).length;
  const unused = keys.length - used;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Access keys</h1>
            <p className="text-sm text-muted-foreground">
              {keys.length} total · {unused} unused · {used} used
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
          >
            Sign out
          </button>
        </div>

        <form onSubmit={onCreate} className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h2 className="font-medium text-foreground">Generate keys</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full sm:w-24 rounded-md border border-input bg-background px-3 py-2 text-foreground"
            />
            <input
              type="text"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create"}
            </button>
          </div>
        </form>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Key</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 hidden sm:table-cell">Note</th>
                <th className="px-4 py-2 hidden sm:table-cell">Created</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    No keys yet.
                  </td>
                </tr>
              )}
              {keys.map((k) => (
                <tr key={k.id} className="border-t border-border">
                  <td className="px-4 py-2 font-mono">
                    <button onClick={() => copy(k.key)} className="hover:underline" title="Click to copy">
                      {k.key}
                    </button>
                    {copied === k.key && <span className="ml-2 text-xs text-primary">copied</span>}
                  </td>
                  <td className="px-4 py-2">
                    {k.consumed_at ? (
                      <span className="text-muted-foreground">used</span>
                    ) : (
                      <span className="text-primary">unused</span>
                    )}
                  </td>
                  <td className="px-4 py-2 hidden sm:table-cell text-muted-foreground">{k.note || "—"}</td>
                  <td className="px-4 py-2 hidden sm:table-cell text-muted-foreground">
                    {new Date(k.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
