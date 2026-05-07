import { Delete } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  title: string;
  subtitle: string;
  error?: string | null;
};

export function PasscodeKeypad({ value, onChange, length = 4, title, subtitle, error }: Props) {
  const press = (digit: string) => {
    if (value.length < length) onChange(value + digit);
  };
  const back = () => onChange(value.slice(0, -1));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

      <div className="mt-8 flex gap-4">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full border-2 ${
              i < value.length ? "border-foreground bg-foreground" : "border-muted-foreground/40"
            }`}
          />
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-10 grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => press(String(n))}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-foreground transition hover:bg-muted/70 active:scale-95"
          >
            {n}
          </button>
        ))}
        <div className="h-16 w-16" />
        <button
          type="button"
          onClick={() => press("0")}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-foreground transition hover:bg-muted/70 active:scale-95"
        >
          0
        </button>
        <button
          type="button"
          onClick={back}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/70 active:scale-95"
          aria-label="Delete"
        >
          <Delete className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
