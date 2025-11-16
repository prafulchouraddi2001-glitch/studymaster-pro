export type Tab = 'dashboard' | 'roadmap' | 'pomodoro' | 'reminders' | 'notes' | 'analytics' | 'calendar' | 'flashcards' | 'tags' | 'mindmap';
export type Theme = 'light' | 'dark' | 'contrast';
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink';

export interface Topic {
  id: string;
  text: string;
  completed: boolean;
}

export interface Course {
  id: string;
  name: string;
  topics: Topic[];
  tags: string[];
}

export interface Reminder {
    id: string;
    title: string;
    date: Date;
    completed: boolean;
    type: 'reminder' | 'pomodoro';
    duration?: number; // in minutes
    tags: string[];
}

export interface Note {
    id:string;
    title: string;
    content: string;
    lastModified: string;
    tags: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; // Index of the correct option
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Gamification Types
export interface GamificationState {
  xp: number;
  level: number;
  unlockedAchievements: Set<AchievementId>;
}
export type AchievementId = 'firstSession' | 'weekStreak' | 'noteMaster' | 'marathon' | 'quizWhiz';

export interface BadgeData {
    id: AchievementId;
    title: string;
    description: string;
    icon: string;
}

// New Personal Use Features Types
export interface Task {
    id: string;
    text: string;
    completed: boolean;
}

export interface Flashcard {
    id: string;
    front: string;
    back: string;
    // SRS properties
    nextReview: Date;
    interval: number; // days
    easeFactor: number; // SM-2 algorithm factor
}

export interface Deck {
    id: string;
    name: string;
    noteId: string; // Link back to the source note
    flashcards: Flashcard[];
}

export interface PomodoroStep {
  type: 'pomodoro' | 'shortBreak' | 'longBreak';
  duration: number; // in minutes
}

export interface PomodoroSequence {
    id: string;
    name: string;
    steps: PomodoroStep[];
}

export interface MindMapNode {
  id: string;
  label: string;
  level: number;
}

export interface MindMapEdge {
  from: string;
  to: string;
}

export interface MindMap {
  noteId: string;
  noteTitle: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}
