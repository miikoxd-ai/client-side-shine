import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { redeemKey, verifyToken } from "@/lib/access.functions";

const STORAGE_KEY = "vr_device_token";

export function AccessGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "locked" | "unlocked">("checking");
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const verify = useServerFn(verifyToken);
  const redeem = useServerFn(redeemKey);

  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!token) {
      setStatus("locked");
      return;
    }
    verify({ data: { token } })
      .then((res) => {
        if (cancelled) return;
        if (res.valid) {
          setStatus("unlocked");
        } else {
          localStorage.removeItem(STORAGE_KEY);
          setStatus("locked");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("locked");
      });
    return () => {
      cancelled = true;
    };
  }, [verify]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await redeem({ data: { key: keyInput } });
      if (res.ok) {
        localStorage.setItem(STORAGE_KEY, res.token);
        setStatus("unlocked");
      } else {
        setError(res.error);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Enter access key</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You need a single-use key to use this app.
            </p>
          </div>
          <input
            autoFocus
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder="XXXX-XXXX-XXXX"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
            className="w-full rounded-md border border-input bg-background px-4 py-3 text-center font-mono text-lg tracking-widest text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          {error && <p className="text-center text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !keyInput.trim()}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Checking…" : "Unlock"}
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
