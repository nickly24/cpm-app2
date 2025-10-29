'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
  role: string;
  id: string;
  full_name: string;
  group_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем сессию на сервере при загрузке
    const checkSession = async () => {
      if (typeof window !== 'undefined') {
        try {
          // Сначала проверяем localStorage для быстрой загрузки UI
          const role = localStorage.getItem('role');
          const id = localStorage.getItem('id');
          const full_name = localStorage.getItem('full_name');
          const group_id = localStorage.getItem('group_id');

          if (role && id && full_name) {
            // Устанавливаем пользователя из localStorage сразу
            setUser({
              role,
              id,
              full_name,
              group_id: group_id || undefined,
            });

            // Затем проверяем валидность сессии на сервере
            try {
              const response = await api.checkSession();
              if (response.valid && response.user) {
                // Обновляем данные пользователя из сервера
                setUser({
                  role: response.user.role,
                  id: response.user.id,
                  full_name: response.user.full_name,
                  group_id: response.user.group_id || undefined,
                });
                // Синхронизируем localStorage
                localStorage.setItem('role', response.user.role);
                localStorage.setItem('id', response.user.id);
                localStorage.setItem('full_name', response.user.full_name);
                if (response.user.group_id) {
                  localStorage.setItem('group_id', response.user.group_id);
                }
              } else {
                // Сессия невалидна, очищаем
                localStorage.clear();
                setUser(null);
              }
            } catch (checkError) {
              // Если ошибка при проверке сессии через API, оставляем данные из localStorage
              // но логируем ошибку
              console.error('Session check API error:', checkError);
            }
          }
        } catch (error) {
          // Если ошибка при проверке сессии, очищаем localStorage
          console.error('Session check error:', error);
          localStorage.clear();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (login: string, password: string) => {
    try {
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
      } else {
        throw new Error('Login failed: no user data received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Очищаем cookie на сервере
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Продолжаем выполнение даже если запрос не удался
    }
    
    // Очищаем локальное состояние
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
