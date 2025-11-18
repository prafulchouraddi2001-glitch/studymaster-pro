import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Tab, Task, WidgetLayout, PomodoroSession, Course } from '../types';
import Card from './Card';
import Button from './Button';
import { EditIcon, TrashIcon, QuoteIcon, GripVerticalIcon, ResizeIcon, CheckIcon } from './Icons';

// --- WIDGETS ---
const StatCard: React.FC<{ title: string; value: string; change?: string; valueColor?: string; changeColor?: string; }> = ({ title, value, change, valueColor = 'text-blue-500', changeColor = 'text-green-500' }) => (
  <Card className="h-full flex flex-col justify-center">
    <h3 className="text-sm font-medium text-muted">{title}</h3>
    <p className={`text-3xl font-bold mt-1 ${valueColor}`}>{value}</p>
    {change && <p className={`text-xs mt-1 ${changeColor}`}>{change}</p>}
  </Card>
);

const GoalWidget: React.FC = () => {
    const goalMinutes = 200, completedMinutes = 150;
    const progress = goalMinutes > 0 ? Math.min(100, (completedMinutes / goalMinutes) * 100) : 0;
    const data = [{ name: 'Completed', value: progress }, { name: 'Remaining', value: 100 - progress }];
    const COLORS = ['#667eea', '#e2e8f0'];

    return (
        <Card className="h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-muted">Today's Goal</h3>
                <button className="text-slate-400 dark:text-slate-500 hover:text-primary transition-colors p-1 rounded-full text-xs flex items-center gap-1">
                    <EditIcon />
                </button>
            </div>
            <div className="relative flex-1 flex items-center justify-center mt-2">
                <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={45} startAngle={90} endAngle={450} paddingAngle={0} dataKey="value">
                            {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />)}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
                </div>
            </div>
             <p className="text-center text-xs text-muted -mt-2">{completedMinutes} / {goalMinutes} min</p>
        </Card>
    );
};

const QuickActionsWidget: React.FC<{ onTabChange: (tab: Tab) => void }> = ({ onTabChange }) => (
    <Card className="h-full">
        <h3 className="text-lg font-semibold text-base mb-4">🚀 Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => onTabChange('pomodoro')}>🍅 Focus</Button>
            <Button onClick={() => onTabChange('roadmap')} variant="secondary">🗺️ Plan</Button>
            <Button onClick={() => onTabChange('flashcards')} variant="success">🗂️ Review</Button>
            <Button onClick={() => onTabChange('notes')} variant="secondary">📝 Notes</Button>
        </div>
    </Card>
);

const TasksWidget: React.FC<{ tasks: Task[], onTasksChange: (tasks: Task[]) => void }> = ({ tasks, onTasksChange }) => {
    const [newTaskText, setNewTaskText] = useState('');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim()) {
            const newTask: Task = { id: `task-${Date.now()}`, text: newTaskText.trim(), completed: false };
            onTasksChange([newTask, ...tasks]);
            setNewTaskText('');
        }
    };
    const handleToggleTask = (id: string) => onTasksChange(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    const handleDeleteTask = (id: string) => onTasksChange(tasks.filter(t => t.id !== id));

    return (
        <Card className="h-full flex flex-col">
            <h3 className="text-lg font-semibold text-base mb-4">✅ Today's Tasks</h3>
            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Add a quick task..." className="w-full px-3 py-2 border rounded-md shadow-sm bg-transparent"/>
                <Button type="submit" size="md">+</Button>
            </form>
            <div className="space-y-2 overflow-y-auto pr-2 flex-1">
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between group">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={task.completed} onChange={() => handleToggleTask(task.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className={task.completed ? 'line-through text-muted' : 'text-base'}>{task.text}</span>
                        </label>
                        <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"><TrashIcon /></button>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const ScheduleWidget: React.FC = () => (
    <Card className="h-full">
        <h3 className="text-lg font-semibold text-base mb-4">📅 Today's Schedule</h3>
        <div className="text-muted text-center py-4">
          <p>Check the <span className="font-semibold text-primary">Calendar</span> tab for your MLOps schedule!</p>
        </div>
    </Card>
);

const PomodoroWidget: React.FC<{ onSessionComplete: (session: Omit<PomodoroSession, 'id'>) => void }> = ({ onSessionComplete }) => {
    const DURATION = 25 * 60;
    const [timeLeft, setTimeLeft] = useState(DURATION);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: number | null = null;
        if (isActive && timeLeft > 0) {
            interval = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (isActive && timeLeft === 0) {
            onSessionComplete({ task: 'Dashboard Focus', duration: 25, completedAt: new Date() });
            setIsActive(false);
            setTimeLeft(DURATION);
            alert("Pomodoro session complete!");
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isActive, timeLeft, onSessionComplete]);
    
    const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

    return (
        <Card className="h-full flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20">
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-300 mb-2">🍅 Focus Timer</h3>
            <p className="text-4xl font-bold text-red-700 dark:text-red-200">{formatTime(timeLeft)}</p>
            <div className="flex gap-2 mt-3">
                <Button onClick={() => setIsActive(!isActive)} size="sm" className="bg-red-500 hover:bg-red-600">{isActive ? 'Pause' : 'Start'}</Button>
                <Button onClick={() => { setIsActive(false); setTimeLeft(DURATION); }} size="sm" variant="secondary">Reset</Button>
            </div>
        </Card>
    );
};

const QuoteWidget: React.FC = () => {
    const quotes = [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
    ];
    const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

    return (
        <Card className="h-full flex flex-col items-center justify-center">
             <QuoteIcon />
             <p className="text-center text-sm font-medium mt-3">"{quote.text}"</p>
             <p className="text-xs text-muted mt-2">- {quote.author}</p>
        </Card>
    );
};

// --- DASHBOARD COMPONENT ---
interface DashboardProps {
    courses: Course[];
    onTabChange: (tab: Tab) => void;
    tasks: Task[];
    onTasksChange: (tasks: Task[]) => void;
    widgetLayout: WidgetLayout[];
    onWidgetLayoutChange: (layout: WidgetLayout[]) => void;
    onPomodoroSessionComplete: (session: Omit<PomodoroSession, 'id'>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ courses, onTabChange, tasks, onTasksChange, widgetLayout, onWidgetLayoutChange, onPomodoroSessionComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Resizing state
  const [resizingWidget, setResizingWidget] = useState<{ id: string; initialW: number; initialH: number; initialX: number; initialY: number; } | null>(null);

  useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeCoursesCount = useMemo(() => {
    return courses.filter(course => 
        course.phases.flatMap(phase => phase.topics).some(topic => !topic.completed)
    ).length;
  }, [courses]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) return;

    const newLayout = [...widgetLayout];
    const draggedIndex = newLayout.findIndex(w => w.id === draggedWidgetId);
    const targetIndex = newLayout.findIndex(w => w.id === targetId);

    // Swap the widgets
    [newLayout[draggedIndex], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[draggedIndex]];
    
    onWidgetLayoutChange(newLayout);
    setDraggedWidgetId(null);
  };
  
  const startResize = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    const widget = widgetLayout.find(w => w.id === id);
    if (widget) {
        setResizingWidget({
            id,
            initialW: widget.w,
            initialH: widget.h,
            initialX: e.clientX,
            initialY: e.clientY,
        });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingWidget || !gridRef.current) return;

      const isCurrentlyMobile = window.innerWidth < 768;
      const gridColumns = isCurrentlyMobile ? 1 : 4;
      const gridGap = 24; // Corresponds to gap-6 in Tailwind

      const gridCellWidth = (gridRef.current.offsetWidth - ((gridColumns - 1) * gridGap)) / gridColumns;
      const gridCellHeight = 120 + gridGap;

      const dx = e.clientX - resizingWidget.initialX;
      const dy = e.clientY - resizingWidget.initialY;

      const dw = Math.round(dx / gridCellWidth);
      const dh = Math.round(dy / gridCellHeight);

      const newW = Math.max(1, Math.min(gridColumns, resizingWidget.initialW + dw));
      const newH = Math.max(1, Math.min(4, resizingWidget.initialH + dh));

      const newLayout = widgetLayout.map(w =>
        w.id === resizingWidget.id ? { ...w, w: newW, h: newH } : w
      );
      onWidgetLayoutChange(newLayout);
    };

    const handleMouseUp = () => {
      setResizingWidget(null);
    };
    
    if (resizingWidget) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingWidget, widgetLayout, onWidgetLayoutChange]);


  const widgets: Record<string, React.ReactNode> = {
      studyTime: <StatCard title="Today's Study Time" value="2h 30m" change="+25%" />,
      studyStreak: <StatCard title="Study Streak" value="7 days" valueColor="text-orange-500" />,
      activeCourses: <StatCard title="Active Courses" value={String(activeCoursesCount)} valueColor="text-accent" />,
      goal: <GoalWidget />,
      quickActions: <QuickActionsWidget onTabChange={onTabChange} />,
      tasks: <TasksWidget tasks={tasks} onTasksChange={onTasksChange} />,
      schedule: <ScheduleWidget />,
      pomodoro: <PomodoroWidget onSessionComplete={onPomodoroSessionComplete} />,
      quote: <QuoteWidget />
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-base flex items-center gap-3">
            📊 Dashboard
        </h1>
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'primary' : 'secondary'} size="sm" className="flex items-center gap-2 self-end sm:self-auto">
            {isEditing ? <><CheckIcon /> Done</> : <><EditIcon /> Edit Layout</>}
        </Button>
      </div>
        
      <div ref={gridRef} className={`grid gap-6 auto-rows-[120px] ${isMobile ? 'grid-cols-1' : 'md:grid-cols-4'}`}>
          {widgetLayout.map(w => (
             <div 
                key={w.id} 
                className={`relative group transition-all duration-300 ${isEditing ? 'rounded-xl ring-2 ring-primary ring-dashed' : ''} ${draggedWidgetId === w.id ? 'opacity-50' : ''}`}
                style={{
                    gridColumn: !isMobile ? `span ${w.w}` : undefined,
                    gridRow: `span ${w.h}`,
                }}
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, w.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, w.id)}
             >
                <div className={`w-full h-full ${isEditing ? 'jiggle' : ''}`}>
                    {widgets[w.id]}
                </div>
                
                {isEditing && (
                    <>
                        <div className="absolute -top-2 -left-2 text-muted cursor-grab bg-card border rounded-full p-1">
                            <GripVerticalIcon />
                        </div>
                        <div 
                           className="absolute -bottom-2 -right-2 text-muted cursor-nwse-resize bg-card border rounded-full p-1"
                           onMouseDown={(e) => startResize(e, w.id)}
                        >
                            <ResizeIcon />
                        </div>
                    </>
                )}
             </div>
          ))}
      </div>
    </div>
  );
};

export default Dashboard;