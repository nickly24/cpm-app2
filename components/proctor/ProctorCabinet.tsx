'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StudentList from './ProctorFunctions/StudentList';
import HomeworkList from './ProctorFunctions/HomeworkList';
import styles from './ProctorCabinet.module.css';

const Logo = () => (
  <img src="/logo.svg" alt="Logo" className={styles["pc-logo"]} />
);

export default function ProctorCabinet() {
  const { user, logout } = useAuth();
  const fullName = user?.full_name || 'Проктор';
  const groupId = user?.group_id;
  const [showStudents, setShowStudents] = useState(false);

  const toggleStudents = () => {
    setShowStudents(!showStudents);
  };

  return (
    <div className={styles["cabinet"]}>
      <header className={styles["cabinet-header"]}>
        <div className={styles["header-left"]}>
          <Logo />
          <h3>Личный кабинет проктора</h3>
        </div>
        <div className={styles["user-inf"]}>
          <div><span>Добро пожаловать, {fullName}!</span></div>
          <button onClick={logout} className={styles["logout-button"]}>
            Выйти
          </button>
        </div>
      </header>
      
      <main className={styles["cabinet-content"]}>
        <div className={styles["students-section"]}>
          <button 
            onClick={toggleStudents}
            className={styles["toggle-students-btn"]}
          >
            {showStudents ? 'Скрыть список студентов' : 'Показать список студентов'}
            <span className={`${styles["toggle-icon"]} ${showStudents ? styles["open"] : ''}`}>▼</span>
          </button>
          
          <div className={`${styles["students-container"]} ${showStudents ? styles["visible"] : ''}`}>
            <StudentList groupId={groupId} />
          </div>
        </div>
        
        <HomeworkList />
      </main>
    </div>
  );
}

