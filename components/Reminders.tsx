import React, { useState } from 'react';
import type { Reminder } from '../types';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import { TrashIcon } from './Icons';

const ReminderItem: React.FC<{ reminder: Reminder, onToggle: (id: string) => void, onDelete: (id: string) => void }> = ({ reminder, onToggle, onDelete }) => {
    const isPast = reminder.date < new Date() && !reminder.completed;
    return (
        <Card className={`transition-opacity ${reminder.completed ? 'opacity-50 bg-slate-50 dark:bg-slate-800/50' : ''}`}>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className={`font-semibold text-lg ${reminder.completed ? 'line-through text-muted' : 'text-base'}`}>{reminder.title}</h3>
                    <p className={`text-sm ${isPast ? 'text-red-500' : 'text-muted'}`}>
                        {reminder.date.toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                        {reminder.tags.map(tag => <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">#{tag}</span>)}
                    </div>
                </div>
                <button onClick={() => onDelete(reminder.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors p-1 rounded-full"><TrashIcon /></button>
            </div>
            <div className="mt-4">
                <Button onClick={() => onToggle(reminder.id)} size="sm" variant={reminder.completed ? 'secondary' : 'success'}>
                    {reminder.completed ? 'Mark as Incomplete' : 'Complete'}
                </Button>
            </div>
        </Card>
    );
};

interface RemindersProps {
    reminders: Reminder[];
    onAdd: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

const Reminders: React.FC<RemindersProps> = ({ reminders, onAdd, onToggle, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newReminderTitle, setNewReminderTitle] = useState('');
    const [newReminderDate, setNewReminderDate] = useState('');
    const [newReminderTags, setNewReminderTags] = useState('');

    const handleAddReminder = () => {
        if (!newReminderTitle || !newReminderDate) return;
        
        onAdd({
            title: newReminderTitle,
            date: new Date(newReminderDate),
            type: 'reminder',
            tags: newReminderTags.split(',').map(t => t.trim()).filter(Boolean),
        });

        setIsModalOpen(false);
        setNewReminderTitle('');
        setNewReminderDate('');
        setNewReminderTags('');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-base flex items-center gap-3">
                    🔔 Reminders
                </h1>
                <Button onClick={() => setIsModalOpen(true)}>+ Add Reminder</Button>
            </div>
            <div className="space-y-4">
                {reminders.map(rem => (
                    <ReminderItem key={rem.id} reminder={rem} onToggle={onToggle} onDelete={onDelete}/>
                ))}
                 {reminders.length === 0 && (
                    <Card>
                        <p className="text-center text-muted py-8">You have no reminders. Add one to get started!</p>
                    </Card>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Reminder">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="rem-title" className="block text-sm font-medium text-base mb-1">Title</label>
                        <input id="rem-title" type="text" value={newReminderTitle} onChange={e => setNewReminderTitle(e.target.value)} placeholder="e.g., Review Chemistry notes" className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-transparent" />
                    </div>
                    <div>
                        <label htmlFor="rem-date" className="block text-sm font-medium text-base mb-1">Date and Time</label>
                        <input id="rem-date" type="datetime-local" value={newReminderDate} onChange={e => setNewReminderDate(e.target.value)} className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-transparent dark:text-slate-300 dark:[color-scheme:dark]" />
                    </div>
                    <div>
                        <label htmlFor="rem-tags" className="block text-sm font-medium text-base mb-1">Tags (comma-separated)</label>
                        <input id="rem-tags" type="text" value={newReminderTags} onChange={e => setNewReminderTags(e.target.value)} placeholder="e.g., urgent, exam" className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-transparent" />
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddReminder}>Add Reminder</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Reminders;
