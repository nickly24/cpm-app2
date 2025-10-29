'use client';
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import './Progress.css';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
const Progress = ({ onBack }) => {
  const { user } = useAuth();
  const studentName = user?.full_name || (typeof window !== 'undefined' && localStorage.getItem('full_name'));
  const studentId = user?.id || (typeof window !== 'undefined' && localStorage.getItem('id'));
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const fetchedRef = useRef(false);

  // Функция генерации QR-кода
  const generateQRCode = async (text) => {
    try {
      const url = await QRCode.toDataURL(text, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Ошибка генерации QR-кода:', err);
    }
  };

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        if (!studentId || fetchedRef.current) {
          setError('ID студента не найден');
          setLoading(false);
          return;
        }
        fetchedRef.current = true;
        const response = await api.examPost('student-rating/', {
          student_id: studentId
        });
        
        if (response.data.status && response.data.data.length > 0) {
          setRatings(response.data.data[0]);
        } else {
          setError('Данные об успеваемости не найдены');
        }
      } catch (err) {
        // Не блокируем UI при временном 404, попробуем позже
        setError('Ошибка при загрузке данных');
        console.error('Error fetching ratings:', err);
      } finally {
        setLoading(false);
      }
    };

    // Запуск только когда есть корректный studentId
    if (studentId) {
      fetchRatings();
    }
    
    // Генерируем QR-код с ID студента
    if (studentId) {
      generateQRCode(studentId);
    }
  }, [studentId]);

  // Функция для отрисовки столбцов диаграммы
  const renderBar = (value, max = 100, label) => {
    const percentage = Math.min(value, max);
    return (
      <div className="bar-container">
        <div className="bar-label">{label}</div>
        <div className="bar">
          <div 
            className="bar-fill" 
            style={{ width: `${percentage}%` }}
          ></div>
          <span className="bar-value">{value}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="content-section">
      <div className="welcome-section">
        <h2>Добро пожаловать, {studentName}! 👋</h2>
        <div className="student-info">
          <p className="student-id">Ваш ID: <strong>{studentId}</strong></p>
          {qrCodeUrl && (
            <div className="qr-code-container">
              <p className="qr-label">QR-код для сканирования:</p>
              <img src={qrCodeUrl} alt="QR код студента" className="qr-code" />
            </div>
          )}
        </div>
      </div>
      
      
    </div>
  );
};

export default Progress;