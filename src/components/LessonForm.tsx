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
    const [questionsSolved, setQuestionsSolved] = useState('');
    const [selectedLesson, setSelectedLesson] = useState('');
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');

    useEffect(() => {
      const last = localStorage.getItem('lastSelectedLesson');
      if (last) setSelectedLesson(last);
    }, []);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const totalHours =
          Number(hours) + Number(minutes) / 60;
        onAddLesson({
            title: selectedLesson, // <-- use selectedLesson here!
            date,
            pageStudied: Number(pageStudied),
            hoursStudied: totalHours,
            questionsSolved: Number(questionsSolved)
        });
        setTitle('');
        setPageStudied('');
        setQuestionsSolved('');
        setHours('');
        setMinutes('');
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
                    Saat:
                    <input
                      type="number"
                      min="0"
                      value={hours}
                      onChange={e => setHours(e.target.value)}
                      required
                      style={{ width: 60, marginRight: 8 }}
                    />
                </label>
                <label>
                    Dakika:
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={e => setMinutes(e.target.value)}
                      required
                      style={{ width: 60 }}
                    />
                </label>
            </div>
            <button type="submit">Kaydet</button>
        </form>
    );
};

export default LessonForm;