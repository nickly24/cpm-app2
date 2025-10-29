'use client';
import React from 'react';

export default function Theme({ id, onBack }) {
  return (
    <div className="theme-container">
      <button onClick={onBack} className="back-button">
        ← Назад к темам
      </button>
      <h1>Тема с ID: {id}</h1>
      {/* Здесь будет контент темы */}
    </div>
  );
}