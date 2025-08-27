
import admin from 'firebase-admin';

// This is a server-only file.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

let adminApp: admin.app.App | null = null;

function initializeAdminApp() {
  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Cannot initialize Firebase Admin.');
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
    throw new Error('Could not initialize Firebase Admin SDK. Please ensure the FIREBASE_SERVICE_ACCOUNT in your .env file is a valid, single-line JSON string.');
  }
}

export function initAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }
  
  if (!adminApp) {
      adminApp = initializeAdminApp();
  }
  
  return adminApp;
}
