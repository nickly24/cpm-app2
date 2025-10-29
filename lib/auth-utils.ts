import { NextRequest } from 'next/server';

export interface AuthSession {
  role: string;
  id: string;
  full_name: string;
  group_id: string | null;
}

/**
 * Проверяет авторизацию пользователя из HTTP-only cookie
 * @param request Next.js request объект
 * @returns Данные сессии или null если не авторизован
 */
export function getAuthSession(request: NextRequest): AuthSession | null {
  try {
    const authCookie = request.cookies.get('auth_session');
    
    if (!authCookie || !authCookie.value) {
      return null;
    }
    
    const sessionData = JSON.parse(authCookie.value) as AuthSession;
    
    // Базовая валидация данных сессии
    if (!sessionData.role || !sessionData.id || !sessionData.full_name) {
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.error('Error parsing auth session:', error);
    return null;
  }
}

/**
 * Проверяет авторизован ли пользователь
 * @param request Next.js request объект
 * @returns true если авторизован, false если нет
 */
export function isAuthenticated(request: NextRequest): boolean {
  return getAuthSession(request) !== null;
}

