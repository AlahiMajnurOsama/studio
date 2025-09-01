
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
import { useAppContext } from "@/context/AppContext";

// Mock User type, equivalent to firebase.User
type MockUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  isAnonymous: boolean;
};

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  createUserWithEmail: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signInAnonymously: () => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createMockUser = (email: string | null, displayName: string, isAnonymous = false): MockUser => ({
    uid: `mock_${new Date().getTime()}`,
    email,
    displayName,
    isAnonymous,
    photoURL: `https://i.pravatar.cc/150?u=${email}`,
    phoneNumber: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const { isInitialLoading, setIsInitialLoading } = useAppContext();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Simulate initial auth state check
    setTimeout(() => {
        // You can uncomment the line below to simulate being logged in by default
        // const mockUser = createMockUser("demo@shohure.com", "Demo Admin");
        // setUser(mockUser);
        // setIsAdmin(true);
        setIsInitialLoading(false);
    }, 500);
  }, [setIsInitialLoading]);

  const performAuthAction = async (action: () => MockUser): Promise<{ success: boolean; error?: string }> => {
    try {
      const mockUser = action();
      setUser(mockUser);
      // Make the first registered user an admin for demo purposes
      if (!isAdmin) {
          setIsAdmin(mockUser.email === 'ra726ma@gmail.com' || user === null);
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "An unknown error occurred." };
    }
  };

  const signInAnonymously = useCallback(async () => {
    return await performAuthAction(() => createMockUser(null, "Guest User", true));
  }, []);
  
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    console.log("Signing in with:", email, password); // Mock password check
    return await performAuthAction(() => createMockUser(email, email.split('@')[0]));
  }, []);

  const createUserWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    console.log("Creating user with:", email, password, displayName);
    return await performAuthAction(() => createMockUser(email, displayName));
  }, []);

  const signOutUser = useCallback(async () => {
    setUser(null);
    setIsAdmin(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading: isInitialLoading,
      isAdmin,
      signInWithEmail,
      createUserWithEmail,
      signInAnonymously,
      signOutUser,
    }),
    [user, isInitialLoading, isAdmin, signInWithEmail, createUserWithEmail, signInAnonymously, signOutUser]
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
