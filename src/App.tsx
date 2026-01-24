import React, { useState, useEffect } from 'react';
import LessonForm from './components/LessonForm';
import ProgressList from './components/ProgressList';
import LessonPagesForm from './components/LessonPagesForm';
import { Lesson } from './types';
import { db, addLessonToFirestore } from './firebase';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const App: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [repeatTimes, setRepeatTimes] = useState<Record<string, number>>({});
  const [showPagesForm, setShowPagesForm] = useState(false);
  const [lessonTotalPages, setLessonTotalPages] = useState<Record<string, number>>({});
  const [lessonPagesLoaded, setLessonPagesLoaded] = useState(false);

  // Fetch lessons from Firestore
  const fetchLessons = async () => {
    const snapshot = await getDocs(collection(db, "lessons"));
    setLessons(
      snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "",
          pageStudied: data.pageStudied || 0,
          totalPages: data.totalPages || 1,
          repeatTimes: data.repeatTimes || 1,
          date: data.date || "",
          hoursStudied: data.hoursStudied || 0,
          questionsSolved: data.questionsSolved || 0,
        };
      })
    );
  };

  useEffect(() => {
    fetchLessons();

    async function fetchLessonPages() {
      const snapshot = await getDocs(collection(db, "lessonPages"));
      const data: Record<string, number> = {};
      snapshot.forEach(docSnap => {
        data[docSnap.id] = Number(docSnap.data().totalPages) || 1;
      });
      setLessonTotalPages(data);
      setLessonPagesLoaded(true);
    }
    fetchLessonPages();
  }, []);

  // Add lesson to Firestore and update state
  const onAddLesson = async (lesson: Omit<Lesson, "id" | "totalPages" | "repeatTimes">) => {
    const totalPages = lessonTotalPages[lesson.title] || 1;
    let newRepeatTimes = repeatTimes[lesson.title] || 1;
    let newPageStudied = lesson.pageStudied;

    if (newPageStudied >= totalPages) {
      newRepeatTimes += 1;
      newPageStudied = newPageStudied - totalPages;
    }

    setRepeatTimes(prev => ({ ...prev, [lesson.title]: newRepeatTimes }));

    const lessonWithMeta: Lesson = {
      ...lesson,
      totalPages,
      repeatTimes: newRepeatTimes,
      pageStudied: newPageStudied,
      id: Math.random().toString(36).substr(2, 9), // Temporary ID for React key
    };

    // Optimistically update UI
    setLessons(prev => [lessonWithMeta, ...prev]);

    // Add to Firestore
    await addLessonToFirestore(lessonWithMeta);

    // Fetch again to get the real data (with correct Firestore IDs)
    await fetchLessons();
  };

  // Delete lesson from Firestore and update state
  const onDeleteLesson = async (id: string) => {
    await deleteDoc(doc(db, "lessons", id));
    await fetchLessons();
  };

  if (showPagesForm) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#181a1b",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 0"
      }}>
        <button
          onClick={() => setShowPagesForm(false)}
          style={{
            marginBottom: 32,
            background: "#23272a",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 28px",
            fontSize: 18,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)"
          }}
        >
          Ana Sayfaya Dön
        </button>
        <LessonPagesForm />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setShowPagesForm(true)}
        style={{
          margin: "32px auto 32px auto",
          display: "block",
          background: "#23272a",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "14px 32px",
          fontSize: 20,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)"
        }}
      >
        Derslerin Toplam Sayfa Sayısını Göster
      </button>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 340px', minWidth: 320, maxWidth: 400 }}>
          <LessonForm onAddLesson={onAddLesson} disabled={!lessonPagesLoaded} />
        </div>
        <div style={{ flex: '2 1 400px', minWidth: 320 }}>
          <ProgressList
            progressList={lessons}
            onDeleteLesson={onDeleteLesson}
            lessonTotalPages={lessonTotalPages}
            showOnlyLineGraph={true}
          />
        </div>
      </div>
      <ProgressList
        progressList={lessons}
        onDeleteLesson={onDeleteLesson}
        lessonTotalPages={lessonTotalPages}
        showOnlyLineGraph={false}
      />
    </div>
  );
};

export default App;