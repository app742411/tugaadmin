"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/auth.types";
import { storage } from "@/lib/storage";
import { authService } from "@/services/authService";

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Client-side initialization
    const loadedToken = storage.getAccessToken();
    const loadedUser = storage.getUser();
    
    if (loadedToken && loadedUser) {
      setToken(loadedToken);
      setUser(loadedUser);

      // Async fetch to sync full profile details (e.g. profileImage, updated email)
      authService.getMyProfile()
        .then((fullProfile) => {
          const syncedUser = {
            id: fullProfile.id,
            fullName: fullProfile.fullName,
            email: fullProfile.email,
            role: fullProfile.role,
            profileImage: fullProfile.profileImage,
          };
          setUser(syncedUser);
          storage.setUser(syncedUser);
        })
        .catch((err) => {
          console.error("Failed to sync profile on mount:", err);
        });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setToken(data.accessToken);
    setUser(data.user);
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    storage.setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
