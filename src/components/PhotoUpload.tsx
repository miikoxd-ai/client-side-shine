import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

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
  useEffect(() => {
    setUrl(value && /^https?:\/\//i.test(value) ? value : "");
  }, [value]);
  const handleFile = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(f);
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
        <div className="flex flex-col gap-1">
          <input
            ref={ref}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button type="button" size="sm" variant="outline" onClick={() => ref.current?.click()}>
            <Upload className="mr-1 h-3 w-3" /> Upload
          </Button>
          {value && (
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
      </div>
    </div>
  );
}
