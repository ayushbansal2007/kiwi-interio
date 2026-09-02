import {
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  refreshAccessToken,
  logoutUser,
  getProfile,
  storeRefreshToken,
} from "../services/authService";

import { setAccessToken as setApiAccessToken } from "../services/apiClient";

export interface User {
  _id: string;
  name: string;
  email: string;
  number?: string;
  role: string;
  avatar?: string;
  authProvider?: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;

  login: (
    token: string,
    user: User,
    refreshToken?: string
  ) => void;

  updateUser: (userData: Partial<User>) => void;

  logout: () => Promise<void>;
}

export const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );

interface Props {
  children: ReactNode;
}

const ACCESS_TOKEN_REFRESH_MS = 12 * 60 * 1000;

export const AuthProvider = ({
  children,
}: Props) => {
  const [user, setUser] =
    useState<User | null>(null);

  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const refreshTimerRef = useRef<number | null>(null);

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      window.clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const scheduleTokenRefresh = () => {
    clearRefreshTimer();

    refreshTimerRef.current = window.setInterval(async () => {
      try {
        const tokenData = await refreshAccessToken();
        if (!tokenData.accessToken) return;

        setAccessToken(tokenData.accessToken);
        setApiAccessToken(tokenData.accessToken);
        localStorage.setItem("token", tokenData.accessToken);
      } catch (error) {
        console.log(error);
      }
    }, ACCESS_TOKEN_REFRESH_MS);
  };

  const login = (
    token: string,
    userData: User,
    refreshToken?: string
  ) => {
    setAccessToken(token);
    setApiAccessToken(token);
    setUser(userData);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    if (refreshToken) {
      storeRefreshToken(refreshToken);
    }

    scheduleTokenRefresh();
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.log(error);
    }

    clearRefreshTimer();
    setAccessToken(null);
    setApiAccessToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    storeRefreshToken(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokenData =
          await refreshAccessToken();

        if (!tokenData.accessToken) {
          setLoading(false);
          return;
        }

        setAccessToken(
          tokenData.accessToken
        );

        setApiAccessToken(
          tokenData.accessToken
        );

        const profile =
          await getProfile(
            tokenData.accessToken
          );

        setUser(profile);
        localStorage.setItem("token", tokenData.accessToken);
        localStorage.setItem("user", JSON.stringify(profile));
        scheduleTokenRefresh();
      } catch (error) {
        console.log(error);

        setAccessToken(null);
        setApiAccessToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        storeRefreshToken(null);
      } finally {
        setLoading(false);
      }
    };

    void checkAuth();

    return () => {
      clearRefreshTimer();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
