'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import HomeworkStudents from './HomeworkStudents';
import styles from './HomeworkList.module.css';

const HomeworkList = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [homeworksPerPage] = useState(6);

  const toggleHomework = (id) => {
    if (expandedId !== id) {
      setExpandedId(id);
    }
  };

  useEffect(() => {
    const fetchHomeworks = async () => {
      try {
        const response = await api.get('api/get-homeworks');
        
        if (response.data?.status && Array.isArray(response.data?.res)) {
          setHomeworks(response.data.res);
        } else {
          throw new Error('Неверный формат данных');
        }
      } catch (err) {
        setError(err.message || 'Ошибка загрузки заданий');
        console.error('Ошибка:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworks();
  }, []);

  const indexOfLastHomework = currentPage * homeworksPerPage;
  const indexOfFirstHomework = indexOfLastHomework - homeworksPerPage;
  const currentHomeworks = homeworks.slice(indexOfFirstHomework, indexOfLastHomework);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className={styles["loading"]}>Загрузка заданий...</div>;
  if (error) return <div className={styles["error"]}>{error}</div>;

  return (
    <>
      <div className={styles["homework-list"]}>
        {currentHomeworks.map(hw => (
          <div 
            key={hw.id} 
            className={`${styles["homework-card"]} ${expandedId === hw.id ? styles["expanded"] : ''}`}
            onClick={() => toggleHomework(hw.id)}
          >
            <div className={styles["hw-main-content"]}>
              <div className={styles["hw-header"]}>
                <span className={styles["hw-type"]}>{hw.type}</span>
                <h3 className={styles["hw-title"]}>{hw.name}</h3>
                <div className={styles["hw-deadline"]}>
                  📅 Дедлайн: {hw.deadline ? new Date(hw.deadline).toLocaleDateString('ru-RU') : 'Не указан'}
                </div>
              </div>
              <div className={`${styles["expand-icon"]} ${expandedId === hw.id ? styles["expanded"] : ''}`}>
                {expandedId === hw.id ? '▲' : '▼'}
              </div>
              
              {expandedId === hw.id && (
                <button 
                  className={styles["close-btn"]}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(null);
                  }}
                >
                  Закрыть окно
                </button>
              )}
            </div>
            
            {expandedId === hw.id && (
              <div className={styles["hw-details"]}>
                <HomeworkStudents homeworkId={hw.id} />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className={styles["pagination"]}>
        {Array.from({ length: Math.ceil(homeworks.length / homeworksPerPage) }).map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`${styles["pagination-btn"]} ${currentPage === index + 1 ? styles["active"] : ''}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </>
  );
};

export default HomeworkList;

