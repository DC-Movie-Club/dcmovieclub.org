export const authConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: "AdminSession",
  cookieSignatureKeys: [process.env.COOKIE_SECRET!],
  serviceAccount: {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(
      /\\n/g,
      "\n"
    ),
  },
};
