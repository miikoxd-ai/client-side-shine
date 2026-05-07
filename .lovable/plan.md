## Goal

Bring `/licence` in line with the two official DDL "what to look for" / "how to check" guides. Matches the reference screenshot (Madeline Citizen) exactly in structure.

## Changes

### 1. `src/store/licence.ts` — extend Licence model
- Add `cardNumber: string` (e.g. `"A1234567B"`).
- Add `licenceStatus: "Current" | "Expired" | "Suspended"`.
- Add `issueDate: string` (ISO).
- Add `conditions: string[]` (e.g. `["A", "I"]`).
- Map letter → label in a helper: `A → Automatic transmission`, `I → Alcohol interlock device`, `B → Bioptic telescopic lens`, `S → Special` (small built-in dictionary).
- Defaults populated for John Citizen.
- Add to `EditLicenceDialog` only if it already covers similar fields (otherwise leave untouched — out of scope).

### 2. `src/routes/licence.tsx` — Licence tab restructure
Match the reference layout below the green hero:

```text
MADELINE CITIZEN
Licence number       Expiry
Licence type         Date of birth
Address
Signature
─────────────
Car licence details
  Licence status   ✓ Current   (green tick)
  Proficiency      Full
  Issue date       20 May 2020
  Expiry           20 May 2030
─────────────
Other details
  Conditions
    A  Automatic transmission
    I  Alcohol interlock device
  Card number
    ••••••••  👁  ← tap to reveal real number
  Victoria Police barcode
    ▮▯▮▯▮▯▮▯ (CSS-rendered Code 128-style stripes)
```

- Card-number row uses `useState` for visibility; eye icon (lucide `Eye` / `EyeOff`).
- Police barcode rendered as a div of randomly-generated black bars (deterministic from licence number) — not a real barcode, just visual.

### 3. Identity tab — match guide
Per "How-to" guide, Identity = **photo + full name + address + signature only** (no DOB).
- Render large photo on left, name as heading, address, signature image. Remove DOB from this tab.

### 4. Age tab — match guide
Per guide, Age = **photo + "Over 18" / "Under 18" status only**, no DOB or exact age.
- Remove DOB field and giant age number.
- Show photo + a green pill `✓ Over 18` (or red `Under 18`).

### 5. Hero card — hologram shimmer
Add a subtle animated Victorian Coat-of-Arms-style hologram overlay on the photo:
- Absolutely-positioned `div` over photo with a conic/linear gradient + `mix-blend-overlay`, animated with `@keyframes shimmer` (translate + hue rotate, 4s loop).
- A faint SVG crown/shield watermark centred on the photo at ~25% opacity.
- Pure CSS, no asset.

### 6. Pull-to-refresh
- On the scroll container, detect `touchstart` / `touchmove` when `scrollTop === 0`; if pulled > 70px and released, trigger refresh:
  - Briefly show a spinner under the header ("Refreshing…").
  - After 600 ms, set `now = new Date()` and toast "Licence refreshed".
- Desktop fallback: small refresh icon button next to "Last refreshed:" label.

### 7. Last-refreshed timestamp format
Already updates per second; keep current `en-AU` formatter — no change needed.

## Out of scope
- Bottom nav (already fixed previously).
- QR reveal sheet (already implemented).
- Editing flows for the new fields beyond sensible defaults.

## Files touched
- `src/store/licence.ts` — model + defaults + condition-label helper.
- `src/routes/licence.tsx` — Licence/Identity/Age tabs, hologram, pull-to-refresh, card-number eye toggle, police barcode.
