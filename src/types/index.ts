export interface Lesson {
    id?: string;
    title: string;
    pageStudied: number;
    totalPages: number;
    repeatTimes: number;
    date: string;
    hoursStudied: number;
    questionsSolved: number; // Add this line
}

export interface Progress {
    lesson: string;
    pagesStudied: number;
    repeatTimes: number;
}