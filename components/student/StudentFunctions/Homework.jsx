'use client';
import StudentHomeworkList from "./StudentHomeworkList";

// Homework.jsx
const Homework = ({ onBack }) => {
  return (
    <div className="content-section">
      <button onClick={onBack} className="back-button">← Назад</button>
      <h2>Домашние задания</h2>
      <StudentHomeworkList/>
    </div>
  );
};

export default Homework;

