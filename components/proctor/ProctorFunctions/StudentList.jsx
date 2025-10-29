'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const StudentList = ({ groupId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchStudents = async () => {
      try {
        if (!groupId) {
          throw new Error('ID группы не указан');
        }

        const response = await api.post('api/student-group-filter', {
          id: groupId
        });

        if (isMounted) {
          if (response.data?.status && Array.isArray(response.data?.res)) {
            setStudents(response.data.res);
          } else {
            throw new Error('Неверный формат данных от сервера');
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Ошибка при загрузке данных');
          console.error('Ошибка:', err);
          setStudents([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStudents();

    return () => {
      isMounted = false;
    };
  }, [groupId]);

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const retryFetch = () => {
    setLoading(true);
    setError(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка списка студентов...</p>
        <button onClick={retryFetch} className="retry-btn">
          Повторить попытку
        </button>
        <style jsx>{`
          .loading-container {
            text-align: center;
            padding: 20px;
          }
          .loading-spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .retry-btn {
            margin-top: 10px;
            padding: 8px 16px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={retryFetch} className="retry-btn">
          Повторить попытку
        </button>
        <style jsx>{`
          .error-container {
            text-align: center;
            padding: 20px;
          }
          .error-message {
            color: #e74c3c;
            margin-bottom: 10px;
          }
          .retry-btn {
            padding: 8px 16px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="student-list">
      <div className="controls">
        <h3>Ваши ученики</h3>
        <input
          type="text"
          placeholder="Поиск по имени..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={students.length === 0}
        />
        <span className="counter">
          Найдено: {filteredStudents.length} из {students.length}
        </span>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>ФИО</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.full_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-results">
          {students.length === 0
            ? 'В этой группе нет студентов'
            : 'Студенты по вашему запросу не найдены'}
        </div>
      )}

      <style jsx>{`
        .student-list {
          width: 100%;
        }
        .controls {
          margin-bottom: 15px;
        }
        .controls h3 {
          margin: 0 0 10px 0;
        }
        .controls input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        .counter {
          color: #666;
          font-size: 0.9rem;
        }
        .table-container {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f5f5f5;
          font-weight: 600;
        }
        tr:hover {
          background-color: #f9f9f9;
        }
        .no-results {
          text-align: center;
          padding: 20px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default StudentList;

