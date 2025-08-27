
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { app } from "@/lib/firebase";
import { useAppContext } from "@/context/AppContext";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  createUserWithEmail: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signInAnonymously: () => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { isInitialLoading, setIsInitialLoading } = useAppContext();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        // Grant admin access if the custom claim is set OR if the email matches the initial admin.
        const userIsAdmin = !!tokenResult.claims.admin || user.email === 'ra726ma@gmail.com';
        setIsAdmin(userIsAdmin);
        setUser(user);
      } else {
        setIsAdmin(false);
        setUser(null);
      }
      if (isInitialLoading) {
        setIsInitialLoading(false);
      }
    });
    return () => unsubscribe();
  }, [isInitialLoading, setIsInitialLoading]);
  
  const handleAuthError = (error: any): { message: string, code: string } => {
    console.error("Firebase Auth Error:", error);
    const code = error.code || 'unknown';
    let message = 'An unexpected error occurred. Please try again.';

    switch (error.code) {
        case 'auth/user-not-found':
            message = 'No user found with this email. Please sign up.';
            break;
        case 'auth/wrong-password':
            message = 'Incorrect password. Please try again.';
            break;
        case 'auth/email-already-in-use':
            message = 'This email is already registered. Please sign in.';
            break;
        case 'auth/weak-password':
            message = 'Password should be at least 6 characters.';
            break;
        case 'auth/popup-closed-by-user':
            message = 'Sign-in process was cancelled.';
            break;
    }
    return { message, code };
  };
  
  const performAuthAction = async (action: () => Promise<any>): Promise<{ success: boolean; error?: string }> => {
    try {
      await action();
      return { success: true };
    } catch (error) {
      const { message, code } = handleAuthError(error);
      // Don't show a toast for user-cancelled popups
      if (code === 'auth/popup-closed-by-user') {
        return { success: false }; // Return success: false but no error message
      }
      return { success: false, error: message };
    }
  };
  
  const signInWithGoogle = useCallback(async () => {
    return await performAuthAction(() => signInWithPopup(auth, googleProvider));
  }, []);

  const signInAnonymously = useCallback(async () => {
     return await performAuthAction(() => firebaseSignInAnonymously(auth));
  }, []);
  
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    return await performAuthAction(() => signInWithEmailAndPassword(auth, email.toLowerCase(), password));
  }, []);

  const createUserWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
      return await performAuthAction(async () => {
        const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);
        if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
        }
      });
  }, []);

  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading: isInitialLoading,
      isAdmin,
      signInWithGoogle,
      signInWithEmail,
      createUserWithEmail,
      signInAnonymously,
      signOutUser,
    }),
    [user, isInitialLoading, isAdmin, signInWithGoogle, signInWithEmail, createUserWithEmail, signInAnonymously, signOutUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
