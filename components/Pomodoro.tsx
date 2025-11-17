import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import { SettingsIcon } from './Icons';
import type { Reminder, PomodoroSequence, PomodoroSession } from '../types';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const defaultSequences: PomodoroSequence[] = [
    { id: 'default-1', name: 'Standard Pomodoro', steps: [
        { type: 'pomodoro', duration: 25 }, { type: 'shortBreak', duration: 5 },
        { type: 'pomodoro', duration: 25 }, { type: 'shortBreak', duration: 5 },
        { type: 'pomodoro', duration: 25 }, { type: 'shortBreak', duration: 5 },
        { type: 'pomodoro', duration: 25 }, { type: 'longBreak', duration: 15 },
    ]},
    { id: 'default-2', name: 'Deep Work (50/10)', steps: [
        { type: 'pomodoro', duration: 50 }, { type: 'shortBreak', duration: 10 },
        { type: 'pomodoro', duration: 50 }, { type: 'longBreak', duration: 30 },
    ]},
];

const GuidedBreak: React.FC<{ type: 'breathing' | 'stretch' }> = ({ type }) => {
    if (type === 'breathing') {
        return (
            <div className="text-center text-muted">
                <h4 className="font-semibold text-base mb-2">Guided Breathing</h4>
                <p>Inhale for 4s, Hold for 4s, Exhale for 6s.</p>
                <div className="mt-4 text-4xl font-bold text-primary animate-pulse">Breathe...</div>
            </div>
        );
    }
    return (
        <div className="text-center text-muted">
            <h4 className="font-semibold text-base mb-2">Quick Stretch</h4>
            <p>Stand up, stretch your arms, and look away from the screen.</p>
        </div>
    );
};

const MusicPlayer: React.FC<{ url: string }> = ({ url }) => {
    if (!url) return null;
    let embedUrl = '';
    if (url.includes('spotify.com')) {
        const urlObj = new URL(url);
        embedUrl = `https://open.spotify.com/embed${urlObj.pathname}`;
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else {
        return <p className="text-xs text-red-500 mt-2">Invalid URL. Please use a valid Spotify or YouTube link.</p>;
    }

    return (
        <div className="mt-6">
            <iframe
                style={{ borderRadius: '12px' }}
                src={embedUrl}
                width="100%"
                height="80"
                frameBorder="0"
                allowFullScreen={false}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
            ></iframe>
        </div>
    );
};


interface PomodoroProps {
    reminders: Reminder[];
    history: PomodoroSession[];
    onSessionComplete: (session: Omit<PomodoroSession, 'id'>) => void;
}

const Pomodoro: React.FC<PomodoroProps> = ({ reminders, history, onSessionComplete }) => {
    const [sequences, setSequences] = useState<PomodoroSequence[]>(defaultSequences);
    const [activeSequenceId, setActiveSequenceId] = useState<string>(defaultSequences[0].id);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [playlistUrl, setPlaylistUrl] = useState('');
    const [breakActivity, setBreakActivity] = useState<'breathing' | 'stretch' | null>(null);

    const activeSequence = useMemo(() => sequences.find(s => s.id === activeSequenceId) || sequences[0], [sequences, activeSequenceId]);
    const currentStep = useMemo(() => activeSequence.steps[currentStepIndex], [activeSequence, currentStepIndex]);
    
    const [timeLeft, setTimeLeft] = useState(currentStep.duration * 60);
    const [isActive, setIsActive] = useState(false);
    const [task, setTask] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const isBreak = currentStep.type === 'shortBreak' || currentStep.type === 'longBreak';

    const scheduledSessions = useMemo(() => {
        const today = new Date();
        return reminders.filter(r => 
            r.type === 'pomodoro' && !r.completed &&
            r.date.getFullYear() === today.getFullYear() &&
            r.date.getMonth() === today.getMonth() &&
            r.date.getDate() === today.getDate()
        ).sort((a,b) => a.date.getTime() - b.date.getTime());
    }, [reminders]);

    const nextStep = useCallback(() => {
        if (!isBreak) {
            onSessionComplete({
                task: task || 'Untitled Focus Session',
                duration: currentStep.duration,
                completedAt: new Date()
            });
        }
        const nextIndex = (currentStepIndex + 1) % activeSequence.steps.length;
        setCurrentStepIndex(nextIndex);
        setTimeLeft(activeSequence.steps[nextIndex].duration * 60);
        setIsActive(false);
        setBreakActivity(null);
    }, [currentStepIndex, activeSequence, isBreak, onSessionComplete, task, currentStep.duration]);

    useEffect(() => {
        let interval: number | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (isActive && timeLeft === 0) {
            new Audio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3').play();
            nextStep();
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isActive, timeLeft, nextStep]);
    
    useEffect(() => {
      document.title = `${formatTime(timeLeft)} - ${currentStep.type === 'pomodoro' ? (task || 'Focus') : 'Break'}`;
    }, [timeLeft, currentStep, task]);

    const handleStartPause = () => setIsActive(!isActive);
    const handleReset = () => {
        setIsActive(false);
        setTimeLeft(currentStep.duration * 60);
    };
    
    useEffect(handleReset, [currentStep]);

    const handleSkip = () => {
        if (window.confirm('Are you sure you want to skip to the next step?')) nextStep();
    };
    
    const handleSaveSettings = (newSequences: PomodoroSequence[], newActiveId: string, newPlaylistUrl: string) => {
        setSequences(newSequences);
        setActiveSequenceId(newActiveId);
        setPlaylistUrl(newPlaylistUrl);
        setCurrentStepIndex(0);
        setIsActive(false);
        const newSeq = newSequences.find(s => s.id === newActiveId) || newSequences[0];
        setTimeLeft(newSeq.steps[0].duration * 60);
    };

    const phaseConfig = useMemo(() => ({
        pomodoro: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', button: 'bg-red-500 hover:bg-red-600', label: 'Focus' },
        shortBreak: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-200', button: 'bg-blue-500 hover:bg-blue-600', label: 'Short Break' },
        longBreak: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-200', button: 'bg-green-500 hover:bg-green-600', label: 'Long Break' },
    }[currentStep.type]), [currentStep]);

    const usageData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const dailyTotals = Array(7).fill(0);

        history.forEach(session => {
            const sessionDate = new Date(session.completedAt);
            const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 3600 * 24));
            if (diffDays < 7) {
                const dayIndex = sessionDate.getDay();
                dailyTotals[dayIndex] += session.duration;
            }
        });

        return days.map((day, index) => ({ name: day, minutes: dailyTotals[index] }));
    }, [history]);

    return (
        <div className="flex flex-col items-center">
            <div className="w-full max-w-md flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-base flex items-center gap-3">🍅 Pomodoro Timer</h1>
                <button onClick={() => setIsSettingsOpen(true)} className="text-muted hover:text-primary transition-colors p-2 rounded-full"><SettingsIcon /></button>
            </div>

            {scheduledSessions.length > 0 && (
                <Card className="w-full max-w-md mb-6">
                    <h3 className="text-lg font-semibold text-base mb-3">Today's Scheduled Sessions</h3>
                    <div className="flex flex-col gap-2">
                        {scheduledSessions.map(session => (
                            <button key={session.id} onClick={() => setTask(session.title)} className="text-left p-2 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                <span className="font-medium text-base">{session.title}</span>
                                <span className="text-sm text-muted ml-2">({session.duration} min)</span>
                            </button>
                        ))}
                    </div>
                </Card>
            )}

            <Card className={`w-full max-w-md text-center transition-colors duration-300 ${phaseConfig.bg}`}>
                <div className="mb-4">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${phaseConfig.bg === 'bg-red-100 dark:bg-red-900/40' ? 'bg-red-200 dark:bg-red-800/50' : phaseConfig.bg === 'bg-blue-100 dark:bg-blue-900/40' ? 'bg-blue-200 dark:bg-blue-800/50' : 'bg-green-200 dark:bg-green-800/50'} ${phaseConfig.text}`}>{phaseConfig.label}</span>
                    <span className="text-xs text-muted ml-2">({currentStepIndex + 1}/{activeSequence.steps.length})</span>
                </div>
                <div className={`text-7xl md:text-8xl font-bold ${phaseConfig.text} my-4`}>{formatTime(timeLeft)}</div>

                {isBreak ? (
                    <div className="my-6 min-h-[60px]">
                        {!breakActivity && (
                            <div className="flex justify-center gap-3">
                                <Button onClick={() => setBreakActivity('breathing')} variant="secondary">Breathe</Button>
                                <Button onClick={() => setBreakActivity('stretch')} variant="secondary">Stretch</Button>
                            </div>
                        )}
                        {breakActivity && <GuidedBreak type={breakActivity} />}
                    </div>
                ) : (
                    <div className="mb-6">
                        <input type="text" value={task} onChange={(e) => setTask(e.target.value)} placeholder="What are you working on?" className="w-full text-center bg-transparent border-b-2 border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400 focus:outline-none p-2 text-lg text-base" />
                    </div>
                )}
                
                <div className="flex justify-center gap-3">
                    <button onClick={handleStartPause} className={`w-28 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${phaseConfig.button}`}>{isActive ? 'Pause' : 'Start'}</button>
                    <Button onClick={handleReset} variant="secondary">Reset</Button>
                    <Button onClick={handleSkip} variant="secondary">Skip</Button>
                </div>

                {!isBreak && <MusicPlayer url={playlistUrl} />}
            </Card>

            <Card className="w-full max-w-2xl mt-8">
                <h3 className="text-lg font-semibold text-base mb-4">📊 Usage Analytics</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-base mb-2">Focus Time (Last 7 Days)</h4>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={usageData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)'}}/>
                                    <Bar dataKey="minutes" fill="var(--color-primary)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-medium text-base mb-2">Recent Sessions</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {history.length > 0 ? history.slice(0, 10).map(s => (
                                <div key={s.id} className="text-sm p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md flex justify-between">
                                    <span className="font-medium text-base truncate pr-2">{s.task}</span>
                                    <span className="text-muted flex-shrink-0">{s.duration} min</span>
                                </div>
                            )) : <p className="text-muted text-sm text-center pt-8">No completed sessions yet.</p>}
                        </div>
                    </div>
                </div>
            </Card>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentSequences={sequences} activeSequenceId={activeSequenceId} playlistUrl={playlistUrl} onSave={handleSaveSettings} />
        </div>
    );
};


const SettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    currentSequences: PomodoroSequence[];
    activeSequenceId: string;
    playlistUrl: string;
    onSave: (sequences: PomodoroSequence[], activeId: string, playlistUrl: string) => void;
}> = ({ isOpen, onClose, currentSequences, activeSequenceId, playlistUrl, onSave }) => {
    const [tempSequences, setTempSequences] = useState(currentSequences);
    const [tempActiveId, setTempActiveId] = useState(activeSequenceId);
    const [tempPlaylistUrl, setTempPlaylistUrl] = useState(playlistUrl);
    
    useEffect(() => {
        if (isOpen) {
            setTempSequences(JSON.parse(JSON.stringify(currentSequences)));
            setTempActiveId(activeSequenceId);
            setTempPlaylistUrl(playlistUrl);
        }
    }, [isOpen, currentSequences, activeSequenceId, playlistUrl]);

    const handleSave = () => {
        onSave(tempSequences, tempActiveId, tempPlaylistUrl);
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pomodoro Settings">
           <div className="space-y-4">
               <div>
                   <label className="block text-sm font-medium text-base mb-1">Focus Music (YouTube/Spotify URL)</label>
                   <input type="text" value={tempPlaylistUrl} onChange={e => setTempPlaylistUrl(e.target.value)} placeholder="Paste playlist URL here" className="w-full p-2 border rounded-md bg-transparent"/>
               </div>
                <hr />
               <p className="text-muted">Select an active sequence, or create your own custom workflow.</p>
               <div>
                   <label className="block text-sm font-medium text-base mb-1">Active Sequence</label>
                   <select value={tempActiveId} onChange={e => setTempActiveId(e.target.value)} className="w-full p-2 border rounded-md bg-card">
                       {tempSequences.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
               </div>
               <div className="text-center text-muted border p-4 rounded-md">
                   <p>Custom sequence editor UI would go here.</p>
               </div>
               <div className="flex justify-end gap-3 pt-2">
                   <Button variant="secondary" onClick={onClose}>Cancel</Button>
                   <Button onClick={handleSave}>Save Changes</Button>
               </div>
           </div>
        </Modal>
    );
};

export default Pomodoro;
