import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Tab, Task } from '../types';
import Card from './Card';
import Button from './Button';
import { EditIcon, TrashIcon, UpArrowIcon, DownArrowIcon } from './Icons';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  valueColor?: string;
  changeColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, valueColor = 'text-blue-500', changeColor = 'text-green-500' }) => (
  <Card>
    <h3 className="text-sm font-medium text-muted">{title}</h3>
    <p className={`text-3xl font-bold mt-1 ${valueColor}`}>{value}</p>
    {change && <p className={`text-xs mt-1 ${changeColor}`}>{change}</p>}
  </Card>
);

const GoalCard: React.FC<{ goalMinutes: number, completedMinutes: number }> = ({ goalMinutes, completedMinutes }) => {
    const progress = goalMinutes > 0 ? Math.min(100, (completedMinutes / goalMinutes) * 100) : 0;
    const data = [
        { name: 'Completed', value: progress },
        { name: 'Remaining', value: 100 - progress },
    ];
    const COLORS = ['#667eea', '#e2e8f0'];

    return (
        <Card>
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-muted">Today's Goal</h3>
                <button className="text-slate-400 dark:text-slate-500 hover:text-primary transition-colors p-1 rounded-full text-xs flex items-center gap-1">
                    <EditIcon />
                </button>
            </div>
            <div className="relative h-28 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={45} startAngle={90} endAngle={450} paddingAngle={0} dataKey="value">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
                </div>
            </div>
             <p className="text-center text-xs text-muted mt-1">{completedMinutes} / {goalMinutes} min</p>
        </Card>
    );
};

const DailyTasks: React.FC<{ tasks: Task[], onTasksChange: (tasks: Task[]) => void }> = ({ tasks, onTasksChange }) => {
    const [newTaskText, setNewTaskText] = useState('');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim()) {
            const newTask: Task = { id: `task-${Date.now()}`, text: newTaskText.trim(), completed: false };
            onTasksChange([newTask, ...tasks]);
            setNewTaskText('');
        }
    };

    const handleToggleTask = (id: string) => {
        onTasksChange(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleDeleteTask = (id: string) => {
        onTasksChange(tasks.filter(t => t.id !== id));
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-base mb-4">✅ Today's Tasks</h3>
            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    value={newTaskText}
                    onChange={e => setNewTaskText(e.target.value)}
                    placeholder="Add a quick task..."
                    className="w-full px-3 py-2 border rounded-md shadow-sm bg-transparent"
                />
                <Button type="submit" size="md">+</Button>
            </form>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between group">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={task.completed} onChange={() => handleToggleTask(task.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className={task.completed ? 'line-through text-muted' : 'text-base'}>{task.text}</span>
                        </label>
                        <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity">
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
        </Card>
    );
};

interface DashboardCardWrapperProps {
    id: string;
    index: number;
    total: number;
    onMove: (index: number, direction: 'up' | 'down') => void;
    children: React.ReactNode;
}
const DashboardCardWrapper: React.FC<DashboardCardWrapperProps> = ({ id, index, total, onMove, children }) => (
    <div className="relative group">
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
            <button onClick={() => onMove(index, 'up')} disabled={index === 0} className="p-1 rounded-full bg-card/50 backdrop-blur-sm disabled:opacity-20"><UpArrowIcon/></button>
            <button onClick={() => onMove(index, 'down')} disabled={index === total - 1} className="p-1 rounded-full bg-card/50 backdrop-blur-sm disabled:opacity-20"><DownArrowIcon/></button>
        </div>
        {children}
    </div>
);


interface DashboardProps {
    onTabChange: (tab: Tab) => void;
    tasks: Task[];
    onTasksChange: (tasks: Task[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onTabChange, tasks, onTasksChange }) => {
  const studyTimeMinutes = 150;
  const goalMinutes = 200;

  const initialCardOrder: string[] = ['stats', 'actions', 'schedule', 'tasks'];
  const [cardOrder, setCardOrder] = useState<string[]>(initialCardOrder);

  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
      const newOrder = [...cardOrder];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      setCardOrder(newOrder);
  };
  
  const cards: Record<string, React.ReactNode> = {
      stats: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Today's Study Time" value="2h 30m" change="+25% from yesterday" />
            <StatCard title="Study Streak" value="7 days" change="Best: 15 days" valueColor="text-warning" changeColor="text-muted" />
            <StatCard title="Active Courses" value="4" change="MLOps Plan Active" valueColor="text-accent" changeColor="text-muted"/>
            <GoalCard goalMinutes={goalMinutes} completedMinutes={studyTimeMinutes} />
        </div>
      ),
      actions: (
        <Card>
            <h3 className="text-lg font-semibold text-base mb-4">🚀 Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Button onClick={() => onTabChange('pomodoro')} fullWidth>🍅 Start Focus Session</Button>
              <Button onClick={() => onTabChange('roadmap')} variant="secondary" fullWidth>🗺️ View Study Plan</Button>
              <Button onClick={() => onTabChange('flashcards')} variant="success" fullWidth>🗂️ Review Flashcards</Button>
              <Button onClick={() => onTabChange('notes')} variant="secondary" fullWidth>📝 Take Notes</Button>
            </div>
        </Card>
      ),
      schedule: (
        <Card>
            <h3 className="text-lg font-semibold text-base mb-4">📅 Today's Schedule</h3>
            <div className="text-muted text-center py-12">
              <p>Check the <span className="font-semibold text-primary">Calendar</span> tab for your MLOps schedule!</p>
            </div>
        </Card>
      ),
      tasks: <DailyTasks tasks={tasks} onTasksChange={onTasksChange} />,
  };


  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-base mb-6 flex items-center gap-3">
        📊 Dashboard
      </h1>
        
      <div className="space-y-6">
          {cardOrder.map((cardId, index) => (
              <DashboardCardWrapper key={cardId} id={cardId} index={index} total={cardOrder.length} onMove={handleMoveCard}>
                  {cards[cardId]}
              </DashboardCardWrapper>
          ))}
      </div>
    </div>
  );
};

export default Dashboard;