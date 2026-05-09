import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2 } from "lucide-react";

const FREEIMAGE_API_KEY = "6d207e02198a847aa98d0a2a901485a5";

async function uploadToFreeimage(file: File): Promise<string> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const result = r.result as string;
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
  const res = await fetch("https://freeimage.host/api/1/upload", { method: "POST", body: form });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const json = await res.json();
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteUrl, setPasteUrl] = useState("");

  const handleFile = async (f?: File) => {
    if (!f) return;
    setError(null);
    // Save data URL first so it always appears
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(f);

    setUploading(true);
    try {
      const hosted = await uploadToFreeimage(f);
      onChange(hosted);
    } catch (e) {
      // Non-fatal — local data URL already saved
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  const box = aspect === "portrait" ? "h-32 w-24" : "h-20 w-full";
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-3">
        <div className={`${box} flex items-center justify-center overflow-hidden rounded-md border border-border bg-muted`}>
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-muted-foreground">No image</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <input
            ref={ref}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button type="button" size="sm" variant="outline" onClick={() => ref.current?.click()} disabled={uploading}>
            {uploading ? (
              <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Uploading…</>
            ) : (
              <><Upload className="mr-1 h-3 w-3" /> Upload</>
            )}
          </Button>
          {value && (
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange(undefined)}>
              <X className="mr-1 h-3 w-3" /> Remove
            </Button>
          )}
          <Input
            type="url"
            placeholder="…or paste image URL"
            value={pasteUrl}
            onChange={(e) => {
              setPasteUrl(e.target.value);
              const v = e.target.value.trim();
              if (/^https?:\/\//i.test(v)) onChange(v);
            }}
            className="h-8 text-xs"
          />
          {error && <p className="text-[10px] text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
