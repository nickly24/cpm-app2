import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';

// Указываем что этот route должен работать динамически (не статически)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Проверка валидности текущей сессии
  const authSession = request.cookies.get('auth_session');
  
  if (!authSession || !authSession.value) {
    return NextResponse.json(
      { valid: false, error: 'No session found' },
      { status: 401 }
    );
  }

  try {
    const sessionData = JSON.parse(authSession.value);
    
    if (!sessionData.role || !sessionData.id || !sessionData.full_name) {
      return NextResponse.json(
        { valid: false, error: 'Invalid session data' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: sessionData
    });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: 'Invalid session format' },
      { status: 401 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Logout - удаляем cookie с сессией
  const response = NextResponse.json({ success: true });
  response.cookies.delete('auth_session');
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Убираем trailing slash из URL бэкенда, если есть
    const backendUrl = API_CONFIG.MAIN_BACKEND.replace(/\/$/, '');
    const authUrl = `${backendUrl}/api/auth`;
    
    console.log(`Attempting to authenticate at: ${authUrl}`);
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const text = await response.text();
      console.error('Failed to parse response:', text);
      return NextResponse.json(
        { error: 'Invalid response from authentication server', details: text },
        { status: response.status || 500 }
      );
    }
    
    // Если авторизация успешна, устанавливаем HTTP-only cookie с данными пользователя
    // Проверяем наличие data.res (успешная авторизация)
    if (response.ok && data && data.res) {
      const sessionData = {
        role: data.res.role,
        id: data.res.id,
        full_name: data.res.full_name,
        group_id: data.res.group_id || null,
      };
      
      const nextResponse = NextResponse.json(data, { status: response.status });
      
      // Устанавливаем HTTP-only cookie (безопасная, недоступна из JavaScript)
      nextResponse.cookies.set('auth_session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS в production
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 дней
        path: '/',
      });
      
      return nextResponse;
    }
    
    // Если ошибка, возвращаем ответ от бэкенда
    console.error('Authentication failed:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    });
    
    // Если бэкенд вернул ошибку, возвращаем её
    return NextResponse.json(data || { error: 'Authentication failed' }, { status: response.status || 500 });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { 
        error: 'Authentication failed', 
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

