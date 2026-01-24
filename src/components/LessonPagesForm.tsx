import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, setDoc, doc, getDocs } from "firebase/firestore";

const LESSONS = [
  "Anatomi", "Patoloji", "Farmakoloji", "Mikrobiyoloji", "Biyokimya", "Fizyoloji – Histoloji – Embriyoloji",
  "Dahiliye", "Pediatri", "Kadın Doğum ve Hastalıklar", "Genel Cerrahi", "Küçük Stajlar"
];

const LessonPagesForm: React.FC = () => {
  const [pages, setPages] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load from Firestore
    async function fetchPages() {
      const snapshot = await getDocs(collection(db, "lessonPages"));
      const data: Record<string, string> = {};
      snapshot.forEach(docSnap => {
        data[docSnap.id] = docSnap.data().totalPages?.toString() || "";
      });
      setPages(data);
    }
    fetchPages();
  }, []);

  const handleChange = (lesson: string, value: string) => {
    // Only allow positive integers or empty string
    if (/^\d*$/.test(value)) {
      setPages(prev => ({ ...prev, [lesson]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await Promise.all(
      LESSONS.map(lesson =>
        setDoc(doc(db, "lessonPages", lesson), { totalPages: Number(pages[lesson]) || 1 })
      )
    );
    setSaving(false);
    alert("Tüm değişiklikler kaydedildi!");
  };

  return (
    <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
      {LESSONS.map(lesson => (
        <div key={lesson} style={{ marginBottom: 12 }}>
          <label>
            {lesson}:
            <input
              type="number"
              min="1"
              value={pages[lesson] || ""}
              onChange={e => handleChange(lesson, e.target.value)}
              style={{ marginLeft: 8, width: 80 }}
            />
          </label>
        </div>
      ))}
      <button type="submit" disabled={saving} style={{ marginTop: 16 }}>
        {saving ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
};

export default LessonPagesForm;