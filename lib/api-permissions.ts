// Определение прав доступа к API endpoints по ролям

export interface EndpointPermission {
  path: string;
  roles: string[];
  methods?: string[];
}

// Endpoints, требующие только роль admin
export const ADMIN_ONLY_ENDPOINTS: EndpointPermission[] = [
  // Управление пользователями
  { path: 'api/get-users-by-role', roles: ['admin'] },
  { path: 'api/delete-user', roles: ['admin'] },
  { path: 'api/add-student', roles: ['admin'] },
  { path: 'api/edit-student', roles: ['admin'] },
  { path: 'api/get-students', roles: ['admin', 'supervisor'] },
  { path: 'api/get-groups-students', roles: ['admin', 'supervisor'] },
  
  // Управление группами
  { path: 'api/get-unsigned-proctors-students', roles: ['admin'] },
  { path: 'api/remove-groupd-id-student', roles: ['admin'] },
  { path: 'api/remove-groupd-id-proctor', roles: ['admin'] },
  { path: 'api/change-group-proctor', roles: ['admin'] },
  { path: 'api/change-group-student', roles: ['admin'] },
  
  // Расписание
  { path: 'api/schedule', roles: ['admin', 'supervisor'], methods: ['POST', 'PUT', 'DELETE'] },
  
  // Посещаемость
  { path: 'api/add-attendance', roles: ['admin', 'proctor', 'supervisor'] },
  { path: 'api/get-attendance-by-date', roles: ['admin', 'supervisor'] },
  { path: 'api/get-attendance-by-month', roles: ['admin', 'supervisor'] },
  
  // Домашние задания (создание/удаление)
  { path: 'api/create-homework', roles: ['admin', 'proctor', 'examinator'] },
  { path: 'api/delete-homework', roles: ['admin', 'proctor', 'examinator'] },
  { path: 'api/edit-homework-session', roles: ['admin', 'proctor', 'examinator'] },
  { path: 'api/get-homework-students', roles: ['admin', 'proctor', 'examinator'] },
  { path: 'api/get-all-homework-results', roles: ['admin', 'supervisor'] },
];

// Endpoints, доступные проctor и выше
export const PROCTOR_OR_HIGHER_ENDPOINTS: EndpointPermission[] = [
  // Запросы на отгул
  { path: 'api/get-all-zaps', roles: ['proctor', 'admin', 'supervisor'] },
  { path: 'api/process-zap', roles: ['proctor', 'admin', 'supervisor'] },
  { path: 'api/get-zap/', roles: ['proctor', 'admin', 'supervisor'] },
];

// Endpoints для студентов
export const STUDENT_ENDPOINTS: EndpointPermission[] = [
  { path: 'api/get-zaps-student', roles: ['student', 'admin'] },
  { path: 'api/create-zap', roles: ['student', 'admin'] },
  { path: 'api/get-homeworks-student', roles: ['student'] },
  { path: 'api/pass_homework', roles: ['student'] },
  { path: 'api/get-class-name-by-studID', roles: ['student', 'admin'] },
];

// Публичные endpoints (для всех авторизованных)
export const PUBLIC_ENDPOINTS: EndpointPermission[] = [
  { path: 'api/get-groups', roles: ['student', 'proctor', 'admin', 'supervisor', 'examinator'] },
  { path: 'api/get-homeworks', roles: ['student', 'proctor', 'admin', 'supervisor', 'examinator'] },
  { path: 'api/schedule', roles: ['student', 'proctor', 'admin', 'supervisor', 'examinator'], methods: ['GET'] },
  { path: 'api/student-group-filter', roles: ['student', 'proctor', 'admin', 'supervisor'] },
  { path: 'api/get-homework-sessions', roles: ['student', 'proctor', 'admin', 'examinator'] },
  { path: 'api/get-homework-results-paginated', roles: ['admin', 'proctor', 'examinator'] },
  { path: 'api/validate-student-by-tg', roles: ['admin', 'supervisor'] },
];

// Объединяем все endpoints
export const ALL_ENDPOINTS: EndpointPermission[] = [
  ...ADMIN_ONLY_ENDPOINTS,
  ...PROCTOR_OR_HIGHER_ENDPOINTS,
  ...STUDENT_ENDPOINTS,
  ...PUBLIC_ENDPOINTS,
];

/**
 * Проверяет, имеет ли пользователь доступ к endpoint
 */
export function hasPermission(userRole: string, path: string, method: string = 'GET'): boolean {
  // Нормализуем path - убираем начальный/конечный слеш
  const normalizedPath = path.replace(/^\/+|\/+$/g, '');
  
  console.log(`🔍 hasPermission: userRole=${userRole}, normalizedPath=${normalizedPath}, method=${method}, total endpoints=${ALL_ENDPOINTS.length}`);
  
  // Ищем endpoint в списках
  for (const endpoint of ALL_ENDPOINTS) {
    // Проверяем точное совпадение или что path начинается с endpoint.path
    // Также учитываем что endpoint.path может заканчиваться на / (для частичных путей)
    const endpointPath = endpoint.path.endsWith('/') ? endpoint.path.slice(0, -1) : endpoint.path;
    
    if (normalizedPath === endpointPath || normalizedPath.startsWith(endpointPath + '/')) {
      console.log(`✅ Found matching endpoint: ${endpointPath}, roles=${endpoint.roles.join(',')}, hasAccess=${endpoint.roles.includes(userRole)}`);
      // Проверяем метод (если указан)
      if (endpoint.methods && !endpoint.methods.includes(method)) {
        return false;
      }
      // Проверяем роль
      return endpoint.roles.includes(userRole);
    }
  }
  
  // Если endpoint не найден в списках, по умолчанию разрешаем только админам
  console.warn(`⚠️ Unknown endpoint: ${normalizedPath} - allowing only admins`);
  return userRole === 'admin';
}

/**
 * Получает список разрешенных ролей для endpoint
 */
export function getAllowedRoles(path: string, method: string = 'GET'): string[] {
  const normalizedPath = path.replace(/^\/+|\/+$/g, '');
  
  for (const endpoint of ALL_ENDPOINTS) {
    const endpointPath = endpoint.path.endsWith('/') ? endpoint.path.slice(0, -1) : endpoint.path;
    
    if (normalizedPath === endpointPath || normalizedPath.startsWith(endpointPath + '/')) {
      if (endpoint.methods && !endpoint.methods.includes(method)) {
        return [];
      }
      return endpoint.roles;
    }
  }
  return ['admin']; // По умолчанию только админы
}

