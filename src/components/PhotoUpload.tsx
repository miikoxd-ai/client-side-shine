import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2 } from "lucide-react";

const FREEIMAGE_API_KEY = "6d207e02198a847aa98d0a2a901485a5";

async function uploadToFreeimage(file: File): Promise<string> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const result = r.result as string;
      // strip data:*;base64, prefix
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const form = new FormData();
  form.append("key", FREEIMAGE_API_KEY);
  form.append("action", "upload");
  form.append("source", base64);
  form.append("format", "json");
  const res = await fetch("https://freeimage.host/api/1/upload", {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const json = await res.json();
  // Prefer direct image hotlink (image.image.url), then image.url, then thumb/medium fallbacks
  const url =
    json?.image?.image?.url ||
    json?.image?.url ||
    json?.image?.medium?.url ||
    json?.image?.thumb?.url;
  if (!url) throw new Error("No direct image URL returned from freeimage.host");
  return url as string;
}

export function PhotoUpload({
  label,
  value,
  onChange,
  aspect = "portrait",
}: {
  label: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  aspect?: "portrait" | "wide";
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(value && /^https?:\/\//i.test(value) ? value : "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setUrl(value && /^https?:\/\//i.test(value) ? value : "");
  }, [value]);
  const fileToDataUrl = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(f);
    });
  const handleFile = async (f?: File) => {
    if (!f) return;
    setError(null);
    setUploading(true);
    try {
      // Always store a local data URL first so the photo is guaranteed to appear.
      const dataUrl = await fileToDataUrl(f);
      onChange(dataUrl);
      setUrl("");
      // Best-effort: try to also get a hosted URL (used for QR sharing). Failure is non-fatal.
      try {
        const hostedUrl = await uploadToFreeimage(f);
        onChange(hostedUrl);
        setUrl(hostedUrl);
      } catch {
        // ignore — local data URL already saved
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const box = aspect === "portrait" ? "h-32 w-24" : "h-20 w-full";
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-3">
        <div className={`${box} flex items-center justify-center overflow-hidden rounded-md border border-border bg-muted`}>
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : value ? (
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-muted-foreground">No image</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            ref={ref}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              if (ref.current) ref.current.value = "";
            }}
          />
          <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => ref.current?.click()}>
            {uploading ? (
              <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Uploading…</>
            ) : (
              <><Upload className="mr-1 h-3 w-3" /> Upload</>
            )}
          </Button>
          {value && !uploading && (
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange(undefined)}>
              <X className="mr-1 h-3 w-3" /> Remove
            </Button>
          )}
        </div>
      </div>
      <div className="mt-2">
        <Input
          type="url"
          placeholder="Or paste image URL (optional)"
          value={url}
          onChange={(e) => {
            const v = e.target.value;
            setUrl(v);
            const trimmed = v.trim();
            if (!trimmed) onChange(undefined);
            else if (/^https?:\/\//i.test(trimmed)) onChange(trimmed);
          }}
          className="text-xs"
        />
        {error && <p className="mt-1 text-[10px] text-destructive">{error}</p>}
      </div>
    </div>
  );
}
