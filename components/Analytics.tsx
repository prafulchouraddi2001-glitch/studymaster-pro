import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from './Card';
import ProgressBar from './ProgressBar';
import Button from './Button';
import Modal from './Modal';
import { SpinnerIcon, TrophyIcon } from './Icons';
import { generateWeeklyReport } from '../services/geminiService';
import type { AnalyticsProps, BadgeData } from '../types';

const weeklyData = [
  { name: 'Mon', hours: 2 }, { name: 'Tue', hours: 3 }, { name: 'Wed', hours: 2.5 },
  { name: 'Thu', hours: 4 }, { name: 'Fri', hours: 3.5 }, { name: 'Sat', hours: 5 }, { name: 'Sun', hours: 1.5 },
];

const allBadges: BadgeData[] = [
    { id: 'firstSession', title: 'First Session', description: 'Complete your first Pomodoro session.', icon: '✅' },
    { id: 'weekStreak', title: 'Week Streak', description: 'Study every day for 7 days.', icon: '🔥' },
    { id: 'noteMaster', title: 'Note Master', description: 'Create 5 detailed notes.', icon: '📝' },
    { id: 'marathon', title: 'Marathon Runner', description: 'Study for 5 hours in a single day.', icon: '🏃' },
    { id: 'quizWhiz', title: 'Quiz Whiz', description: 'Ace 3 quizzes in a row.', icon: '🧠' },
];

const Analytics: React.FC<AnalyticsProps> = ({ theme, gamificationState, courses }) => {
  const isDark = theme === 'dark';
  const tickColor = isDark ? '#94a3b8' : '#6b7280';

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [isReportLoading, setIsReportLoading] = useState(false);

  const handleGenerateReport = async () => {
    setIsReportModalOpen(true);
    setIsReportLoading(true);
    setReportContent('');
    try {
        const stats = { time: 21.5, tasks: 5, achievements: gamificationState.unlockedAchievements.size };
        const report = await generateWeeklyReport(stats);
        setReportContent(report);
    } catch (error) {
        setReportContent('Error generating report. Please try again.');
    } finally {
        setIsReportLoading(false);
    }
  };

  const xpForNextLevel = (gamificationState.level + 1) * 100;
  const levelProgress = (gamificationState.xp / xpForNextLevel) * 100;

  const leaderboardData = [
    { name: 'Alex R.', xp: 450 },
    { name: 'You', xp: gamificationState.xp },
    { name: 'Sam K.', xp: 210 },
    { name: 'Jordan P.', xp: 180 },
    { name: 'Chris L.', xp: 95 },
  ].sort((a,b) => b.xp - a.xp);

  const courseCompletionData = courses.map(course => {
    const allTopics = course.phases.flatMap(p => p.topics);
    const completed = allTopics.filter(t => t.completed).length;
    const total = allTopics.length;
    return {
        name: course.name.length > 20 ? `${course.name.substring(0, 18)}...` : course.name,
        completed,
        remaining: total - completed,
    };
  });


  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-base flex items-center gap-3">📈 Analytics</h1>
            <Button onClick={handleGenerateReport}>Generate Weekly Report</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
                <h3 className="text-lg font-semibold text-base mb-2">Level Progression</h3>
                <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-primary bg-primary/10 rounded-lg w-16 h-16 flex items-center justify-center">{gamificationState.level}</div>
                    <div className="flex-1">
                        <p className="font-semibold text-base">{gamificationState.xp} / {xpForNextLevel} XP</p>
                        <ProgressBar progress={levelProgress} />
                        <p className="text-xs text-muted mt-1">{xpForNextLevel - gamificationState.xp} XP to next level</p>
                    </div>
                </div>
            </Card>
            <Card>
                <h3 className="text-lg font-semibold text-base mb-3 flex items-center gap-2"><TrophyIcon/> Leaderboard</h3>
                <ul className="space-y-2">
                    {leaderboardData.map((user, index) => (
                        <li key={user.name} className={`flex items-center justify-between p-2 rounded-md ${user.name === 'You' ? 'bg-primary/10' : ''}`}>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-sm w-6 text-center">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}</span>
                                <span className={`font-medium ${user.name === 'You' ? 'text-primary' : 'text-base'}`}>{user.name}</span>
                            </div>
                            <span className="font-semibold text-sm text-muted">{user.xp} XP</span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>

        <Card className="mb-6">
            <h3 className="text-lg font-semibold text-base mb-4">🏅 Achievements</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {allBadges.map(badge => {
                    const isUnlocked = gamificationState.unlockedAchievements.has(badge.id);
                    return (
                        <div key={badge.id} className={`text-center p-4 border rounded-lg ${isUnlocked ? 'border-primary/50 bg-primary/5' : 'opacity-50'}`}>
                            <div className={`text-4xl transition-transform duration-300 ${isUnlocked ? 'transform scale-110' : ''}`}>{badge.icon}</div>
                            <p className="font-semibold text-sm mt-2 text-base">{badge.title}</p>
                            <p className="text-xs text-muted mt-1">{badge.description}</p>
                        </div>
                    );
                })}
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card>
                <h3 className="text-lg font-semibold text-base mb-4">📘 Course Topic Completion</h3>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={courseCompletionData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'}/>
                            <XAxis type="number" stroke={tickColor} />
                            <YAxis type="category" dataKey="name" stroke={tickColor} width={100} />
                            <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}` }}/>
                            <Legend wrapperStyle={{ color: tickColor }}/>
                            <Bar dataKey="completed" stackId="a" fill="var(--color-primary)" name="Completed" />
                            <Bar dataKey="remaining" stackId="a" fill={isDark ? '#475569' : '#e2e8f0'} name="Remaining" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            <Card>
                <h3 className="text-lg font-semibold text-base mb-4">📊 Weekly Study Time (hours)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'}/>
                        <XAxis dataKey="name" stroke={tickColor} />
                        <YAxis stroke={tickColor} />
                        <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}` }}/>
                        <Legend wrapperStyle={{ color: tickColor }}/>
                        <Bar dataKey="hours" fill="var(--color-accent)" />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>

        <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Your AI-Powered Weekly Review">
            {isReportLoading && <div className="flex justify-center items-center h-48"><SpinnerIcon /> <span className="text-muted ml-2">Analyzing your week...</span></div>}
            {reportContent && (
                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: reportContent.replace(/\n/g, '<br>') }} />
            )}
        </Modal>
    </div>
  );
};

export default Analytics;