
# VicState ID App Clone

Recreate the Victorian digital driver licence app shown at vicstate-id-app.base44.app, including the hidden "double-click the logo to edit licence details" admin feature.

## Screens & routes

```
/            -> Passcode gate (create on first run, enter thereafter) → Home
/vehicles    -> Registered vehicles
/licence     -> Licence "View details" with Licence/Identity/Age tabs + QR reveal
/payments    -> Payments (empty state)
/profile     -> Profile summary
```

Shared bottom tab bar on Home, Vehicles, Licence, Payments, Profile. Mobile-first centered column (~420px max width) on a light grey background.

## Home screen
- Header: VicRoads logo (small green chevron) + "Hi {firstName}".
- Cards: "Demerit point balance" and "Registered vehicles".
- Bottom dark card "My licence — Tap to view licence" → `/licence`.

## Licence screen (`/licence`)
- Red banner: "PROBATIONARY DRIVER LICENCE / Victoria Australia".
- Photo placeholder + consent panel with **Reveal QR code** button.
- Tabs: **Licence** (full details + Car learner permit block), **Identity** (name/DOB/address), **Age** (computed from DOB, big number in green card).
- **Reveal QR code** → modal with a generated QR (encodes a JSON payload of the shared fields), a live 2-minute countdown, and the bullet list of what's being shared.

## Demerit / Vehicles / Payments / Profile
- Demerit detail page: current balance / 12, info block, status message.
- Vehicles: list + "Add vehicle" (opens dialog to add rego, make, model, year).
- Payments: empty state icon + copy.
- Profile: avatar, name, "Car Licence holder", and the same licence fields (wired to the same store so they stay in sync — fixing the bug noticed in the original).

## Hidden edit mode (the requested feature)
- Double-clicking the VicRoads logo (anywhere it appears — Home header is the primary spot) opens an **Edit Licence Details** dialog.
- Form fields: First name, Middle initial, Last name, Licence number, Licence type (Car/Motorcycle/Heavy), Proficiency (Full / Probationary P1 / Probationary P2 / Learner), DOB, Expiry, Address (street, suburb, state, postcode), Permit status, Permit issue date, Photo URL (optional), Signature data URL (optional), Demerit points, Vehicles list.
- Save persists to the store; all screens (Home greeting, Licence card colour/label, Identity, Age, Profile, QR payload) update immediately.
- Reset button to restore default "John Citizen" sample data.
- The licence banner colour + "P" badge derive from proficiency (Full = green, P1 = red, P2 = green, Learner = yellow), matching the original's visual language.

## Data & persistence
- Single Zustand store (`useLicenceStore`) holding the licence object + passcode hash + unlock state.
- Persisted to `localStorage` so refresh keeps the passcode and edits.
- Passcode stored as a SHA-256 hash (Web Crypto), not plaintext.
- Age is derived from DOB at render time.
- QR payload is `JSON.stringify({ name, dob, address, licenceNumber, type, expiry, status, proficiency, issuedAt: Date.now() })` rendered with the `qrcode` npm package; expires after 120s and the modal auto-closes.

## Technical details

Stack: TanStack Start (existing), Tailwind v4, shadcn/ui (Dialog, Tabs, Button, Input, Select, Card already present).

New files:
- `src/routes/index.tsx` — passcode gate + home (replaces placeholder).
- `src/routes/licence.tsx`, `src/routes/vehicles.tsx`, `src/routes/payments.tsx`, `src/routes/profile.tsx`, `src/routes/demerit.tsx`.
- `src/components/BottomNav.tsx` — shared tab bar with TanStack `<Link>`s.
- `src/components/VicRoadsLogo.tsx` — logo with `onDoubleClick` to open edit dialog.
- `src/components/EditLicenceDialog.tsx` — form dialog driven by the store.
- `src/components/QrRevealDialog.tsx` — QR + countdown.
- `src/components/PasscodeKeypad.tsx` — 4-dot indicator + 3×4 numeric pad.
- `src/store/licence.ts` — Zustand store with persist middleware.
- `src/lib/passcode.ts` — hash helper.

Dependencies to add: `zustand`, `qrcode`, `@types/qrcode`.

Each route sets its own `head()` (title/description/og) per the route-architecture rules. The hidden edit feature works on every screen because the logo component is reused.

Defaults match the original sample: John M Citizen, licence 012345678, DOB 20 Nov 2000, expiry 10 Dec 2026, 180 Lonsdale St Melbourne VIC 3000, Car / Probationary, 0 demerit points, no vehicles.
