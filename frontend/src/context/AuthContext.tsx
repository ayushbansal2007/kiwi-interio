import {
  createContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  refreshAccessToken,
  logoutUser,
  getProfile,
} from "../services/authService";

import { setAccessToken as setApiAccessToken } from "../services/apiClient";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;

  login: (
    token: string,
    user: User
  ) => void;

  logout: () => Promise<void>;
}

export const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: Props) => {
  const [user, setUser] =
    useState<User | null>(null);

  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  // Login
  const login = (
    token: string,
    userData: User
  ) => {
    // React State
    setAccessToken(token);

    // apiClient Memory
    setApiAccessToken(token);

    // User
    setUser(userData);
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.log(error);
    }

    setAccessToken(null);
    setApiAccessToken(null);
    setUser(null);
  };

  // Refresh App
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokenData =
          await refreshAccessToken();

        if (!tokenData.accessToken) {
          setLoading(false);
          return;
        }

        // React State
        setAccessToken(
          tokenData.accessToken
        );

        // apiClient Memory
        setApiAccessToken(
          tokenData.accessToken
        );

        // Profile
        const profile =
          await getProfile(
            tokenData.accessToken
          );

        setUser(profile);
      } catch (error) {
        console.log(error);

        setAccessToken(null);
        setApiAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};