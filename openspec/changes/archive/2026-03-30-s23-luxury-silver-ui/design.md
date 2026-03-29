## Context

Current UI: generic Tailwind defaults. All blue accents, `rounded-2xl` everywhere, white cards on gray-50 background. No font branding, no shadow system, no design coherence.

S23 Luxury Silver target: cool silver palette (`#E5E5E5` bg, `#9CA3AF` brand, `#111827` text), Montserrat with wide tracking, 4px radius ("machined"), diffused silver shadows, no warm colors.

Scope is frontend-only. All token values come directly from `UI_style.md`.

## Goals / Non-Goals

**Goals:**
- Apply S23 tokens consistently across all 5 UI states (upload idle, uploading, upload done, download loading/success/error)
- Implement CSS variables as the single source of truth for all design tokens
- Map CSS variables to Tailwind utility classes via `tailwind.config.js`
- Load Montserrat from Google Fonts in `layout.tsx`
- Maintain WCAG AA contrast, visible focus rings, reduced-motion support

**Non-Goals:**
- Adding new sections (hero, pricing, FAQ) — this is an app, not a landing page
- Dark mode variant
- Animations beyond what already exists

## Decisions

### D1: CSS variables as token layer, extended into Tailwind
Define all S23 values as CSS custom properties in `globals.css`. Map them into `tailwind.config.js` under `extend.colors`, `extend.boxShadow`, `extend.borderRadius`, `extend.fontFamily`. This keeps tokens in one place (CSS vars) while allowing Tailwind utility usage in JSX.

```css
:root {
  --color-bg-primary: #E5E5E5;
  --color-bg-secondary: #D1D5DB;
  --color-text-primary: #111827;
  --color-brand-primary: #9CA3AF;
  --color-brand-accent: #6B7280;
  --radius-sm: 4px;
  --shadow-silver: 0 10px 30px rgba(156, 163, 175, 0.2);
}
```

Tailwind mapping:
```js
colors: {
  'silver-bg': 'var(--color-bg-primary)',
  'silver-surface': 'var(--color-bg-secondary)',
  'silver-text': 'var(--color-text-primary)',
  'silver-brand': 'var(--color-brand-primary)',
  'silver-accent': 'var(--color-brand-accent)',
}
```

### D2: Montserrat via Google Fonts `<link>` in layout
Add a `<link rel="preconnect">` + `<link rel="stylesheet">` for Montserrat (weights 300, 400, 600) in `layout.tsx`'s `<head>`. Apply via `font-sans` override in Tailwind config. No next/font — static export doesn't support it without extra config.

### D3: Replace all blue/green accents with silver palette
- Primary action buttons: `bg-[#6B7280]` (silver-accent) with `hover:bg-[#4B5563]`
- Success states: silver checkmark on `bg-[#D1D5DB]` circle (no green)
- Drag-active dropzone: silver border (`border-[#9CA3AF]`) on `bg-[#E5E5E5]`
- Progress bar: `bg-[#6B7280]` fill on `bg-[#D1D5DB]` track
- Error states: keep `#EF4444` red (sufficient contrast on silver background)

### D4: Radius policy — 4px everywhere (machined feel)
Replace all `rounded-xl`, `rounded-2xl`, `rounded-full` with `rounded-[4px]` (or `rounded-sm` if mapped in config). Exception: progress bar track can stay fully rounded for UX clarity.

### D5: Typography — wide tracking, light weight for headings
- H1: `font-light tracking-widest` (maps to weight 300, tracking 0.05em)
- Body/labels: `font-medium tracking-wide`
- All text: `font-sans` (Montserrat)

### D6: Card surface
Replace `bg-white` cards with `bg-[#D1D5DB]` (silver-surface) on `bg-[#E5E5E5]` (silver-bg) body. Card shadow: `shadow-silver` (`0 10px 30px rgba(156,163,175,0.2)`).

## Risks / Trade-offs

- **Contrast on silver-on-silver** → Use `#111827` for all body text; verify AA on `#D1D5DB` background (passes: contrast ratio ~12:1)
- **Montserrat CDN in static build** → Works fine; no SSR dependency
- **4px radius looks sharp** → Intentional per S23 spec; reviewers may find it modern rather than boring
