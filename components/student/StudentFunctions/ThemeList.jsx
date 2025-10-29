'use client';
import React from 'react';

export default function ThemeList({ themes, onSelect }) {
  return (
    <div className="theme-list">
      <h1>Выберите тему для изучения</h1>
      <div className="themes-container">
        {themes.map(theme => (
          <div 
            key={theme.id} 
            className="theme-card"
            onClick={() => onSelect(theme)}
          >
            <h3>{theme.name}</h3>
            <div className="progress-container">
              <div 
                className="progress-bar"
                 style={{ width: `${theme.progress}%` }}
              ></div>
              <span className="progress-text">{theme.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}