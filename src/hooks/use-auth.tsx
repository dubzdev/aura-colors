
'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPassword: (email: string, pass: string) => Promise<void>;
  signUpWithEmailPassword: (email: string, pass: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (action: string) => {
    toast({ title: `${action} Successful`, description: `Successfully ${action.toLowerCase()}.` });
    router.push('/');
  };

  const handleAuthError = (error: AuthError, action: string) => {
    console.error(`Error ${action.toLowerCase()}:`, error);
    let description = error.message || `Could not ${action.toLowerCase()}. Please try again.`;
    // Customize messages for common errors
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      description = 'Invalid email or password.';
    } else if (error.code === 'auth/email-already-in-use') {
      description = 'This email address is already in use.';
    } else if (error.code === 'auth/weak-password') {
      description = 'Password is too weak. It should be at least 6 characters.';
    }
    toast({ variant: "destructive", title: `${action} Failed`, description });
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      handleAuthSuccess("Signed In");
    } catch (error: any) {
      handleAuthError(error as AuthError, "Sign In with Google");
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmailPassword = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      handleAuthSuccess("Signed In");
    } catch (error: any) {
      handleAuthError(error as AuthError, "Sign In with Email");
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmailPassword = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      handleAuthSuccess("Account Created");
    } catch (error: any) {
      handleAuthError(error as AuthError, "Account Creation");
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      toast({ title: "Signed Out", description: "Successfully signed out." });
      router.push('/');
    } catch (error: any) {
      handleAuthError(error as AuthError, "Sign Out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
