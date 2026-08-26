# Troubleshooting

- Blank map: verify internet access to the free tile provider. Site records remain usable without it.
- Browser-only submission missing elsewhere: localStorage is device/browser-specific by design.
- Demo error/empty screen: open Demo Controls and select Normal demo.
- Approval unavailable: switch Demo Role to Admin. This is UX simulation only.
- Theme flash: allow next-themes hydration; avoid rendering theme-dependent server markup.
- Vercel mismatch: use npm run build:vercel and Node 22.13 or newer.
- Sites mismatch: use npm run build; keep Vite and hosting configuration intact.
