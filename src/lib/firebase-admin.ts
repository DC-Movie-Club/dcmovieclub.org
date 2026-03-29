import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";

function ensureInitialized() {
  if (getApps().length > 0) return;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!projectId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set");
  }

  try {
    initializeApp({
      credential: applicationDefault(),
      projectId,
      storageBucket,
    });
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK");
    console.error(
      "Make sure you are logged in with: gcloud auth application-default login"
    );
    throw error;
  }
}

export function getAdminDb() {
  ensureInitialized();
  return getFirestore();
}

export function getAdminStorage() {
  ensureInitialized();
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName)
    throw new Error("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set");
  return getStorage().bucket(bucketName);
}

export function getAdminAuth() {
  ensureInitialized();
  return getAuth();
}
