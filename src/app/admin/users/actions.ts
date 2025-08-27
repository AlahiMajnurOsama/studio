
'use server';

import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function getAllUsers() {
  try {
    const adminApp = await initAdmin();
    const auth = getAuth(adminApp);
    const userRecords = await auth.listUsers();
    
    // Convert to plain objects to ensure they are serializable
    const users = userRecords.users.map(user => user.toJSON());

    return { success: true, users };
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}

export async function deleteUser(uid: string) {
    try {
        const adminApp = await initAdmin();
        const auth = getAuth(adminApp);
        await auth.deleteUser(uid);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error(`Error deleting user ${uid}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}

export async function updateUser(uid: string, data: { displayName?: string, email?: string }) {
    try {
        const adminApp = await initAdmin();
        const auth = getAuth(adminApp);
        await auth.updateUser(uid, data);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error(`Error updating user ${uid}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}

export async function setUserAdminStatus(uid: string, isAdmin: boolean) {
    try {
        const adminApp = await initAdmin();
        const auth = getAuth(adminApp);
        await auth.setCustomUserClaims(uid, { admin: isAdmin });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error(`Error setting admin status for user ${uid}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}

export async function generatePasswordResetLink(email: string) {
    try {
        const adminApp = await initAdmin();
        const auth = getAuth(adminApp);
        const link = await auth.generatePasswordResetLink(email);
        return { success: true, link };
    } catch (error: any) {
        console.error(`Error generating password reset link for ${email}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}
