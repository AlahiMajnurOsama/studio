
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
  signInAnonymously,
  signOut,
  updateProfile,
  fetchSignInMethodsForEmail,
  User,
} from "firebase/auth";
import { app } from "@/lib/firebase";
import { useAppContext } from "@/context/AppContext";

type AuthProviderType = "google.com" | "password";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  checkIfUserExists: (email: string) => Promise<{ provider: AuthProviderType | null; error?: string }>;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (isInitialLoading) {
        setIsInitialLoading(false);
      }
    });
    return () => unsubscribe();
  }, [isInitialLoading, setIsInitialLoading]);
  
  const handleAuthError = (error: any): string => {
    console.error("Firebase Auth Error:", error);
    switch (error.code) {
        case 'auth/user-not-found':
            return 'No user found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please sign in.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in process was cancelled.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
  };
  
  const performAuthAction = async (action: () => Promise<any>): Promise<{ success: boolean; error?: string }> => {
    try {
      await action();
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error);
      return { success: false, error: errorMessage };
    }
  };
  
  const signInWithGoogle = useCallback(async () => {
    return await performAuthAction(() => signInWithPopup(auth, googleProvider));
  }, []);

  const signInAnonymously = useCallback(async () => {
     return await performAuthAction(() => signInAnonymously(auth));
  }, []);
  
  const checkIfUserExists = useCallback(async (email: string) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email.toLowerCase());
      const provider = methods.length > 0 ? (methods[0] as AuthProviderType) : null;
      return { provider, error: undefined };
    } catch (error) {
       const errorMessage = handleAuthError(error);
       return { provider: null, error: errorMessage };
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    return await performAuthAction(() => signInWithEmailAndPassword(auth, email.toLowerCase(), password));
  }, []);

  const createUserWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
      const authResult = await performAuthAction(async () => {
        const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);
        if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
        }
      });
      return authResult;
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
      signInWithGoogle,
      checkIfUserExists,
      signInWithEmail,
      createUserWithEmail,
      signInAnonymously,
      signOutUser,
    }),
    [user, isInitialLoading, signInWithGoogle, checkIfUserExists, signInWithEmail, createUserWithEmail, signInAnonymously, signOutUser]
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
