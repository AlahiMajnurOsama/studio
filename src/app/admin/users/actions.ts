
'use server';

// Mock user data structure
const mockUsers = [
    { uid: 'user1', displayName: 'Alice Johnson', email: 'alice@example.com', customClaims: { admin: true } },
    { uid: 'user2', displayName: 'Bob Smith', email: 'bob@example.com', customClaims: { admin: false } },
    { uid: 'user3', displayName: 'Charlie Brown', email: 'charlie@example.com', customClaims: { admin: false } },
];

export async function getAllUsers() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, users: mockUsers };
  } catch (error: any) {
    console.error('Error fetching mock users:', error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}

export async function deleteUser(uid: string) {
    try {
        console.log(`(Demo) Deleting user ${uid}`);
        return { success: true };
    } catch (error: any) {
        console.error(`(Demo) Error deleting user ${uid}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}

export async function updateUser(uid: string, data: { displayName?: string, email?: string }) {
    try {
        console.log(`(Demo) Updating user ${uid} with`, data);
        return { success: true };
    } catch (error: any) {
        console.error(`(Demo) Error updating user ${uid}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}

export async function setUserAdminStatus(uid: string, isAdmin: boolean) {
    try {
        console.log(`(Demo) Setting admin status for user ${uid} to ${isAdmin}`);
        return { success: true };
    } catch (error: any) {
        console.error(`(Demo) Error setting admin status for user ${uid}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}

export async function generatePasswordResetLink(email: string) {
    try {
        console.log(`(Demo) Generating password reset link for ${email}`);
        const link = `https://example.com/reset-password?token=mock_${Date.now()}`;
        return { success: true, link };
    } catch (error: any)
        {
        console.error(`(Demo) Error generating password reset link for ${email}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}
