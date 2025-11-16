import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from './Card';
import ProgressBar from './ProgressBar';
import Button from './Button';
import Modal from './Modal';
import { SpinnerIcon } from './Icons';
import { generateWeeklyReport } from '../services/geminiService';
import type { Theme } from '../types';

const weeklyData = [
  { name: 'Mon', hours: 2 }, { name: 'Tue', hours: 3 }, { name: 'Wed', hours: 2.5 },
  { name: 'Thu', hours: 4 }, { name: 'Fri', hours: 3.5 }, { name: 'Sat', hours: 5 }, { name: 'Sun', hours: 1.5 },
];
const focusData = [{ name: 'Focus', value: 75 }, { name: 'Break', value: 25 }];
const COLORS = ['#667eea', '#a78bfa'];

interface AnalyticsProps { theme: Theme; }

const Analytics: React.FC<AnalyticsProps> = ({ theme }) => {
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
        const stats = { time: 21.5, tasks: 5, achievements: 3 }; // Dummy data
        const report = await generateWeeklyReport(stats);
        setReportContent(report);
    } catch (error) {
        setReportContent('Error generating report. Please try again.');
    } finally {
        setIsReportLoading(false);
    }
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-base flex items-center gap-3">📈 Analytics</h1>
            <Button onClick={handleGenerateReport}>Generate Weekly Report</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <Card>
                <h3 className="text-lg font-semibold text-base mb-4">🎯 Focus vs Break Time (%)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={focusData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {focusData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}` }}/>
                    </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <h3 className="text-lg font-semibold text-base mb-4">🏆 Achievements</h3>
              <ul className="space-y-2 text-muted">
                  <li className="flex items-center gap-2">✅ First Session Completed</li>
                  <li className="flex items-center gap-2">🔥 7-Day Study Streak</li>
                  <li className="flex items-center gap-2">📝 Note Master (5 notes created)</li>
                  <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500">⏳ Marathon (5 hours in one day)</li>
              </ul>
            </Card>
            <Card>
                <h3 className="text-lg font-semibold text-base mb-4">📈 Overall Progress</h3>
                <div className="text-muted space-y-3">
                    <p>You've completed 65% of all your topics across all courses.</p>
                    <ProgressBar progress={65} />
                    <p className="text-sm">Keep up the great work!</p>
                </div>
            </Card>
            <Card>
                <h3 className="text-lg font-semibold text-base mb-4">⏱️ Efficiency Stats</h3>
                <ul className="space-y-2 text-muted">
                    <li><strong className="text-base">Avg. Session Length:</strong> 25 min</li>
                    <li><strong className="text-base">Session Completion Rate:</strong> 92%</li>
                    <li><strong className="text-base">Most Productive Day:</strong> Saturday</li>
                </ul>
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
