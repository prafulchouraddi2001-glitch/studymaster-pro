import React, { useState, useMemo, useCallback } from 'react';
import type { Course, Topic } from '../types';
import { generateStudyPlan } from '../services/geminiService';
import Card from './Card';
import Button from './Button';
import ProgressBar from './ProgressBar';
import Modal from './Modal';
import { SpinnerIcon, TrashIcon } from './Icons';

const CourseItem: React.FC<{ course: Course, onToggleTopic: (courseId: string, topicId: string) => void, onDeleteCourse: (courseId: string) => void }> = ({ course, onToggleTopic, onDeleteCourse }) => {
    const progress = useMemo(() => {
        const completedTopics = course.topics.filter(t => t.completed).length;
        return course.topics.length > 0 ? (completedTopics / course.topics.length) * 100 : 0;
    }, [course.topics]);

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold text-base mb-2">{course.name}</h3>
                    <div className="flex gap-2 flex-wrap">
                        {course.tags.map(tag => <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">#{tag}</span>)}
                    </div>
                </div>
                <button onClick={() => onDeleteCourse(course.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors p-1 rounded-full">
                    <TrashIcon />
                </button>
            </div>
            <div className="my-3">
                <ProgressBar progress={progress} />
                <p className="text-sm text-muted">Progress: {Math.round(progress)}%</p>
            </div>
            <div className="space-y-2">
                {course.topics.map(topic => (
                    <label key={topic.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={topic.completed} 
                            onChange={() => onToggleTopic(course.id, topic.id)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className={`text-muted group-hover:text-primary ${topic.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'dark:text-slate-300'}`}>
                            {topic.text}
                        </span>
                    </label>
                ))}
            </div>
        </Card>
    );
};

interface RoadmapProps {
    courses: Course[];
    onCoursesChange: (courses: Course[]) => void;
}

const Roadmap: React.FC<RoadmapProps> = ({ courses, onCoursesChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCourseSubject, setNewCourseSubject] = useState('');
    const [newCourseTags, setNewCourseTags] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddCourse = async () => {
        if (!newCourseSubject.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const plan = await generateStudyPlan(newCourseSubject);
            const newCourse: Course = {
                id: `course-${Date.now()}`,
                name: plan.courseName,
                topics: plan.topics.map((topicText, index) => ({
                    id: `topic-${Date.now()}-${index}`,
                    text: topicText,
                    completed: false,
                })),
                tags: newCourseTags.split(',').map(t => t.trim()).filter(Boolean),
            };
            onCoursesChange([newCourse, ...courses]);
            setIsModalOpen(false);
            setNewCourseSubject('');
            setNewCourseTags('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleToggleTopic = useCallback((courseId: string, topicId: string) => {
        onCoursesChange(courses.map(course => {
            if (course.id === courseId) {
                return {
                    ...course,
                    topics: course.topics.map(topic => 
                        topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
                    )
                };
            }
            return course;
        }));
    }, [courses, onCoursesChange]);

    const handleDeleteCourse = useCallback((courseId: string) => {
        if(window.confirm('Are you sure you want to delete this course?')){
            onCoursesChange(courses.filter(c => c.id !== courseId));
        }
    }, [courses, onCoursesChange]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-base flex items-center gap-3">
                    🗺️ Study Roadmap
                </h1>
                <Button onClick={() => setIsModalOpen(true)}>+ Add New Course</Button>
            </div>
            
            <div className="space-y-6">
                {courses.length > 0 ? (
                    courses.map(course => (
                        <CourseItem key={course.id} course={course} onToggleTopic={handleToggleTopic} onDeleteCourse={handleDeleteCourse} />
                    ))
                ) : (
                    <Card>
                        <div className="text-center py-10 text-muted">
                            <p className="text-lg">Your roadmap is empty!</p>
                            <p>Click "+ Add New Course" to generate a new study plan with AI.</p>
                        </div>
                    </Card>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create AI-Powered Study Plan">
                <div className="space-y-4">
                    <p className="text-muted">Enter a subject or topic, and our AI will generate a structured study plan for you.</p>
                    <div>
                        <label htmlFor="course-subject" className="block text-sm font-medium text-base mb-1">Subject</label>
                        <input
                            id="course-subject" type="text" value={newCourseSubject} onChange={(e) => setNewCourseSubject(e.target.value)}
                            placeholder="e.g., 'React for Beginners'"
                            className="w-full px-3 py-2 border rounded-md shadow-sm bg-transparent" disabled={isLoading} />
                    </div>
                     <div>
                        <label htmlFor="course-tags" className="block text-sm font-medium text-base mb-1">Tags (comma-separated)</label>
                        <input
                            id="course-tags" type="text" value={newCourseTags} onChange={(e) => setNewCourseTags(e.target.value)}
                            placeholder="e.g., web-dev, frontend, personal"
                            className="w-full px-3 py-2 border rounded-md shadow-sm bg-transparent" disabled={isLoading} />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isLoading}>Cancel</Button>
                        <Button onClick={handleAddCourse} disabled={isLoading || !newCourseSubject.trim()}>
                            {isLoading ? <span className="flex items-center gap-2"><SpinnerIcon /> Generating...</span> : 'Generate Plan'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Roadmap;
