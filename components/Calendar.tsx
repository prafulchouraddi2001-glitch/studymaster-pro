import React, { useState, useEffect } from 'react';
import type { Reminder } from '../types';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import { PomodoroIcon, GoogleIcon } from './Icons';

interface CalendarProps {
    reminders: Reminder[];
    onAddReminder: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
}

const AddEventModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<Reminder, 'id' | 'completed'>) => void;
    selectedDate: Date;
}> = ({ isOpen, onClose, onSave, selectedDate }) => {
    const [eventType, setEventType] = useState<'reminder' | 'pomodoro'>('reminder');
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('09:00');
    const [duration, setDuration] = useState(25);
    const [tags, setTags] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setEventType('reminder');
            setTime('09:00');
            setDuration(25);
            setTags('');
        }
    }, [isOpen]);

    const handleSave = () => {
        const [hours, minutes] = time.split(':').map(Number);
        const eventDate = new Date(selectedDate);
        eventDate.setHours(hours, minutes);
        
        const event: Omit<Reminder, 'id' | 'completed'> = {
            title,
            date: eventDate,
            type: eventType,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            ...(eventType === 'pomodoro' && { duration }),
        };
        onSave(event);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Add Event for ${selectedDate.toLocaleDateString()}`}>
            <div className="space-y-4">
                <div className="flex rounded-md shadow-sm">
                    <button onClick={() => setEventType('reminder')} className={`flex-1 px-4 py-2 text-sm font-medium border rounded-l-md ${eventType === 'reminder' ? 'bg-primary text-white' : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Reminder</button>
                    <button onClick={() => setEventType('pomodoro')} className={`flex-1 px-4 py-2 text-sm font-medium border-t border-b border-r rounded-r-md ${eventType === 'pomodoro' ? 'bg-primary text-white' : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Pomodoro Session</button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-base mb-1">Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md shadow-sm bg-transparent"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-base mb-1">Time</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 border rounded-md shadow-sm bg-transparent dark:text-slate-300 dark:[color-scheme:dark]"/>
                </div>
                {eventType === 'pomodoro' && (
                    <div>
                        <label className="block text-sm font-medium text-base mb-1">Duration</label>
                        <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md shadow-sm bg-card">
                            <option value={25}>25 minutes (1 Pomodoro)</option>
                            <option value={50}>50 minutes (2 Pomodoros)</option>
                            <option value={75}>75 minutes (3 Pomodoros)</option>
                            <option value={100}>100 minutes (4 Pomodoros)</option>
                        </select>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-base mb-1">Tags (comma-separated)</label>
                    <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., study, exam" className="w-full px-3 py-2 border rounded-md shadow-sm bg-transparent"/>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!title}>Save Event</Button>
                </div>
            </div>
        </Modal>
    );
};

const DailyAgendaTimeline: React.FC<{ events: Reminder[] }> = ({ events }) => {
    const timelineStartHour = 7;
    const timelineEndHour = 22;
    const totalHours = timelineEndHour - timelineStartHour;

    const getPositionAndHeight = (event: Reminder) => {
        const eventStart = event.date;
        const startHour = eventStart.getHours();
        const startMinute = eventStart.getMinutes();

        if (startHour < timelineStartHour || startHour >= timelineEndHour) {
            return null;
        }

        const topPercent = (((startHour - timelineStartHour) * 60 + startMinute) / (totalHours * 60)) * 100;
        
        let heightPercent = 0;
        if (event.type === 'pomodoro' && event.duration) {
            heightPercent = (event.duration / (totalHours * 60)) * 100;
        }

        return { top: `${topPercent}%`, height: `${heightPercent}%` };
    };

    return (
        <div className="relative h-[40rem] overflow-y-auto pr-2">
            <div className="absolute left-0 top-0 bottom-0 w-12 text-right text-xs text-muted pr-2">
                {Array.from({ length: totalHours + 1 }).map((_, i) => (
                    <div key={i} className="relative" style={{ height: `${100 / totalHours}%` }}>
                        <span className="absolute -top-2">{(timelineStartHour + i).toString().padStart(2, '0')}:00</span>
                    </div>
                ))}
            </div>
            <div className="relative ml-12 h-full border-l border-dashed">
                {events.map(event => {
                    const style = getPositionAndHeight(event);
                    if (!style) return null;

                    return (
                        <div
                            key={event.id}
                            className={`absolute left-2 right-0 p-2 rounded-md flex items-start gap-2 z-10 overflow-hidden ${
                                event.type === 'pomodoro' 
                                ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' 
                                : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                            } ${event.completed ? 'opacity-50' : ''}`}
                            style={{ 
                                top: style.top, 
                                height: style.height !== '0%' ? style.height : 'auto', 
                                minHeight: '3.5rem' 
                            }}
                        >
                             {event.type === 'pomodoro' && <PomodoroIcon />}
                            <div>
                                <p className={`font-semibold text-sm ${event.completed ? 'line-through' : ''}`}>{event.title}</p>
                                <p className="text-xs">{event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {event.duration && `(${event.duration} min)`}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const Calendar: React.FC<CalendarProps> = ({ reminders, onAddReminder }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const remindersForSelectedDate = reminders.filter(r =>
        r.date.getFullYear() === selectedDate.getFullYear() &&
        r.date.getMonth() === selectedDate.getMonth() &&
        r.date.getDate() === selectedDate.getDate()
    ).sort((a,b) => a.date.getTime() - b.date.getTime());

    const today = new Date();

    return (
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base mb-6 flex items-center gap-3">
                🗓️ Calendar
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <Button onClick={() => changeMonth(-1)} size="sm" variant="secondary">‹ Prev</Button>
                        <h2 className="text-lg sm:text-xl font-semibold text-base text-center">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <Button onClick={() => changeMonth(1)} size="sm" variant="secondary">Next ›</Button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="font-medium text-muted py-2">{day}</div>
                        ))}
                        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, day) => {
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1);
                            const isToday = date.toDateString() === today.toDateString();
                            const isSelected = date.toDateString() === selectedDate.toDateString();
                            const dailyEvents = reminders.filter(r => new Date(r.date).toDateString() === date.toDateString());

                            return (
                                <div key={day} className="py-1 flex justify-center">
                                    <button 
                                        onClick={() => setSelectedDate(date)}
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-colors flex flex-col items-center justify-center mx-auto text-sm
                                            ${isSelected ? 'bg-primary text-white' : ''} 
                                            ${!isSelected && isToday ? 'bg-primary/20 text-primary font-bold' : ''}
                                            ${!isSelected && !isToday ? 'hover:bg-slate-100 dark:hover:bg-slate-700' : ''}
                                        `}>
                                        <span>{day + 1}</span>
                                        <div className="flex gap-0.5 mt-0.5">
                                           {dailyEvents.slice(0, 3).map(r => <div key={r.id} className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-white' : (r.type === 'pomodoro' ? 'bg-red-400' : 'bg-accent')}`} />)}
                                        </div>
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                     <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-sm text-muted text-center sm:text-left">
                            <p className="font-semibold text-base">Stay in Sync!</p>
                            <p>Connect your external calendar to see all your events in one place.</p>
                        </div>
                        <Button variant="secondary" size="sm" className="flex items-center gap-2 flex-shrink-0"><GoogleIcon/> Sync with Google Calendar</Button>
                    </div>
                </Card>
                <div className="lg:col-span-1">
                    <Card>
                        <h3 className="font-semibold text-lg text-base border-b pb-2 mb-3">
                           Agenda for {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}
                        </h3>
                        {remindersForSelectedDate.length > 0 ? (
                           <DailyAgendaTimeline events={remindersForSelectedDate} />
                        ) : (
                            <div className="h-[40rem] flex items-center justify-center">
                                <p className="text-muted text-center">No events scheduled for this day.</p>
                            </div>
                        )}
                         <Button fullWidth className="mt-4" onClick={() => setIsModalOpen(true)}>+ Add Event for this Day</Button>
                    </Card>
                </div>
            </div>

            <AddEventModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onAddReminder}
                selectedDate={selectedDate}
            />
        </div>
    );
};

export default Calendar;