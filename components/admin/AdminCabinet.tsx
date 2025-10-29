'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Homework from './AdminFunctions/Homework/Homework.jsx';
import GroupsFunc from './AdminFunctions/Groups/GroupsFunc.jsx';
import Attendance from './AdminFunctions/Attendance/Attendance.jsx';
import UsersByRole from './AdminFunctions/Users/UsersByRole.jsx';
import TestsManagement from './AdminFunctions/Tests/TestsManagement.jsx';
import ResultsView from './AdminFunctions/Results/ResultsView.jsx';
import Exams from './AdminFunctions/Exams/Exams.jsx';
import StudentAdd from './AdminFunctions/Users/StudentAdd.jsx';
import Schedule from './AdminFunctions/Schedule/Schedule.jsx';
import Zaps from './AdminFunctions/Zaps.jsx';
import ScanAttendance from './AdminFunctions/ScanAttedance/ScanAttendance.jsx';
import styles from './AdminCabinet.module.css';

const Logo = () => (
  <img src="/logo.svg" alt="Logo" className={styles["admin-logo"]} />
);

export default function AdminCabinet() {
  const { user, logout } = useAuth();
  const adminName = user?.full_name || 'Администратор';
  const adminId = user?.id;
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.substring(1);
      if (hash && hash !== currentView) {
        setCurrentView(hash);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentView === 'dashboard') {
        window.location.hash = '';
      } else {
        window.location.hash = currentView;
      }
    }
  }, [currentView]);

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Главная', icon: '🏠', description: 'Обзор системы' },
    { id: 'users', label: 'Пользователи', icon: '👥', description: 'Управление пользователями' },
    { id: 'add-student', label: 'Добавить студента', icon: '➕', description: 'Создание студента' },
    { id: 'schedule', label: 'Расписание', icon: '📚', description: 'Расписание занятий' },
    { id: 'groups', label: 'Группы', icon: '🏫', description: 'Учебные группы' },
    { id: 'assignments', label: 'Домашние задания', icon: '📝', description: 'Управление ДЗ' },
    { id: 'tests', label: 'Тесты', icon: '📊', description: 'Создание тестов' },
    { id: 'test-results', label: 'Результаты', icon: '📈', description: 'Результаты тестов' },
    { id: 'exams', label: 'Экзамены', icon: '🎓', description: 'Управление экзаменами' },
    { id: 'attendance', label: 'Посещаемость', icon: '📅', description: 'Учет посещаемости' },
    { id: 'scan', label: 'Сканирование', icon: '📷', description: 'Скан посещаемости' },
    { id: 'zaps', label: 'Запросы на отгул', icon: '📋', description: 'Обработка отгулов' },
  ];

  const handleMenuClick = (viewId: string) => {
    setCurrentView(viewId);
    setIsMobileSidebarOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'users':
        return <UsersByRole />;
      case 'add-student':
        return <StudentAdd />;
      case 'schedule':
        return <Schedule />;
      case 'groups':
        return <GroupsFunc />;
      case 'assignments':
        return <Homework />;
      case 'attendance':
        return <Attendance />;
      case 'tests':
        return <TestsManagement />;
      case 'test-results':
        return <ResultsView />;
      case 'scan':
        return <ScanAttendance />;
      case 'exams':
        return <Exams />;
      case 'zaps':
        return <Zaps />;
      case 'dashboard':
      default:
        return (
          <div className={styles["dashboard-content"]}>
            <div className={styles["dashboard-header"]}>
              <h2>Добро пожаловать, {adminName}! 👋</h2>
              <p className={styles["dashboard-subtitle"]}>Выберите раздел для работы в боковом меню</p>
            </div>
            
            <div className={styles["dashboard-grid"]}>
              {menuItems.filter(item => item.id !== 'dashboard').map(item => (
                <div
                  key={item.id}
                  className={styles["dashboard-card"]}
                  onClick={() => handleMenuClick(item.id)}
                  style={item.id === 'add-student' ? {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none'
                  } : {}}
                >
                  <div className={styles["dashboard-card-icon"]}>{item.icon}</div>
                  <h3 style={item.id === 'add-student' ? { color: 'white' } : {}}>{item.label}</h3>
                  <p style={item.id === 'add-student' ? { color: 'rgba(255,255,255,0.9)' } : {}}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles["admin-layout"]}>
      <aside className={`${styles["admin-sidebar"]} ${isSidebarCollapsed ? styles["collapsed"] : ''} ${isMobileSidebarOpen ? styles["mobile-open"] : ''}`}>
          <div className={styles["sidebar-header"]}>
            <div className={styles["sidebar-logo"]}>
              <Logo />
              {!isSidebarCollapsed && <span className={styles["logo-text"]}>CPM Admin</span>}
          </div>
        </div>

        <nav className={styles["sidebar-nav"]}>
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`${styles["nav-item"]} ${currentView === item.id ? styles["active"] : ''}`}
              onClick={() => handleMenuClick(item.id)}
              title={item.label}
            >
              <span className={styles["nav-icon"]}>{item.icon}</span>
              {!isSidebarCollapsed && (
                <span className={styles["nav-label"]}>{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {!isMobile && (
          <div className={styles["sidebar-footer"]}>
            <button
              className={styles["sidebar-toggle"]}
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? 'Развернуть' : 'Свернуть'}
            >
              <span className={styles["toggle-icon"]}>{isSidebarCollapsed ? '→' : '←'}</span>
              {!isSidebarCollapsed && <span>Свернуть</span>}
            </button>
          </div>
        )}
      </aside>

      {isMobileSidebarOpen && (
        <div
          className={styles["mobile-overlay"]}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className={styles["admin-main"]}>
        <header className={styles["admin-header"]}>
          <button
            className={`${styles["mobile-menu-btn"]} ${isMobileSidebarOpen ? styles["active"] : ''}`}
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            <span className={styles["burger-icon"]}>
              <span className={`${styles["burger-line"]} ${isMobileSidebarOpen ? styles["open"] : ''}`}></span>
              <span className={`${styles["burger-line"]} ${isMobileSidebarOpen ? styles["open"] : ''}`}></span>
              <span className={`${styles["burger-line"]} ${isMobileSidebarOpen ? styles["open"] : ''}`}></span>
            </span>
          </button>

          <div className={styles["header-title"]}>
            <h1>{menuItems.find(item => item.id === currentView)?.label || 'Панель администратора'}</h1>
          </div>

          <div className={styles["header-actions"]}>
            <div className={styles["user-profile"]}>
              <div className={styles["user-avatar"]}>{adminName.charAt(0).toUpperCase()}</div>
              <div className={styles["user-details"]}>
                <span className={styles["user-name"]}>{adminName}</span>
                <span className={styles["user-role"]}>Администратор</span>
              </div>
            </div>
            <button onClick={handleLogout} className={styles["logout-btn"]}>
              Выйти
            </button>
          </div>
        </header>

        <main className={styles["admin-content"]}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}

