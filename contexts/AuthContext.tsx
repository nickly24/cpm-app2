'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  role: string;
  id: string;
  full_name: string;
  group_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем localStorage при загрузке
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('role');
      const id = localStorage.getItem('id');
      const full_name = localStorage.getItem('full_name');
      const group_id = localStorage.getItem('group_id');

      if (role && id && full_name) {
        setUser({
          role,
          id,
          full_name,
          group_id: group_id || undefined,
        });
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (login: string, password: string) => {
    const { api } = await import('@/lib/api');
    const response = await api.login(login, password);

    if (response.res) {
      const { role, id, full_name, group_id } = response.res;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('role', role);
        localStorage.setItem('id', id);
        localStorage.setItem('full_name', full_name);
        if (group_id) localStorage.setItem('group_id', group_id);
      }

      setUser({
        role,
        id,
        full_name,
        group_id: group_id || undefined,
      });
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

