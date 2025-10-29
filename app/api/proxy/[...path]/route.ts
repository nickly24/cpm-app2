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
    // ЗАЩИТА ОТ ЗАПРОСОВ НЕ ИЗ БРАУЗЕРА (Postman, curl, etc.)
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const userAgent = request.headers.get('user-agent');
    const url = new URL(request.url);
    const allowedHost = url.hostname; // Домен текущего приложения
    
    // Проверка User-Agent - должен быть браузер
    // Postman обычно имеет "PostmanRuntime" в User-Agent
    // curl обычно имеет "curl" в User-Agent
    const isKnownNonBrowser = userAgent && (
      userAgent.includes('PostmanRuntime') ||
      userAgent.includes('Postman') ||
      userAgent.includes('curl/') ||
      userAgent.includes('wget') ||
      userAgent.includes('python-requests') ||
      userAgent.includes('axios') ||
      userAgent.includes('node-fetch') ||
      userAgent.includes('Go-http-client')
    );
    
    // Проверяем origin - если есть, должен быть с нашего домена
    let isOriginValid = true;
    if (origin) {
      try {
        const originHost = new URL(origin).hostname;
        isOriginValid = originHost === allowedHost;
      } catch (e) {
        isOriginValid = false;
      }
    }
    
    // Проверяем referer - если есть, должен быть с нашего домена
    let isRefererValid = true;
    if (referer) {
      try {
        const refererHost = new URL(referer).hostname;
        isRefererValid = refererHost === allowedHost;
      } catch (e) {
        isRefererValid = false;
      }
    }
    
    // Блокируем если:
    // 1. Это точно не браузер (Postman, curl и т.д.)
    // 2. ИЛИ origin указан, но не с нашего домена
    // 3. ИЛИ referer указан, но не с нашего домена
    if (isKnownNonBrowser || !isOriginValid || !isRefererValid) {
      console.warn(`🚫 Blocked non-browser request:`, {
        origin,
        referer,
        userAgent,
        url: request.url,
        isKnownNonBrowser,
        isOriginValid,
        isRefererValid
      });
      
      return NextResponse.json(
        { 
          error: 'Forbidden: This API can only be accessed from the web application.',
          message: 'Direct API access is not allowed. Please use the web interface.'
        },
        { status: 403 }
      );
    }
    
    // Список публичных endpoints, которые не требуют авторизации (пустой - все требуют авторизацию)
    const publicEndpoints: string[] = [];
    
    const path = pathSegments.join('/');
    const isPublicEndpoint = publicEndpoints.some(endpoint => path.startsWith(endpoint));
    
    // Если endpoint не публичный, строго проверяем авторизацию
    if (!isPublicEndpoint) {
      // Проверяем авторизацию - получаем cookie с сессией
      const authSession = request.cookies.get('auth_session');
      
      // Логируем все cookies для отладки (только в dev)
      if (process.env.NODE_ENV === 'development') {
        const allCookies = request.cookies.getAll();
        console.log('All cookies:', allCookies.map(c => c.name));
      }
      
      if (!authSession || !authSession.value || authSession.value.trim() === '') {
        console.warn(`❌ Unauthorized request to proxy: ${request.method} ${request.url} - No session cookie found`);
        return NextResponse.json(
          { error: 'Unauthorized: No valid session found. Please log in first.' },
          { status: 401 }
        );
      }

      // Проверяем валидность сессии (парсим JSON)
      let sessionData;
      try {
        sessionData = JSON.parse(authSession.value);
      } catch (parseError) {
        console.error('❌ Failed to parse session cookie:', parseError);
        return NextResponse.json(
          { error: 'Unauthorized: Invalid session format' },
          { status: 401 }
        );
      }
      
      // Строгая проверка наличия обязательных полей
      if (!sessionData || typeof sessionData !== 'object') {
        console.warn(`❌ Invalid session data type: ${typeof sessionData}`);
        return NextResponse.json(
          { error: 'Unauthorized: Invalid session data structure' },
          { status: 401 }
        );
      }
      
      if (!sessionData.role || !sessionData.id || !sessionData.full_name) {
        console.warn(`❌ Invalid session data - missing required fields:`, {
          hasRole: !!sessionData.role,
          hasId: !!sessionData.id,
          hasFullName: !!sessionData.full_name,
          sessionKeys: Object.keys(sessionData)
        });
        return NextResponse.json(
          { error: 'Unauthorized: Invalid session data - missing required fields' },
          { status: 401 }
        );
      }
      
      // Логируем успешную авторизацию (только в dev режиме)
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Authorized request from user: ${sessionData.role} (${sessionData.id}) - ${request.method} ${path}`);
      }
    } else {
      // Публичный endpoint - логируем
      console.log(`🌐 Public endpoint accessed: ${request.method} ${path}`);
    }
    
    // Определяем на какой сервер идёт запрос (url уже определен выше)
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

