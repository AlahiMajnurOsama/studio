
import admin from 'firebase-admin';

// This is a server-only file.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

let adminApp: admin.app.App;

export async function initAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Cannot initialize Firebase Admin.');
  }

  try {
     adminApp = admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
    return adminApp;
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
    throw new Error('Could not initialize Firebase Admin SDK.');
  }
}
