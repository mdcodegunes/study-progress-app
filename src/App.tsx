import React, { useState, useEffect } from 'react';
import LessonForm from './components/LessonForm';
import ProgressList from './components/ProgressList';
import LessonPagesForm, { getLessonTotalPages } from './components/LessonPagesForm';
import { Lesson } from './types';
import { loadProgress, saveProgress } from './utils/storage';

const App: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [repeatTimes, setRepeatTimes] = useState<Record<string, number>>({});
  const [showPagesForm, setShowPagesForm] = useState(false);

  useEffect(() => {
    setLessons(loadProgress());
  }, []);

  const onAddLesson = (lesson: { title: string; date: string; pageStudied: number; hoursStudied: number; questionsSolved: number }) => {
    const totalPages = getLessonTotalPages()[lesson.title] || 1;
    let newRepeatTimes = repeatTimes[lesson.title] || 1;
    let newPageStudied = lesson.pageStudied;

    // Check if completed
    if (newPageStudied >= totalPages) {
      newRepeatTimes += 1;
      newPageStudied = 0;
    }

    setRepeatTimes({ ...repeatTimes, [lesson.title]: newRepeatTimes });

    const updatedLessons = [
      ...lessons,
      {
        ...lesson,
        totalPages,
        repeatTimes: newRepeatTimes,
        pageStudied: newPageStudied
      }
    ];
    setLessons(updatedLessons);
    saveProgress(updatedLessons);
  };

  const onDeleteLesson = (index: number) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    setLessons(updatedLessons);
    saveProgress(updatedLessons);
  };

  // Show LessonPagesForm as a full page/modal
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
          <LessonForm onAddLesson={onAddLesson} />
        </div>
        <div style={{ flex: '2 1 400px', minWidth: 320 }}>
          {/* Only the line graph, not the whole ProgressList */}
          <ProgressList
            progressList={lessons}
            onDeleteLesson={onDeleteLesson}
            showOnlyLineGraph={true}
          />
        </div>
      </div>
      {/* The rest of ProgressList (except the line graph) */}
      <ProgressList progressList={lessons} onDeleteLesson={onDeleteLesson} showOnlyLineGraph={false} />
    </div>
  );
};

export default App;