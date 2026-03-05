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
import { apiClient } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  setAuthTokens: (accessToken: string, refreshToken: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        // Revoke refresh token trên BE (xóa khỏi Redis)
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001"}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // ignore network errors
    } finally {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      setToken(null);
      window.location.href = "/";
    }
  }, []);

  const setAuthTokens = useCallback(
    (accessToken: string, refreshToken: string) => {
      try {
        const decoded = jwtDecode<User & { exp: number; sub: string }>(accessToken);

        // Kiểm tra expiry token
        if (decoded.exp * 1000 < Date.now()) {
          logout();
          return;
        }

        // Lưu vào localStorage theo yêu cầu của user
        localStorage.setItem("jwt_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        setUser({
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          picture: (decoded as any).picture || '',
          role: decoded.role,
        });
        setToken(accessToken);
      } catch (error) {
        console.error("Failed to decode token:", error);
        logout();
      }
    },
    [logout]
  );

  useEffect(() => {
    const initializeAuth = async () => {
      const storedAccessToken = localStorage.getItem("jwt_token");
      const storedRefreshToken = localStorage.getItem("refresh_token");

      if (storedAccessToken && storedRefreshToken) {
        try {
          const decoded = jwtDecode<{ exp: number; sub: string }>(storedAccessToken);

          if (decoded.exp * 1000 < Date.now()) {
            // Access token expired, thu refresh refreshToken
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
            const res = await fetch(`${apiBase}/api/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken: storedRefreshToken })
            });

            if (res.ok) {
              const data = await res.json();
              setAuthTokens(data.access_token, data.refresh_token);
            } else {
              // Refresh token khong hop le (bi xoa trong Redis hoac maxAge het)
              console.log("Refresh token is invalid or expired in server. Logging out.");
              logout();
            }
          } else {
            // Còn hạn, set normal
            setAuthTokens(storedAccessToken, storedRefreshToken);
          }
        } catch (error) {
          console.error("Token verification error:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [setAuthTokens, logout]);

  const login = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
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
        setAuthTokens,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
