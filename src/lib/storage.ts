import { User } from "@/types/auth.types";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

const isClient = () => typeof window !== "undefined";

export const storage = {
  getAccessToken: (): string | null => {
    if (isClient()) {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  },

  setAccessToken: (token: string): void => {
    if (isClient()) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  getRefreshToken: (): string | null => {
    if (isClient()) {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  setRefreshToken: (token: string): void => {
    if (isClient()) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  getUser: (): User | null => {
    if (isClient()) {
      const u = localStorage.getItem(USER_KEY);
      if (u) {
        try {
          return JSON.parse(u) as User;
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  setUser: (user: User): void => {
    if (isClient()) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  clear: (): void => {
    if (isClient()) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
};
