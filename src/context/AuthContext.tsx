import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { AdminUser, CustomerUser } from '../types/index.ts';
import { apiClient } from '../services/apiClient.ts';

interface AuthContextType {
  // Mode switcher: Customer Store vs Admin Dashboard
  viewMode: 'store' | 'admin';
  setViewMode: (mode: 'store' | 'admin') => void;

  // Customer Auth
  customer: CustomerUser | null;
  firebaseUser: User | null;
  signInWithGoogle: () => Promise<void>;
  customerSignOut: () => Promise<void>;
  isCustomerLoading: boolean;

  // Admin Auth
  admin: AdminUser | null;
  adminToken: string | null;
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => void;
  isAdminLoggedIn: boolean;

  // Wishlist
  wishlistIds: number[];
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_TOKEN_KEY = 'aurafit_admin_token_v1';
const ADMIN_USER_KEY = 'aurafit_admin_user_v1';
const WISHLIST_KEY = 'aurafit_wishlist_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'store' | 'admin'>('store');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(true);

  // Admin state
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  // Firebase auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user && user.email) {
        try {
          const synced = await apiClient.syncCustomer({
            firebaseUid: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            avatarUrl: user.photoURL || undefined,
          });
          setCustomer(synced);
        } catch (err) {
          console.error('Failed to sync customer on auth state change:', err);
        }
      } else {
        setCustomer(null);
      }
      setIsCustomerLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user && result.user.email) {
        const synced = await apiClient.syncCustomer({
          firebaseUid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || result.user.email.split('@')[0],
          avatarUrl: result.user.photoURL || undefined,
        });
        setCustomer(synced);
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      // Fallback for environments where popup is restricted: create guest customer session
      const guestEmail = `client_${Date.now().toString().slice(-4)}@aurafit.store`;
      const guest = await apiClient.syncCustomer({
        email: guestEmail,
        name: 'AURA VIP Guest',
      });
      setCustomer(guest);
    }
  };

  const customerSignOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error(e);
    }
    setCustomer(null);
    setFirebaseUser(null);
  };

  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await apiClient.adminLogin(email, pass);
      setAdminToken(res.token);
      setAdmin(res.admin);
      localStorage.setItem(ADMIN_TOKEN_KEY, res.token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(res.admin));
      return true;
    } catch (err) {
      console.error('Admin login error:', err);
      return false;
    }
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdmin(null);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    setViewMode('store');
  };

  const toggleWishlist = (productId: number) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: number) => wishlistIds.includes(productId);

  return (
    <AuthContext.Provider
      value={{
        viewMode,
        setViewMode,
        customer,
        firebaseUser,
        signInWithGoogle,
        customerSignOut,
        isCustomerLoading,
        admin,
        adminToken,
        loginAdmin,
        logoutAdmin,
        isAdminLoggedIn: !!adminToken,
        wishlistIds,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
