'use server';

import { initAdmin } from '@/lib/firebase-admin';

export async function getAllUsers() {
  try {
    const adminApp = initAdmin();
    const userRecords = await adminApp.auth().listUsers();
    const users = userRecords.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      customClaims: user.customClaims,
    }));
    return { success: true, users };
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}

export async function deleteUser(uid: string) {
  try {
    const adminApp = initAdmin();
    await adminApp.auth().deleteUser(uid);
    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting user ${uid}:`, error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}

export async function updateUser(uid: string, data: { displayName?: string, email?: string }) {
  try {
    const adminApp = initAdmin();
    await adminApp.auth().updateUser(uid, data);
    return { success: true };
  } catch (error: any) {
    console.error(`Error updating user ${uid}:`, error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}

export async function setUserAdminStatus(uid: string, isAdmin: boolean) {
  try {
    const adminApp = initAdmin();
    await adminApp.auth().setCustomUserClaims(uid, { admin: isAdmin });
    return { success: true };
  } catch (error: any) {
    console.error(`Error setting admin status for user ${uid}:`, error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}

export async function generatePasswordResetLink(email: string) {
  try {
    const adminApp = initAdmin();
    const link = await adminApp.auth().generatePasswordResetLink(email);
    return { success: true, link };
  } catch (error: any) {
    console.error(`Error generating password reset link for ${email}:`, error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}
