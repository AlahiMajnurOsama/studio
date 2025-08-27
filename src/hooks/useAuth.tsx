
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
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  User,
} from "firebase/auth";
import { app } from "@/lib/firebase";
import { useAppContext } from "@/context/AppContext";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  createUserWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInAnonymously: () => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setIsInitialLoading } = useAppContext();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      setIsInitialLoading(false);
    });
    return () => unsubscribe();
  }, [setIsInitialLoading]);
  
  const handleAuthError = (error: any): string => {
    console.error("Firebase Auth Error:", error);
    switch (error.code) {
        case 'auth/user-not-found':
            return 'No user found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
            return 'This email is already registered.';
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

  const setAuthPersistence = async (rememberMe: boolean) => {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : inMemoryPersistence);
  };
  
  const signInWithGoogle = useCallback(() => performAuthAction(() => signInWithPopup(auth, googleProvider)), []);
  
  const signInAnonymously = useCallback(() => performAuthAction(() => signInAnonymously(auth)), []);

  const signInWithEmail = useCallback((email: string, password: string) => {
    return performAuthAction(() => signInWithEmailAndPassword(auth, email, password));
  }, []);
  
  const createUserWithEmail = useCallback((email: string, password: string) => {
    return performAuthAction(() => createUserWithEmailAndPassword(auth, email, password));
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
      loading,
      signInWithGoogle,
      signInWithEmail,
      createUserWithEmail,
      signInAnonymously,
      signOutUser,
    }),
    [user, loading, signInWithGoogle, signInWithEmail, createUserWithEmail, signInAnonymously, signOutUser]
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
