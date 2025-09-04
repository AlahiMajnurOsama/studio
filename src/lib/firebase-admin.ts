
import admin from 'firebase-admin';

// This is a server-only file.

// Re-construct the service account object from individual environment variables
// to avoid JSON parsing issues with multi-line keys.
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  // The private key is the tricky one. We need to replace the escaped newlines.
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: 'googleapis.com',
};

let adminApp: admin.app.App | null = null;

function initializeAdminApp() {
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error('Firebase Admin environment variables are not set. Cannot initialize Firebase Admin.');
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
    throw new Error('Could not initialize Firebase Admin SDK. Please ensure the Firebase environment variables in your .env file are correct.');
  }
}

export function initAdmin() {
  if (admin.apps.length > 0) {
    console.log('Firebase Admin SDK already initialized.');
    return admin.apps[0]!;
  }
  
  if (!adminApp) {
      adminApp = initializeAdminApp();
      console.log('Firebase Admin SDK initialized successfully.');
  }
  
  return adminApp;
}
