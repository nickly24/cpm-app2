'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './SupervisorCabinet.module.css';

const Logo = () => (
  <img src="/logo.svg" alt="Logo" className={styles["sv-logo"]} />
);

export default function SupervisorCabinet() {
  const { user, logout } = useAuth();
  const fullName = user?.full_name || 'Супервизор';

  return (
    <div className={styles["cabinet"]}>
      <header className={styles["cabinet-header"]}>
        <div className={styles["header-left"]}>
          <Logo />
          <h3>Личный кабинет супервизора</h3>
        </div>
        <div className={styles["user-inf"]}>
          <div><span>Добро пожаловать, {fullName}!</span></div>
          <button onClick={logout} className={styles["logout-button"]}>
            Выйти
          </button>
        </div>
      </header>
      
      <main className={styles["cabinet-content"]}>
        <div className={styles["placeholder"]}>
          <h2>Кабинет супервизора</h2>
          <p>Функционал в разработке</p>
        </div>
      </main>
    </div>
  );
}

