# Set Up Google Cloud Resources

This document covers everything needed to bring the site from a static GitHub Pages deployment to a full Firebase-backed application, mirroring the architecture of [melinamara.com](https://github.com/melinamara).

---

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**, name it `dcmovieclub`
3. Disable Google Analytics (or enable if you want it)
4. Once created, go to **Project Settings > General** and note:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

5. Create a `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dcmovieclub
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dcmovieclub.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
REVALIDATION_SECRET=<generate-a-random-string>
```

---

## 2. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init
```

Select:
- Firestore
- Storage
- Functions
- Hosting (or App Hosting if using Cloud Run)

---

## 3. Set Up Firestore

### Enable Firestore
1. Firebase Console > **Firestore Database** > Create database
2. Start in **production mode**
3. Choose a region (e.g., `us-east1` for DC proximity)

### Deploy Security Rules

Create `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Site config: public read, admin write
    match /config/{configId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }

    // Admin phone whitelist: admin only
    match /allowedAdminPhones/{phoneNumber} {
      allow read, write: if request.auth.token.admin == true;
    }

    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Deploy:

```bash
firebase deploy --only firestore:rules
```

### Create Firestore Indexes

Create `firestore.indexes.json`:

```json
{
  "indexes": [],
  "fieldOverrides": []
}
```

Deploy:

```bash
firebase deploy --only firestore:indexes
```

### Seed Initial Data

Create the `config/main` document in Firestore with your site's initial configuration structure.

---

## 4. Set Up Cloud Storage

### Enable Storage
1. Firebase Console > **Storage** > Get started
2. Same region as Firestore

### Deploy Storage Rules

Create `storage.rules`:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images: public read, no direct writes (uploads via admin server actions)
    match /images/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }

    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

Deploy:

```bash
firebase deploy --only storage
```

### Storage Bucket Structure

```
gs://dcmovieclub.firebasestorage.app/
├── images/
│   ├── posters/
│   ├── stills/
│   └── events/
```

---

## 5. Set Up Firebase Authentication

1. Firebase Console > **Authentication** > Get started
2. Enable **Phone** sign-in provider
3. Add authorized domains (your production domain)

For phone auth, you'll also need reCAPTCHA — Firebase handles this automatically with their client SDK.

### Admin Claims

Admins are identified by a custom claim `{ admin: true }` set via a Cloud Function `beforeSignIn` hook. The function checks if the signing-in phone number exists in the `allowedAdminPhones` Firestore collection.

### Add First Admin Phone

Use the Firebase Admin SDK (via a local script):

```typescript
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({ credential: cert("path/to/serviceAccount.json") });
const db = getFirestore(app);

await db.collection("allowedAdminPhones").doc("+12025551234").set({});
```

---

## 6. Set Up Cloud Functions

### Initialize Functions

```bash
cd functions
npm install
```

### Functions to Implement

#### a) `beforeSignIn` — Auth Blocking Function

Validates that the phone number exists in `allowedAdminPhones` before allowing sign-in. Sets `admin: true` custom claim.

```typescript
import { beforeUserSignedIn } from "firebase-functions/v2/identity";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

initializeApp();
const db = getFirestore();

export const beforesignin = beforeUserSignedIn(async (event) => {
  const phone = event.data?.phoneNumber;
  if (!phone) throw new Error("Phone number required");

  const doc = await db.collection("allowedAdminPhones").doc(phone).get();
  if (!doc.exists) throw new Error("Unauthorized phone number");

  return { customClaims: { admin: true } };
});
```

#### b) `onConfigChange` — Firestore Trigger

Triggers cache revalidation when `config/main` is updated:

```typescript
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";

const appUrl = defineSecret("APP_URL");
const revalidationSecret = defineSecret("REVALIDATION_SECRET");

export const onconfigchange = onDocumentWritten(
  { document: "config/main", secrets: [appUrl, revalidationSecret] },
  async () => {
    await fetch(`${appUrl.value()}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: revalidationSecret.value() }),
    });
  }
);
```

### Deploy Functions

```bash
firebase deploy --only functions
```

### Set Secrets

```bash
firebase functions:secrets:set APP_URL
firebase functions:secrets:set REVALIDATION_SECRET
```

---

## 7. Set Up Firebase SDK in Next.js

### Client SDK (`src/lib/firebase.ts`)

```typescript
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Admin SDK (`src/lib/firebase-admin.ts`)

```typescript
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

if (getApps().length === 0) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)),
  });
}

export const adminDb = getFirestore();
export const adminStorage = getStorage();
```

---

## 8. Switch from Static Export to SSR

Once Firebase is set up, switch the deployment from GitHub Pages to Google Cloud App Hosting:

1. Remove `output: "export"` from `next.config.js`
2. Remove `images: { unoptimized: true }`
3. Add remote image patterns for Firebase Storage

4. Create `apphosting.yaml`:

```yaml
runConfig:
  minInstances: 0
  maxInstances: 10
  concurrency: 80
  cpu: 1
  memoryMiB: 512

env:
  - variable: NEXT_PUBLIC_FIREBASE_API_KEY
  - variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - variable: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - variable: NEXT_PUBLIC_FIREBASE_APP_ID
  - variable: REVALIDATION_SECRET
    secret: REVALIDATION_SECRET
```

5. Create `.firebaserc`:

```json
{
  "projects": {
    "default": "dcmovieclub"
  }
}
```

6. Create `firebase.json`:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": {
    "source": "functions",
    "codebase": "default",
    "ignore": ["node_modules", ".git"]
  }
}
```

7. Set up App Hosting in Firebase Console, linking to your GitHub repo

8. Disable the GitHub Pages workflow (or delete `.github/workflows/deploy.yml`)

---

## 9. Add Revalidation API Route

Create `src/app/api/revalidate/route.ts`:

```typescript
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("site-config");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
```

---

## 10. Image Processing (Sharp)

For admin image uploads, install Sharp and create processing utilities:

```bash
npm install sharp
```

Implement variants:
- **full**: original dimensions, 85% WebP quality
- **large**: 2400px wide, 85% quality
- **medium**: 1920px wide, 85% quality
- **small**: 1200px wide, 80% quality
- **blur**: 20px wide, 20% quality (placeholder)

Upload all variants to Cloud Storage under `images/<category>/`.

---

## 11. Dependencies to Add

When transitioning to the full backend, add these packages:

```bash
# Firebase
npm install firebase firebase-admin

# Server state management
npm install @tanstack/react-query

# Image processing (server-side)
npm install sharp

# Cloud Functions (in functions/ directory)
cd functions && npm install firebase-functions firebase-admin
```

---

## 12. GitHub Secrets (for CI/CD)

If using GitHub Actions for any Firebase operations, set these repository secrets:

- `FIREBASE_SERVICE_ACCOUNT` — JSON service account key
- `FIREBASE_PROJECT_ID` — `dcmovieclub`

---

## Summary Checklist

- [ ] Create Firebase project
- [ ] Enable Firestore, Storage, Authentication
- [ ] Deploy security rules (Firestore + Storage)
- [ ] Set up Cloud Functions (`beforeSignIn`, `onConfigChange`)
- [ ] Configure secrets (`APP_URL`, `REVALIDATION_SECRET`)
- [ ] Add Firebase SDK to Next.js (client + admin)
- [ ] Seed initial Firestore data
- [ ] Switch from static export to SSR (App Hosting)
- [ ] Set up image processing pipeline
- [ ] Add first admin phone number
- [ ] Test end-to-end: auth, admin, data updates, cache revalidation
