// Конфигурация бэкенд серверов (скрыта от клиента)
export const API_CONFIG = {
  MAIN_BACKEND: process.env.MAIN_BACKEND_URL || 'https://nickly24-cpm-serv-f15d.twc1.net',
  EXAM_BACKEND: process.env.EXAM_BACKEND_URL || 'https://nickly24-cpm-exam-main-225a.twc1.net',
};

// Типы для авторизации
export interface AuthResponse {
  res: {
    role: string;
    id: string;
    full_name: string;
    group_id: string;
  };
}

