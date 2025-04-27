import { Lesson } from '../types';

const STORAGE_KEY = 'study-progress-lessons';

export const saveProgress = (lessons: Lesson[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
};

export const loadProgress = (): Lesson[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearProgress = () => {
  localStorage.removeItem(STORAGE_KEY);
};