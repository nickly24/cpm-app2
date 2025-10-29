import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';

// Указываем что этот route должен работать динамически (не статически)
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleProxy(request, params.path);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleProxy(request, params.path);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleProxy(request, params.path);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleProxy(request, params.path);
}

async function handleProxy(
  request: NextRequest,
  pathSegments: string[]
) {
  try {
    // Проверяем авторизацию - получаем cookie с сессией
    const authSession = request.cookies.get('auth_session');
    
    if (!authSession || !authSession.value) {
      console.warn(`Unauthorized request to proxy: ${request.method} ${request.url}`);
      return NextResponse.json(
        { error: 'Unauthorized: No valid session found' },
        { status: 401 }
      );
    }

    // Проверяем валидность сессии (парсим JSON)
    try {
      const sessionData = JSON.parse(authSession.value);
      
      // Проверяем наличие обязательных полей
      if (!sessionData.role || !sessionData.id || !sessionData.full_name) {
        console.warn(`Invalid session data: ${JSON.stringify(sessionData)}`);
        return NextResponse.json(
          { error: 'Unauthorized: Invalid session data' },
          { status: 401 }
        );
      }
    } catch (parseError) {
      console.error('Failed to parse session cookie:', parseError);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid session format' },
        { status: 401 }
      );
    }

    const path = pathSegments.join('/');
    
    // Определяем на какой сервер идёт запрос
    const url = new URL(request.url);
    // Убираем trailing slash из URL бэкенда, если есть
    const backendBase = (url.searchParams.get('backend') === 'exam' 
      ? API_CONFIG.EXAM_BACKEND 
      : API_CONFIG.MAIN_BACKEND).replace(/\/$/, '');
    
    // Создаём параметры без backend
    const searchParams = new URLSearchParams(url.searchParams);
    searchParams.delete('backend');
    const queryString = searchParams.toString();
    
    // Создаём URL для бэкенда
    let backendUrl = `${backendBase}/${path}`;
    if (queryString) {
      backendUrl += `?${queryString}`;
    }
    // Исправляем двойные слеши, но оставляем ://
    backendUrl = backendUrl.replace(/\/+/g, '/').replace(':/', '://');
    
    console.log(`Proxying ${request.method} request to: ${backendUrl}`);
    
    // Получаем тело запроса если есть
    let body = undefined;
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        body = await request.json();
      } catch (e) {
        // ignore
      }
    }
    
    // Создаём options для fetch
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(backendUrl, fetchOptions);
    
    if (!response.ok) {
      console.error(`Backend error: ${response.status}`);
      return NextResponse.json(
        { error: await response.text() },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy failed: ' + error.message },
      { status: 500 }
    );
  }
}

