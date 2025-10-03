"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from "react";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  setAuthToken: (token: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    console.log("Logging out");
    localStorage.removeItem("jwt_token");
    setUser(null);
    setToken(null);
    window.location.href = "/"; // Redirect to login page
  }, []);

  const setAuthToken = useCallback(
    (newToken: string) => {
      try {
        const decodedUser: User = jwtDecode(newToken);
        localStorage.setItem("jwt_token", newToken);
        setUser(decodedUser);
        setToken(newToken);
      } catch (error) {
        console.error("Failed to decode new token:", error);
        logout();
      }
    },
    [logout]
  );

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("jwt_token");
      if (storedToken) {
        setAuthToken(storedToken);
      }
    } catch (error) {
      console.error("Invalid or expired token:", error);
      localStorage.removeItem("jwt_token");
    } finally {
      setIsLoading(false);
    }
  }, [setAuthToken]);

  const login = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        setAuthToken,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  console.log("AuthContext:", context);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
