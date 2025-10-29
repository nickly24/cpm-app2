'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StudentHomeworkList from './StudentFunctions/StudentHomeworkList.jsx';
import Tests from './StudentFunctions/Tests.jsx';
import Exams from './StudentFunctions/Exams.jsx';
import StudentAttendance from './StudentFunctions/StudentAttendance.jsx';
import Progress from './StudentFunctions/Progress.jsx';
import Training from './StudentFunctions/Training.jsx';
import StudentSchedule from './StudentFunctions/StudentSchedule.jsx';
import ZapsContainer from './StudentFunctions/ZapsContainer.jsx';
import styles from './StudentCabinet.module.css';

const Logo = () => (
  <img src="/logo.svg" alt="Logo" className={styles["sc-logo"]} />
);

export default function StudentCabinet() {
  const { user, logout } = useAuth();
  const studentName = user?.full_name || 'Студент';
  const groupId = user?.group_id || 'не указана';
  const studentId = user?.id;
  
  const [activeComponent, setActiveComponent] = useState('performance');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  // Определяем размер экрана
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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'homework':
        return <StudentHomeworkList />;
      case 'tests':
        return <Tests onBack={() => {}} />;
      case 'exams':
        return <Exams />;
      case 'performance':
        return <Progress onBack={() => {}} />;
      case 'attendance':
        return <StudentAttendance />;
      case 'train':
        return <Training />;
      case 'schedule':
        return <StudentSchedule />;
      case 'zaps':
        return <ZapsContainer />;
      default:
        return <Progress onBack={() => {}} />;
    }
  };

  return (
    <div className={styles["sc-wrapper"]}>
      <header className={styles["sc-header"]}>
        <div className={styles["sc-header-left"]}>
          <Logo />
          <div className={styles["sc-user-meta"]}>
            <span className={styles["sc-user-name"]}>{studentName}</span>
            {groupId && <span className={styles["sc-user-group"]}>Группа: {groupId}</span>}
          </div>
        </div>
        <div className={styles["sc-header-right"]}>
          <button onClick={handleLogout} className={styles["sc-logout-button"]}>
            Выйти
          </button>
          <button
            ref={menuButtonRef}
            className={`${styles["sc-mobile-menu-button"]} ${isMenuOpen ? styles["sc-is-open"] : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={styles["sc-burger-icon"]}>
              <span className={`${styles["sc-burger-line"]} ${isMenuOpen ? styles["open"] : ''}`}></span>
              <span className={`${styles["sc-burger-line"]} ${isMenuOpen ? styles["open"] : ''}`}></span>
              <span className={`${styles["sc-burger-line"]} ${isMenuOpen ? styles["open"] : ''}`}></span>
            </span>
          </button>
        </div>
      </header>

      <div className={`${styles["sc-cabinet"]} ${isSidebarCollapsed ? styles["sc-with-collapsed"] : ''}`}>
        <aside
          ref={sidebarRef}
          className={`${styles["sc-sidebar"]} ${isMenuOpen ? styles["sc-is-open"] : ''} ${isSidebarCollapsed ? styles["sc-collapsed"] : ''}`}
        >
          <nav className={styles["sc-sidebar-nav"]}>
            {[
              { id: 'performance', label: 'Успеваемость', icon: '📈' },
              { id: 'homework', label: 'Домашка', icon: '📝' },
              { id: 'tests', label: 'Тесты', icon: '📊' },
              { id: 'exams', label: 'Экзамены', icon: '🎓' },
              { id: 'attendance', label: 'Посещаемость', icon: '📅' },
              { id: 'train', label: 'Тренировка', icon: '🧠' },
              { id: 'schedule', label: 'Расписание', icon: '📚' },
              { id: 'zaps', label: 'Запросы на отгул', icon: '📋' },
            ].map((item) => (
              <button
                key={item.id}
                className={`${styles["sc-nav-button"]} ${activeComponent === item.id ? styles["sc-is-active"] : ''}`}
                onClick={() => {
                  setActiveComponent(item.id);
                  setIsMenuOpen(false);
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {!isMobile && (
            <div className={styles["sc-sidebar-footer"]}>
              <button
                className={styles["sc-sidebar-toggle"]}
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              >
                {isSidebarCollapsed ? '→' : '← Свернуть'}
              </button>
            </div>
          )}
        </aside>

        <main className={styles["sc-main-content"]}>
          {renderComponent()}
        </main>
      </div>
    </div>
  );
}

