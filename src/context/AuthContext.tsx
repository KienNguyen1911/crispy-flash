"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useReducer
} from "react";
import { jwtDecode } from "jwt-decode";
import AuthDialog from "@/components/auth/AuthDialog";

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
  loginWithGoogle: () => void;
  logout: () => void;
  setAuthTokens: (accessToken: string, refreshToken: string) => void;
  isLoading: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthDialogOpen: boolean;
}

type AuthAction = 
  | { type: 'SET_USER_AND_TOKEN'; payload: { user: User; token: string } }
  | { type: 'CLEAR_AUTH' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH_DIALOG_OPEN'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_USER_AND_TOKEN':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthDialogOpen: false };
    case 'CLEAR_AUTH':
      return { ...state, user: null, token: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTH_DIALOG_OPEN':
      return { ...state, isAuthDialogOpen: action.payload };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: true,
    isAuthDialogOpen: false
  });

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
      dispatch({ type: 'CLEAR_AUTH' });
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

        dispatch({ 
          type: 'SET_USER_AND_TOKEN', 
          payload: {
            user: {
              id: decoded.sub,
              email: decoded.email,
              name: decoded.name,
              picture: (decoded as any).picture || '',
              role: decoded.role,
            },
            token: accessToken
          }
        });
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
            // Access token expired, try refresh
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
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    initializeAuth();
  }, [setAuthTokens, logout]);

  const loginWithGoogle = useCallback(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
    window.location.href = `${apiUrl}/api/auth/google`;
  }, []);

  const login = useCallback(() => {
    dispatch({ type: 'SET_AUTH_DIALOG_OPEN', payload: true });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        isAuthenticated: !!state.token,
        login,
        loginWithGoogle,
        logout,
        setAuthTokens,
        isLoading: state.isLoading
      }}
    >
      {children}
      <AuthDialog
        open={state.isAuthDialogOpen}
        onOpenChange={(open) => dispatch({ type: 'SET_AUTH_DIALOG_OPEN', payload: open })}
        onGoogleLogin={loginWithGoogle}
        onQrAuthenticated={setAuthTokens}
      />
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
