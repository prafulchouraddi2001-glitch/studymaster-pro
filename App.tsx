import React, { useState, useCallback, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Roadmap from './components/Roadmap';
import Pomodoro from './components/Pomodoro';
import Reminders from './components/Reminders';
import Notes from './components/Notes';
import Analytics from './components/Analytics';
import Calendar from './components/Calendar';
import Flashcards from './components/Flashcards';
import Tags from './components/Tags';
import MindMapViewer from './components/MindMapViewer';
import FeynmanTutor from './components/FeynmanTutor';
import AICompanion from './components/AICompanion';
import ThemeSettings from './components/ThemeSettings';
import { ChatIcon } from './components/Icons';
import { continueConversation, generateMindMapFromNote } from './services/geminiService';
import { generateMLOpsCourses, generateMLOpsReminders } from './data/mlopsPlan';
import type { Tab, Reminder, Message, Theme, AccentColor, Course, Note, Deck, Task, MindMap } from './types';

// Generate initial state from the MLOps plan
const initialCourses = generateMLOpsCourses();
const initialReminders = generateMLOpsReminders();

const ACCENT_HUES: Record<AccentColor, number> = {
    blue: 231,
    purple: 262,
    green: 145,
    orange: 35,
    pink: 330,
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // App-wide state
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [notes, setNotes] = useState<Note[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);

  // Theme State
  const [theme, setTheme] = useState<Theme>('light');
  const [accentColor, setAccentColor] = useState<AccentColor>('blue');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // AI Companion State
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isCompanionLoading, setIsCompanionLoading] = useState(false);
  const [companionError, setCompanionError] = useState<string | null>(null);

  // Feynman Tutor State
  const [feynmanNote, setFeynmanNote] = useState<Note | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.className = theme;
    root.style.setProperty('--color-primary-hue', String(ACCENT_HUES[accentColor]));
    root.style.setProperty('--color-accent-hue', String(ACCENT_HUES[accentColor]));
  }, [theme, accentColor]);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  const handleGenerateMindMap = async (note: Note) => {
    try {
        const existingMap = mindMaps.find(m => m.noteId === note.id);
        if (existingMap && window.confirm('A mind map for this note already exists. Do you want to regenerate it?')) {
            // Regeneration logic
        }
        const newMapData = await generateMindMapFromNote(note.title, note.content);
        const newMap: MindMap = { ...newMapData, noteId: note.id, noteTitle: note.title };
        setMindMaps(prev => [...prev.filter(m => m.noteId !== note.id), newMap]);
        setActiveTab('mindmap');
    } catch (error) {
        alert('Failed to generate mind map. Please try again.');
        console.error(error);
    }
  };

  const handleAddReminder = (reminder: Omit<Reminder, 'id' | 'completed'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: `rem-${Date.now()}`,
      completed: false,
    };
    setReminders(prev => [newReminder, ...prev].sort((a, b) => a.date.getTime() - b.date.getTime()));
  };
  
  // Handlers for all state
  const handleToggleReminder = (id: string) => setReminders(prev => prev.map(rem => rem.id === id ? { ...rem, completed: !rem.completed } : rem));
  const handleDeleteReminder = (id: string) => setReminders(prev => prev.filter(rem => rem.id !== id));
  
  const handleSetCourses = (newCourses: Course[]) => setCourses(newCourses);
  const handleSetNotes = (newNotes: Note[]) => setNotes(newNotes);
  const handleSetDecks = (newDecks: Deck[]) => setDecks(newDecks);
  const handleSetTasks = (newTasks: Task[]) => setTasks(newTasks);

  const handleSendChatMessage = async (message: string) => {
      const userMessage: Message = { role: 'user', parts: [{ text: message }] };
      const newHistory = [...chatHistory, userMessage];
      setChatHistory(newHistory);
      setIsCompanionLoading(true);
      setCompanionError(null);

      try {
          const responseText = await continueConversation(newHistory, message, activeTab);
          const modelMessage: Message = { role: 'model', parts: [{ text: responseText }] };
          setChatHistory(prev => [...prev, modelMessage]);
      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setCompanionError(errorMessage);
          const errorResponse: Message = { role: 'model', parts: [{ text: `Sorry, I encountered an error: ${errorMessage}` }] };
          setChatHistory(prev => [...prev, errorResponse]);
      } finally {
          setIsCompanionLoading(false);
      }
  };

  const allTaggedItems = [...courses, ...reminders, ...notes];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={handleTabChange} tasks={tasks} onTasksChange={handleSetTasks} />;
      case 'roadmap':
        return <Roadmap courses={courses} onCoursesChange={handleSetCourses} />;
      case 'pomodoro':
        return <Pomodoro reminders={reminders} />;
      case 'reminders':
        return <Reminders reminders={reminders} onAdd={handleAddReminder} onToggle={handleToggleReminder} onDelete={handleDeleteReminder} />;
      case 'notes':
        return <Notes notes={notes} onNotesChange={handleSetNotes} decks={decks} onDecksChange={handleSetDecks} onGenerateMindMap={handleGenerateMindMap} onOpenFeynmanTutor={setFeynmanNote} />;
      case 'analytics':
        return <Analytics theme={theme}/>;
      case 'calendar':
        return <Calendar reminders={reminders} onAddReminder={handleAddReminder} />;
      case 'flashcards':
        return <Flashcards decks={decks} onDecksChange={handleSetDecks} />;
      case 'tags':
        return <Tags allItems={allTaggedItems} />;
      case 'mindmap':
        return <MindMapViewer mindMaps={mindMaps} />;
      default:
        return <Dashboard onTabChange={handleTabChange} tasks={tasks} onTasksChange={handleSetTasks} />;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-base text-base">
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} onOpenSettings={() => setIsSettingsOpen(true)} />
      <main className="pt-24 md:pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {renderContent()}
      </main>
      
      <button
        onClick={() => setIsCompanionOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-primary to-accent text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-label="Open AI Study Companion"
      >
        <ChatIcon />
      </button>

      <AICompanion
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
        messages={chatHistory}
        onSendMessage={handleSendChatMessage}
        isLoading={isCompanionLoading}
      />

      <ThemeSettings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={theme}
        onThemeChange={setTheme}
        currentAccent={accentColor}
        onAccentChange={setAccentColor}
      />
      
      {feynmanNote && (
          <FeynmanTutor
              note={feynmanNote}
              onClose={() => setFeynmanNote(null)}
          />
      )}
    </div>
  );
};

export default App;