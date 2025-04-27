import React, { useState, useEffect } from 'react';
import { getLessonTotalPages } from './LessonPagesForm';

const TUS_CATEGORIES = [
  "Anatomi", "Patoloji", "Farmakoloji", "Mikrobiyoloji", "Biyokimya", "Fizyoloji – Histoloji – Embriyoloji",
  "Dahiliye", "Pediatri", "Kadın Doğum ve Hastalıklar", "Genel Cerrahi", "Küçük Stajlar"
];

const LessonForm: React.FC<{ onAddLesson: (lesson: { title: string; date: string; pageStudied: number; hoursStudied: number; questionsSolved: number }) => void }> = ({ onAddLesson }) => {
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [title, setTitle] = useState('');
    const [pageStudied, setPageStudied] = useState('');
    const [hoursStudied, setHoursStudied] = useState('');
    const [questionsSolved, setQuestionsSolved] = useState('');
    const [selectedLesson, setSelectedLesson] = useState('');

    useEffect(() => {
      const last = localStorage.getItem('lastSelectedLesson');
      if (last) setSelectedLesson(last);
    }, []);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onAddLesson({
            title: selectedLesson, // <-- use selectedLesson here!
            date,
            pageStudied: Number(pageStudied),
            hoursStudied: Number(hoursStudied),
            questionsSolved: Number(questionsSolved)
        });
        setTitle('');
        setPageStudied('');
        setHoursStudied('');
        setQuestionsSolved('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Tarih:
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </label>
            </div>
            <div>
                <label>
                    Ders:
                    <select
                      value={selectedLesson}
                      onChange={e => {
                        setSelectedLesson(e.target.value);
                        localStorage.setItem('lastSelectedLesson', e.target.value);
                      }}
                      required
                    >
                        <option value="">Seçiniz</option>
                        {TUS_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </label>
            </div>
            <div>
                <label>
                    Çalışılan Sayfa:
                    <input type="number" value={pageStudied} onChange={e => setPageStudied(e.target.value)} required />
                </label>
            </div>
            <div>
                <label>
                    Çözülen Soru:
                    <input type="number" value={questionsSolved} onChange={e => setQuestionsSolved(e.target.value)} required />
                </label>
            </div>
            <div>
                <label>
                    Çalışılan Saat:
                    <input type="number" value={hoursStudied} onChange={e => setHoursStudied(e.target.value)} required />
                </label>
            </div>
            <button type="submit">Kaydet</button>
        </form>
    );
};

export default LessonForm;