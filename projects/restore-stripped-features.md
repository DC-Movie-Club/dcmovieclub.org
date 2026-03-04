# Restore Stripped Features

Features from the [melinamara.com](https://github.com/melinamara) template that were removed for the initial static deploy. This document describes each feature, the dependencies it requires, and how to add it back.

See also: [setup-google-cloud-resources.md](./setup-google-cloud-resources.md) for the infrastructure these features depend on.

---

## 1. Server-Side Rendering (SSR) & Incremental Static Regeneration (ISR)

**What was stripped:** The site currently uses `output: "export"` for static HTML. This disables API routes, server actions, and dynamic rendering.

**To restore:**
1. Remove `output: "export"` and `images: { unoptimized: true }` from `next.config.js`
2. Add remote image patterns for Firebase Storage
3. Switch deployment from GitHub Pages to Google Cloud App Hosting (see infrastructure doc)
4. Use `unstable_cache()` with tags for Firestore queries
5. Add `revalidateTag()` calls for on-demand cache invalidation

---

## 2. Firebase Client SDK

**What was stripped:** No Firebase SDK is included. Data is currently static.

**To restore:**
1. `pnpm add firebase`
2. Create `src/lib/firebase.ts`:
   - Initialize Firebase app with env vars
   - Export `auth` (getAuth) and `db` (getFirestore)
3. Add `NEXT_PUBLIC_FIREBASE_*` env vars to `.env.local`

---

## 3. Firebase Admin SDK (Server-Side)

**What was stripped:** No server-side Firebase access.

**To restore:**
1. `pnpm add firebase-admin`
2. Create `src/lib/firebase-admin.ts`:
   - Initialize with service account credentials
   - Export `adminDb` (Firestore) and `adminStorage` (Storage)
3. Use in server components and server actions only

---

## 4. Phone Authentication & Admin Auth

**What was stripped:** No authentication system.

**Dependencies:** Firebase Auth, Cloud Functions (`beforeSignIn` hook), Firestore (`allowedAdminPhones` collection)

**To restore:**
1. `pnpm add react-phone-number-input`
2. Create `src/app/admin/components/PhoneAuth.tsx`:
   - Phone number input with country code
   - OTP verification via Firebase Auth
   - reCAPTCHA verifier
3. Create `src/app/admin/hooks/useAuth.ts`:
   - Track Firebase auth state
   - Expose `signOut()`, `refreshToken()`
   - Check `admin` custom claim on token
4. Deploy the `beforeSignIn` Cloud Function (see infrastructure doc)

---

## 5. Admin Dashboard

**What was stripped:** The entire `/admin` route and all admin components.

**Dependencies:** Auth (above), Firebase client SDK, React Query, dnd-kit, MDXEditor

**To restore:**
1. Create `src/app/admin/page.tsx` — tabbed dashboard (Galleries/Homepage/Permissions)
2. Add admin components:
   - `GalleryManagement.tsx` — CRUD for galleries, drag-and-drop photo reordering
   - `HomepageSettings.tsx` — featured photos, default gallery, about page editor
   - `PhotoUpload.tsx` — file dropzone with progress
   - `PhoneManagement.tsx` — manage authorized admin phone numbers
3. Add admin hooks:
   - `useSiteConfig.ts` — React Query hooks for Firestore CRUD
4. Dependencies:
   ```bash
   pnpm add @tanstack/react-query @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @mdxeditor/editor react-dropzone
   ```

---

## 6. Server Actions (Image Upload)

**What was stripped:** No server-side image processing or upload pipeline.

**Dependencies:** Firebase Admin SDK, Sharp, Cloud Storage

**To restore:**
1. `pnpm add sharp`
2. Create `src/app/admin/actions/uploadPhoto.ts` (Next.js server action):
   - Accept FormData with file + auth token
   - Verify admin auth via ID token
   - Process image into variants using Sharp:
     - `full` — original dimensions, 85% WebP
     - `large` — 2400px, 85% WebP
     - `medium` — 1920px, 85% WebP
     - `small` — 1200px, 80% WebP
     - `blur` — 20px, 20% WebP (placeholder)
   - Upload all variants to Cloud Storage
3. Create `src/app/admin/lib/imageProcessing.ts` for the Sharp pipeline

---

## 7. Progressive Image Loading

**What was stripped:** No lazy-loading or blur placeholder images.

**Dependencies:** Cloud Storage image variants (above)

**To restore:**
1. Create `src/components/ProgressiveImage.tsx`:
   - Load blur placeholder first (tiny WebP)
   - Swap to full image on load
   - Responsive `srcset` with size variants
   - Error fallback
2. Add `getVariantUrls()` helper to `src/lib/firebase.ts` to construct CDN URLs for each variant

---

## 8. Photo Gallery / Carousel

**What was stripped:** No gallery viewer or photo navigation.

**To restore:**
1. `pnpm add yet-another-react-lightbox`
2. Create `src/components/PhotoDisplay.tsx`:
   - Full-screen photo carousel
   - Arrow key navigation
   - Swipe support on mobile
3. Create `src/components/GalleryClient.tsx`:
   - Gallery grid/list view
   - Click-to-expand into PhotoDisplay
4. Add dynamic route `src/app/gallery/[[...slug]]/page.tsx`

---

## 9. Keyboard Shortcuts

**What was stripped:** No global keyboard handling.

**To restore:**
1. Create `src/components/GlobalKeyHandler.tsx`:
   - Arrow keys for photo navigation
   - Escape to close lightbox/modals
2. Add to root layout

---

## 10. Scroll Progress Tracking

**What was stripped:** No scroll-based UI effects.

**To restore:**
1. Create `src/hooks/useScrollProgress.ts`:
   - Track scroll position as 0-1 value
   - Used for background fade effects on home page

---

## 11. Cache Revalidation API Route

**What was stripped:** No API routes (incompatible with static export).

**Dependencies:** SSR mode, `REVALIDATION_SECRET` env var

**To restore:**
1. Create `src/app/api/revalidate/route.ts`:
   - POST endpoint that validates secret
   - Calls `revalidateTag('site-config')`
   - Called by `onConfigChange` Cloud Function

---

## 12. Dynamic Sitemap

**What was stripped:** No dynamic sitemap generation.

**Dependencies:** SSR mode, Firestore data

**To restore:**
1. Create `src/app/sitemap.ts`:
   - Fetch all galleries from Firestore
   - Generate sitemap entries for each page and gallery

---

## 13. Radix UI / shadcn Components

**What was stripped:** No UI component library.

**To restore:**
```bash
pnpm add @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-tabs @radix-ui/react-slot class-variance-authority tailwindcss-animate
```

Create `src/components/ui/` with shadcn-style wrappers around Radix primitives.

---

## 14. Custom Fonts

**What was stripped:** Using system fonts only.

**To restore:**
1. Add font files to `public/fonts/`
2. Load via `next/font/local` in `src/app/layout.tsx`
3. Set CSS variables (`--font-sans`, `--font-display`, etc.)
4. Reference in `tailwind.config.js` fontFamily

---

## 15. SEO & Structured Data

**What was stripped:** Basic metadata only, no JSON-LD.

**To restore:**
1. Add Open Graph image to `public/og-image.jpg`
2. Add to layout metadata:
   - `openGraph` with image, type, locale
   - `twitter` card config
3. Add JSON-LD script in layout:
   - `WebSite` schema
   - `Organization` schema
4. Add per-page `generateMetadata()` functions for dynamic titles/descriptions

---

## Dependency Summary

All additional packages needed to restore everything:

```bash
# Firebase
pnpm add firebase firebase-admin

# UI components
pnpm add @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-tabs @radix-ui/react-slot class-variance-authority tailwindcss-animate

# Icons
pnpm add iconoir-react  # (lucide-react already included)

# Admin features
pnpm add @tanstack/react-query @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @mdxeditor/editor react-dropzone react-phone-number-input

# Image processing
pnpm add sharp

# Gallery
pnpm add yet-another-react-lightbox

# Markdown rendering
pnpm add react-markdown

# Utilities
pnpm add react-use
```
