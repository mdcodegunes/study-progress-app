import React, { useState, useEffect } from 'react';

const TUS_CATEGORIES = [
  "Anatomi", "Patoloji", "Farmakoloji", "Mikrobiyoloji", "Biyokimya", "Fizyoloji – Histoloji – Embriyoloji",
  "Dahiliye", "Pediatri", "Kadın Doğum ve Hastalıklar", "Genel Cerrahi", "Küçük Stajlar"
];

const STORAGE_KEY = 'lesson-total-pages';

export function getLessonTotalPages(): Record<string, number> {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

export function setLessonTotalPages(pages: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
}

const LessonPagesForm: React.FC = () => {
  const [pages, setPages] = useState<Record<string, number>>(getLessonTotalPages());

  useEffect(() => {
    setLessonTotalPages(pages);
  }, [pages]);

  return (
    <div>
      <h3>Derslerin Toplam Sayfa Sayısı</h3>
      <form>
        {TUS_CATEGORIES.map(cat => (
          <div key={cat}>
            <label>
              {cat}:
              <input
                type="number"
                value={pages[cat] || ''}
                onChange={e => setPages({ ...pages, [cat]: Number(e.target.value) })}
                min={1}
              />
            </label>
          </div>
        ))}
      </form>
    </div>
  );
};

export default LessonPagesForm;