import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { VicRoadsLogo } from "@/components/VicRoadsLogo";
import licenceBgImg from "@/assets/licence-bg.png";
import coatOfArmsOverlayImg from "@/assets/coat_of_arms_white_overlay.png";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify licence — VicRoads Digital Licence" },
      {
        name: "description",
        content: "Verify a Victorian digital driver licence.",
      },
    ],
  }),
  component: VerifyPage,
});

type Proficiency = "Full" | "Probationary P1" | "Probationary P2" | "Learner";

function normaliseProficiency(raw: string | null): Proficiency {
  if (!raw) return "Full";
  const v = raw.trim().toLowerCase();
  if (v === "full") return "Full";
  if (v === "p1" || v === "probationary p1" || v === "probationaryp1")
    return "Probationary P1";
  if (v === "p2" || v === "probationary p2" || v === "probationaryp2")
    return "Probationary P2";
  if (v === "l" || v === "learner" || v === "learner permit") return "Learner";
  return "Full";
}

function proficiencyBadge(p: Proficiency): {
  label: string;
  bannerClass: string;
  chip: { letter: string; bgClass: string } | null;
} {
  switch (p) {
    case "Full":
      return { label: "FULL DRIVER LICENCE", bannerClass: "bg-green-700", chip: null };
    case "Probationary P1":
      return {
        label: "PROBATIONARY DRIVER LICENCE",
        bannerClass: "bg-red-600",
        chip: { letter: "P", bgClass: "bg-red-600" },
      };
    case "Probationary P2":
      return {
        label: "PROBATIONARY DRIVER LICENCE",
        bannerClass: "bg-red-600",
        chip: { letter: "P", bgClass: "bg-green-600" },
      };
    case "Learner":
      return {
        label: "LEARNER PERMIT",
        bannerClass: "bg-yellow-500",
        chip: { letter: "L", bgClass: "bg-yellow-500" },
      };
  }
}

function formatTimestamp(d: Date) {
  const day = d.getDate();
  const month = d.toLocaleString("en-AU", { month: "long" });
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${day} ${month} ${year} ${hours}:${minutes}${ampm}`;
}

function PlaceholderAvatar() {
  return (
    <svg viewBox="0 0 100 120" className="h-full w-full" aria-label="Photo placeholder">
      <rect width="100" height="120" fill="#cbd5e1" />
      <circle cx="50" cy="48" r="20" fill="#94a3b8" />
      <path d="M20 120 C20 90 35 78 50 78 C65 78 80 90 80 120 Z" fill="#94a3b8" />
    </svg>
  );
}

function VerifyPage() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [proficiency, setProficiency] = useState<Proficiency>("Full");
  const [now, setNow] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const handleScanAnother = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      setNow(new Date());
      setScanning(false);
      toast.success("Verified");
    }, 900);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const photoParam = params.get("photo");
    setName(params.get("name") ?? "");
    setPhoto(photoParam);
    setProficiency(normaliseProficiency(params.get("proficiency")));
    setNow(new Date());

    const preload = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });

    const sources = [licenceBgImg, coatOfArmsOverlayImg];
    if (photoParam) sources.push(photoParam);

    let cancelled = false;
    const minDelay = new Promise((r) => setTimeout(r, 700));
    Promise.all([Promise.all(sources.map(preload)), minDelay]).then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const badge = proficiencyBadge(proficiency);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <span
          className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-green-600/20 border-t-green-600"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-muted/40">
      <div className="flex w-full max-w-[440px] flex-col bg-background shadow-xl animate-slide-up-reveal">
        <div className="grid grid-cols-3 items-center px-5 pt-6 pb-4">
          <a
            href="https://www.vicroads.vic.gov.au/"
            className="justify-self-start text-sm font-semibold text-orange-500"
          >
            Close
          </a>
          <h1 className="justify-self-center text-base font-bold">Verify details</h1>
          <div />
        </div>

        <div className="flex flex-col items-center gap-2 pb-6">
          <p className="text-lg font-semibold">Over 18</p>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white">
            <Check className="h-7 w-7" strokeWidth={3} />
          </span>
        </div>

        <div>
          <div className={`flex items-center justify-between px-5 py-3 text-white ${badge.bannerClass}`}>
            <div className="flex items-center gap-2">
              {badge.chip && (
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-sm text-xs font-bold text-white ${badge.chip.bgClass}`}
                >
                  {badge.chip.letter}
                </span>
              )}
              <div>
                <p className="text-sm font-bold tracking-wide">{badge.label}</p>
                <p className="text-[11px] italic opacity-90">Victoria Australia</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <VicRoadsLogo size={26} />
              <span className="text-sm font-semibold tracking-tight">VicRoads</span>
            </div>
          </div>

          <div
            className="relative px-5 py-6"
            style={{
              backgroundImage: `url(${licenceBgImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {[
              { left: "12.5%", top: "25%" },
              { left: "12.5%", top: "75%" },
              { left: "37.5%", top: "50%" },
              { left: "62.5%", top: "25%" },
              { left: "62.5%", top: "75%" },
              { left: "87.5%", top: "50%" },
            ].map((pos, i) => (
              <img
                key={i}
                src={coatOfArmsOverlayImg}
                alt=""
                aria-hidden
                className="pointer-events-none absolute z-10 h-20 w-20 -translate-x-1/2 -translate-y-1/2 opacity-25"
                style={{ left: pos.left, top: pos.top }}
              />
            ))}

            <div className="relative mx-auto flex aspect-[4/5] w-[49.5%] items-center justify-center overflow-hidden rounded-md bg-muted shadow-md">
              {photo && !photoFailed ? (
                <img
                  src={photo}
                  alt={name || "Cardholder"}
                  className="h-full w-full object-cover"
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <PlaceholderAvatar />
              )}
            </div>
          </div>
        </div>

        <p className="mx-5 mt-5 text-center text-lg font-bold uppercase tracking-wide text-foreground">
          {name || "—"}
        </p>

        <div className="mx-5 mt-3 rounded-md border border-border bg-muted/40 px-4 py-3 text-center">
          <div className="flex flex-col items-center gap-1 text-sm">
            <span className="text-muted-foreground">Details verified with</span>
            <span className="inline-flex items-center gap-1 font-semibold">
              <VicRoadsLogo size={18} />
              VicRoads
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {now ? formatTimestamp(now) : ""}
          </p>
        </div>

        <div className="px-5 pb-8 pt-5">
          <label className="block w-full cursor-pointer rounded-md border-2 border-orange-500 py-3 text-center text-sm font-semibold text-orange-500 transition hover:bg-orange-500/5">
            Scan another
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleScanAnother}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
