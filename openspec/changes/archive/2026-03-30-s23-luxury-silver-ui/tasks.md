## 1. Token Layer & Config

- [x] 1.1 Add S23 CSS custom properties to `frontend/src/app/globals.css`: all color, radius, and shadow tokens; add `prefers-reduced-motion` rule disabling transitions
- [x] 1.2 Update `frontend/tailwind.config.js` to extend theme with S23 color aliases (`silver-bg`, `silver-surface`, `silver-text`, `silver-brand`, `silver-accent`), `shadow-silver`, `rounded-sm` → 4px, and Montserrat as `fontFamily.sans`
- [x] 1.3 Update `frontend/src/app/layout.tsx` to add Google Fonts `<link>` tags for Montserrat (weights 300, 400, 600) and apply `font-sans` to `<body>`

## 2. Upload Page Restyle (`page.tsx`)

- [x] 2.1 Replace body/page background with `bg-silver-bg`; replace card `bg-white` with `bg-silver-surface`, `shadow-silver`, `rounded-[4px]`
- [x] 2.2 Restyle heading: `font-light tracking-widest text-silver-text` (Montserrat 300)
- [x] 2.3 Restyle dropzone: silver border colors (`border-silver-brand` idle, `border-silver-accent` drag-active, `border-silver-brand` file-selected); silver icon color; 4px radius
- [x] 2.4 Restyle expiry selector: `bg-silver-surface` unselected, `bg-silver-accent text-white` selected, `rounded-[4px]` on all buttons
- [x] 2.5 Restyle progress bar: `bg-silver-surface` track, `bg-silver-accent` fill
- [x] 2.6 Restyle primary upload button: `bg-silver-accent hover:bg-[#4B5563] rounded-[4px]`; replace `rounded-xl` → `rounded-[4px]` everywhere on the page
- [x] 2.7 Restyle upload success screen: silver-surface card, silver-surface icon circle (no green), wide-tracked heading, silver-bg link field, silver-accent Copy button

## 3. Download Page Restyle (`DownloadClient.tsx`)

- [x] 3.1 Restyle loading spinner: change border from `border-blue-600` to `border-silver-accent`
- [x] 3.2 Restyle download success card: silver-surface background, silver-surface icon circle (no blue), wide-tracked heading, silver-accent "Share Your Own Files" button
- [x] 3.3 Restyle error card: silver-surface background, red warning icon (keep red for error semantics), silver-accent "Upload a new file" button; replace all `rounded-xl`/`rounded-2xl` with `rounded-[4px]`

## 4. Verification

- [x] 4.1 Rebuild frontend image and confirm all five UI states render with S23 palette (no blue, no green, no `rounded-2xl`)
- [x] 4.2 Verify focus rings visible on keyboard navigation; verify Montserrat loads
