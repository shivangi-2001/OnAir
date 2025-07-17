import React, { createContext, useState, useContext, useEffect, } from "react";

interface UserType {
  name: string;
  email: string;
  profile: string;
}

interface AuthContextType {
  register: (formData: FormData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  profile: () => Promise<void>;
  user: UserType | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const register = async (formData: FormData) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Registration failed");
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Login failed");
    }
    await profile();
  };

  const profile = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
      credentials: "include",
    });

    if (res.status === 401) {
      try {
        await refresh();
        return await profile();
      } catch (err) {
        console.error("Refresh failed:", err);
        localStorage.removeItem("meetingId");
        localStorage.removeItem("host");
        setUser(null);
        return;
      }
    }

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Profile fetch failed");
    }

    const data = await res.json();
    setUser({
      name: data.name,
      email: data.email,
      profile: data.profile,
    });
  };

  const refresh = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Refresh failed");
    }
  };

  const logout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await profile();
      } catch (err) {
        console.log("Initial auth check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <AuthContext.Provider
      value={{ register, login, refresh, logout, profile, user, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
