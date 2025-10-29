'use client';
import './ExamsList.css';
import { useState, useEffect } from 'react';

export default function ExamsList() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Функция для загрузки экзаменов
    const fetchExams = async () => {
        try {
            const response = await fetch('http://127.0.0.1:81/get-all-exams');
            const data = await response.json();
            if (data.status) {
                setExams(data.exams);
            } else {
                setError('Не удалось загрузить экзамены');
            }
        } catch (err) {
            setError('Ошибка при загрузке экзаменов');
        } finally {
            setLoading(false);
        }
    };

    // Функция для удаления экзамена
    const deleteExam = async (examId) => {
        try {
            const response = await fetch('http://127.0.0.1:81/delete-exam', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ exam_id: examId }),
            });
            const result = await response.json();
            
            if (result) {
                // Обновляем список после успешного удаления
                setExams(exams.filter(exam => exam.id !== examId));
            } else {
                setError('Не удалось удалить экзамен');
            }
        } catch (err) {
            setError('Ошибка при удалении экзамена');
        }
    };

    // Загружаем экзамены при монтировании компонента
    useEffect(() => {
        fetchExams();
    }, []);

    // Форматирование даты
    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    if (loading) {
        return <div className="exams-list">Загрузка...</div>;
    }

    if (error) {
        return <div className="exams-list error">{error}</div>;
    }

    return (
        <div className="exams-list">
            <h2>Список экзаменов</h2>
            {exams.length === 0 ? (
                <p>Нет доступных экзаменов</p>
            ) : (
                <ul className="exams-container">
                    {exams.map((exam) => (
                        <li key={exam.id} className="exam-item">
                            <div className="exam-info">
                                <h3>{exam.name}</h3>
                                <p>Дата: {formatDate(exam.date)}</p>
                            </div>
                            <button 
                                onClick={() => deleteExam(exam.id)}
                                className="delete-button"
                            >
                                Удалить
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}