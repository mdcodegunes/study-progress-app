import React, { useState, useEffect } from 'react';

const TUS_CATEGORIES = [
  "Anatomi", "Patoloji", "Farmakoloji", "Mikrobiyoloji", "Biyokimya", "Fizyoloji – Histoloji – Embriyoloji",
  "Dahiliye", "Pediatri", "Kadın Doğum ve Hastalıklar", "Genel Cerrahi", "Küçük Stajlar"
];

const LessonForm: React.FC<{ onAddLesson: (lesson: { title: string; date: string; pageStudied: number; hoursStudied: number; questionsSolved: number }) => void, disabled?: boolean }> = ({ onAddLesson, disabled }) => {
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
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
        // Accept 0 for hours/minutes/questionsSolved, but not empty string
        if (!selectedLesson) return;
        if (pageStudied === '' || Number(pageStudied) < 1) return;
        if (hours === '' || Number(hours) < 0) return;
        if (minutes === '' || Number(minutes) < 0 || Number(minutes) > 59) return;
        if (questionsSolved === '' || Number(questionsSolved) < 0) return;

        const totalHours = Number(hours) + Number(minutes) / 60;
        const lesson = {
            title: selectedLesson,
            date,
            pageStudied: Number(pageStudied),
            hoursStudied: totalHours,
            questionsSolved: Number(questionsSolved),
        };
        onAddLesson(lesson);

        // Formu temizle
        setPageStudied('');
        setQuestionsSolved('');
        setHours('');
        setMinutes('');
        // Do not reset selectedLesson, keep user's last choice
        setDate(new Date().toISOString().split('T')[0]);
    };

    if (disabled) return <div>Sayfa sayıları yükleniyor...</div>;

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
                    <input type="number" value={pageStudied} onChange={e => setPageStudied(e.target.value)} required min="1" />
                </label>
            </div>
            <div>
                <label>
                    Çözülen Soru:
                    <input type="number" value={questionsSolved} onChange={e => setQuestionsSolved(e.target.value)} required min="0" />
                </label>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label>
                    Saat:
                    <input
                        type="number"
                        min="0"
                        value={hours}
                        onChange={e => setHours(e.target.value)}
                        required
                        style={{ width: 60, marginRight: 4, marginLeft: 4 }}
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
                        style={{ width: 60, marginLeft: 4 }}
                    />
                </label>
            </div>
            <button type="submit" disabled={disabled}>Kaydet</button>
        </form>
    );
};

export default LessonForm;