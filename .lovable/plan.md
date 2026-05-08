## Goal
Replace the hardcoded `vicroadsgov.biz` domain in the QR code flow with `happydomain.com`.

## Changes

1. **`src/routes/licence.tsx`** (around line 88)
   - Update the QR payload base URL from `https://vicroadsgov.biz/verify?...` to `https://happydomain.com/verify?...`.

2. **`src/components/QrRevealDialog.tsx`** (around line 31)
   - Update the same base URL to `https://happydomain.com/verify?...`.

3. **Search for any other references** to `vicroadsgov.biz` or `happy-replication-tool.lovable.app` across the codebase and update them to `happydomain.com` for consistency.

## Notes
- Domain stays hardcoded (no settings UI), per your earlier choice.
- This is a frontend-only change — no backend, schema, or env changes.
- After deploying, regenerate / re-scan the QR to confirm the new URL appears.
- DNS / hosting for `happydomain.com` itself is out of scope here; this only changes what the QR encodes.
