export type Tab = 'dashboard' | 'roadmap' | 'pomodoro' | 'reminders' | 'notes' | 'analytics' | 'calendar' | 'flashcards' | 'tags' | 'mindmap';
export type Theme = 'light' | 'dark' | 'contrast';
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink';

export type ResourceType = 'Paid Course' | 'Free Course' | 'Article' | 'Video' | 'Documentation' | 'Book' | 'GitHub';

export interface Resource {
  title: string;
  url: string;
  type: ResourceType;
}

export interface Topic {
  id: string;
  text: string;
  completed: boolean;
  resources: Resource[];
}

export interface Phase {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  prerequisites: string[];
  phases: Phase[];
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

export interface NoteVersion {
    content: string;
    timestamp: string;
}

export interface Note {
    id:string;
    title: string;
    content: string;
    lastModified: string;
    tags: string[];
    audioUrl?: string;
    audioSummaryUrl?: string;
    history?: NoteVersion[];
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

export interface AnalyticsProps {
    theme: Theme;
    gamificationState: GamificationState;
    courses: Course[];
    pomodoroHistory: PomodoroSession[];
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

export interface PomodoroSession {
    id: string;
    task: string;
    duration: number; // in minutes
    completedAt: Date;
}

export interface WidgetLayout {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
}