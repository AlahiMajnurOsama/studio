
'use server';

import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/lib/firebase-admin';

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
        return { success: true };
    } catch (error: any) {
        console.error(`Error deleting user ${uid}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}
