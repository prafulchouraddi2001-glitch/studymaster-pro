import React, { useState, useMemo, useCallback } from 'react';
import { ResponsiveContainer, Treemap, Tooltip as RechartsTooltip } from 'recharts';
import type { Course, Topic, Resource, Phase } from '../types';
import { generateStudyPlan, getPrerequisiteResources } from '../services/geminiService';
import Card from './Card';
import Button from './Button';
import ProgressBar from './ProgressBar';
import Modal from './Modal';
import { SpinnerIcon, TrashIcon, ShareIcon, PrerequisitesIcon, LinkIcon, VideoIcon, CourseIcon, BookIcon, DownArrowIcon, GitHubIcon, BrainIcon, ChartBarIcon, SkillTreeIcon } from './Icons';

type RoadmapView = 'list' | 'tree';

const ResourceLink: React.FC<{ resource: Resource }> = ({ resource }) => {
    const Icon = useMemo(() => {
        switch (resource.type) {
            case 'Video': return VideoIcon;
            case 'Book': return BookIcon;
            case 'GitHub': return GitHubIcon;
            case 'Paid Course':
            case 'Free Course': return CourseIcon;
            case 'Article':
            case 'Documentation':
            default: return LinkIcon;
        }
    }, [resource.type]);

    const colorClass = useMemo(() => {
         switch (resource.type) {
            case 'Paid Course': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300';
            case 'Free Course': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
            case 'Video': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
            case 'Article': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
            case 'GitHub': return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        }
    }, [resource.type]);

    return (
        <a href={resource.url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-transform hover:scale-105 ${colorClass}`}>
            <Icon />
            <span>{resource.title}</span>
        </a>
    )
};

const CourseItem: React.FC<{ course: Course, onToggleTopic: (courseId: string, phaseId: string, topicId: string) => void, onDeleteCourse: (courseId: string) => void, onPrerequisiteClick: (skill: string) => void }> = ({ course, onToggleTopic, onDeleteCourse, onPrerequisiteClick }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    const { progress, totalTopics, completedTopics } = useMemo(() => {
        const allTopics = course.phases.flatMap(p => p.topics);
        const completed = allTopics.filter(t => t.completed).length;
        const total = allTopics.length;
        const prog = total > 0 ? (completed / total) * 100 : 0;
        return { progress: prog, totalTopics: total, completedTopics: completed };
    }, [course.phases]);

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                    <h3 className="text-xl font-semibold text-base mb-1">{course.name}</h3>
                    <p className="text-sm text-muted mb-2">{course.description}</p>
                    <div className="flex gap-2 flex-wrap">
                        {course.tags.map(tag => <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">#{tag}</span>)}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onDeleteCourse(course.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors p-1 rounded-full"><TrashIcon /></button>
                     <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-400 dark:text-slate-500 hover:text-primary transition-colors p-1 rounded-full">
                        <DownArrowIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
            
            <div className="my-3">
                <ProgressBar progress={progress} />
                <p className="text-sm text-muted mt-1">Progress: {completedTopics} / {totalTopics} topics completed ({Math.round(progress)}%)</p>
            </div>
            
            {isExpanded && (
                <div className="mt-4 pt-4 border-t">
                    <div className="mb-4">
                        <h4 className="font-semibold text-base flex items-center gap-2 mb-2"><PrerequisitesIcon /> Prerequisites</h4>
                        <ul className="list-none space-y-1">
                            {course.prerequisites.map((req, i) => (
                                <li key={i}>
                                    <button 
                                        onClick={() => onPrerequisiteClick(req)} 
                                        className="flex items-center gap-2 text-left w-full p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                                    >
                                        <span className="font-semibold text-primary group-hover:underline flex-1 pr-2">{req}</span>
                                        <span className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Find resources</span>
                                        <BrainIcon className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </li>
                            ))}
                            {course.prerequisites.length === 0 && <li className="px-2 italic text-muted">None specified. Ready to start!</li>}
                        </ul>
                    </div>

                    <h4 className="font-semibold text-base mb-3">Weekly Phases</h4>
                    <div className="space-y-6">
                        {course.phases.map(phase => (
                            <div key={phase.id} className="pl-4 border-l-2 border-primary/20">
                                <h5 className="font-semibold text-base mb-3">{phase.title}</h5>
                                <div className="space-y-4">
                                    {phase.topics.map(topic => (
                                        <div key={topic.id}>
                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <input type="checkbox" checked={topic.completed} onChange={() => onToggleTopic(course.id, phase.id, topic.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0 mt-1" />
                                                <span className={`text-base group-hover:text-primary ${topic.completed ? 'line-through text-muted' : ''}`}>
                                                    {topic.text}
                                                </span>
                                            </label>
                                            <div className="pl-7 mt-2 flex flex-wrap gap-2">
                                                {topic.resources.map((res, i) => <ResourceLink key={i} resource={res} />)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};

const SkillTreeView: React.FC<{ course: Course, onToggleTopic: (courseId: string, phaseId: string, topicId: string) => void }> = ({ course, onToggleTopic }) => {
    const NODE_WIDTH = 180;
    const NODE_HEIGHT = 60;
    const PHASE_SPACING = 80;
    const TOPIC_SPACING = 20;

    const layout = useMemo(() => {
        let x = 0;
        const nodes: any[] = [];
        const edges: any[] = [];
        const positions: { [id: string]: { x: number, y: number } } = {};
        
        const courseNodeId = `course-${course.id}`;
        nodes.push({ id: courseNodeId, data: { label: course.name, type: 'course' }, position: { x: 0, y: 0 } });
        positions[courseNodeId] = { x: 0, y: 0 };
        
        let lastPhaseNodeId = courseNodeId;
        let y = 150;

        course.phases.forEach((phase) => {
            const phaseNodeId = `phase-${phase.id}`;
            const phaseX = x;
            nodes.push({ id: phaseNodeId, data: { label: phase.title, type: 'phase' }, position: { x: phaseX, y } });
            positions[phaseNodeId] = { x: phaseX, y };
            edges.push({ from: lastPhaseNodeId, to: phaseNodeId });
            
            let topicY = y + NODE_HEIGHT + PHASE_SPACING;
            
            phase.topics.forEach((topic, topicIndex) => {
                const topicNodeId = `topic-${topic.id}`;
                const topicX = phaseX;
                nodes.push({ id: topicNodeId, data: { ...topic, type: 'topic' }, position: { x: topicX, y: topicY } });
                positions[topicNodeId] = { x: topicX, y: topicY };
                edges.push({ from: topicIndex === 0 ? phaseNodeId : `topic-${phase.topics[topicIndex - 1].id}`, to: topicNodeId });
                topicY += NODE_HEIGHT + TOPIC_SPACING;
            });
            
            lastPhaseNodeId = phaseNodeId;
            x += NODE_WIDTH + 100;
            y = 150;
        });
        
        const width = x;
        const height = Math.max(...Object.values(positions).map(p => p.y)) + NODE_HEIGHT + 20;
        
        return { nodes, edges, positions, width, height };
    }, [course]);
    
    return (
        <Card>
            <h3 className="text-xl font-semibold text-base mb-4">{course.name} - Skill Tree</h3>
            <div className="w-full h-[70vh] overflow-auto border rounded-lg bg-slate-50 dark:bg-slate-800/20 p-4">
                 <svg width={layout.width} height={layout.height} className="min-w-full">
                    {/* Edges */}
                    <g>
                        {layout.edges.map((edge, i) => {
                            const fromPos = layout.positions[edge.from];
                            const toPos = layout.positions[edge.to];
                            if (!fromPos || !toPos) return null;
                            const path = `M ${fromPos.x + NODE_WIDTH / 2},${fromPos.y + NODE_HEIGHT} L ${toPos.x + NODE_WIDTH / 2},${toPos.y}`;
                            return <path key={i} d={path} className="skill-tree-connector" />;
                        })}
                    </g>
                    {/* Nodes */}
                    <g>
                        {layout.nodes.map(node => {
                            const { id, data, position } = node;
                            const isCompleted = data.type === 'topic' && data.completed;
                            const isCourse = data.type === 'course';
                            const isPhase = data.type === 'phase';
                            return (
                                <g key={id} transform={`translate(${position.x}, ${position.y})`}>
                                    <foreignObject width={NODE_WIDTH} height={NODE_HEIGHT}>
                                        <button 
                                            onClick={() => data.type === 'topic' && onToggleTopic(course.id, data.phaseId, data.id)}
                                            className={`w-full h-full p-2 rounded-lg text-xs font-semibold overflow-hidden border-2 transition-all duration-300
                                                ${isCourse ? 'bg-primary text-white border-primary-dark' : ''}
                                                ${isPhase ? 'bg-accent/10 text-accent border-accent' : ''}
                                                ${data.type === 'topic' ? (isCompleted ? 'bg-green-500 text-white border-green-600' : 'bg-card text-base hover:border-primary') : ''}
                                            `}
                                        >
                                            {data.label || data.text}
                                        </button>
                                    </foreignObject>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>
        </Card>
    );
};


const CustomizedTreemapContent = (props: any) => {
    const { root, depth, x, y, width, height, index, colors, name, progress } = props;

    const bgColor = colors[index % colors.length];
    const isDarkBg = parseInt(bgColor.substring(1, 3), 16) * 0.299 + parseInt(bgColor.substring(3, 5), 16) * 0.587 + parseInt(bgColor.substring(5, 7), 16) * 0.114 < 186;
    const textColor = isDarkBg ? 'white' : 'black';

    return (
        <g>
            <rect x={x} y={y} width={width} height={height} style={{ fill: bgColor, stroke: '#fff', strokeWidth: 2 / (depth + 1e-10), strokeOpacity: 1 / (depth + 1e-10) }} />
            {width > 80 && height > 50 && (
                <foreignObject x={x + 4} y={y + 4} width={width - 8} height={height - 8}>
                     <div className="w-full h-full flex flex-col justify-between" style={{ color: textColor, fontSize: '12px' }}>
                        <p className="font-semibold break-words">{name}</p>
                        <p className="font-bold text-lg">{Math.round(progress)}%</p>
                    </div>
                </foreignObject>
            )}
        </g>
    );
};

const TreemapTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { name, value: totalTopics, payload: { progress } } = payload[0];
        const completed = Math.round((progress / 100) * totalTopics);
        return (
            <div className="bg-card/80 backdrop-blur-sm p-3 border rounded-md shadow-lg text-sm">
                <p className="font-bold text-base">{name}</p>
                <p className="text-muted">{completed} / {totalTopics} topics completed</p>
                <p className="font-semibold text-primary">{Math.round(progress)}% complete</p>
            </div>
        );
    }
    return null;
};

interface RoadmapProps {
    courses: Course[];
    onCoursesChange: (courses: Course[]) => void;
}

const Roadmap: React.FC<RoadmapProps> = ({ courses, onCoursesChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
    const [view, setView] = useState<RoadmapView>('list');
    const [newCourseSubject, setNewCourseSubject] = useState('');
    const [newCourseTags, setNewCourseTags] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [prereqModalState, setPrereqModalState] = useState<{
        isOpen: boolean;
        skill: string | null;
        resources: Resource[];
        isLoading: boolean;
        error: string | null;
    }>({ isOpen: false, skill: null, resources: [], isLoading: false, error: null });

    const handleAddCourse = async () => {
        if (!newCourseSubject.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const plan = await generateStudyPlan(newCourseSubject);
            const newCourse: Course = {
                id: `course-${Date.now()}`,
                name: plan.courseName,
                description: plan.description,
                prerequisites: plan.prerequisites,
                phases: plan.phases.map((phase, phaseIndex) => ({
                    id: `phase-${Date.now()}-${phaseIndex}`,
                    title: phase.title,
                    topics: phase.topics.map((topic, topicIndex) => ({
                        id: `topic-${Date.now()}-${phaseIndex}-${topicIndex}`,
                        text: topic.text,
                        completed: false,
                        resources: topic.resources || [],
                    })),
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
    
    const handleToggleTopic = useCallback((courseId: string, phaseId: string, topicId: string) => {
        onCoursesChange(courses.map(course => {
            if (course.id === courseId) {
                return {
                    ...course,
                    phases: course.phases.map(phase => {
                        if (phase.id === phaseId) {
                            return {
                                ...phase,
                                topics: phase.topics.map(topic => 
                                    topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
                                )
                            };
                        }
                        return phase;
                    })
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

    const handleGetPrereqResources = async (skill: string) => {
        setPrereqModalState({ isOpen: true, skill, resources: [], isLoading: true, error: null });
        try {
            const resources = await getPrerequisiteResources(skill);
            setPrereqModalState(prev => ({ ...prev, resources, isLoading: false }));
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred.';
            setPrereqModalState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
        }
    };

    const treemapData = useMemo(() => {
        return courses.map(course => {
            const allTopics = course.phases.flatMap(p => p.topics);
            const completed = allTopics.filter(t => t.completed).length;
            const total = allTopics.length;
            const progress = total > 0 ? (completed / total) * 100 : 0;
            return {
                name: course.name,
                size: total || 1, // Size must be > 0
                progress: progress,
            };
        });
    }, [courses]);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-base flex items-center gap-3">
                    🗺️ Study Roadmap
                </h1>
                <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-700 p-1">
                        <button onClick={() => setView('list')} className={`px-3 py-1 text-sm rounded-md flex items-center gap-1.5 ${view === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}>
                            &#9776; List
                        </button>
                        <button onClick={() => setView('tree')} className={`px-3 py-1 text-sm rounded-md flex items-center gap-1.5 ${view === 'tree' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}>
                            <SkillTreeIcon /> Tree
                        </button>
                    </div>
                    <Button onClick={() => setIsShareModalOpen(true)} variant="secondary" className="flex items-center gap-2">
                        <ShareIcon />
                        <span className="hidden md:inline">Share</span>
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)}>+ Add New Course</Button>
                </div>
            </div>

             {courses.length > 0 && (
                <Card className="mb-6">
                    <button 
                        className="w-full flex justify-between items-center"
                        onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                    >
                        <h2 className="text-lg font-semibold text-base flex items-center gap-2">
                            <ChartBarIcon /> Progress Overview
                        </h2>
                        <DownArrowIcon className={`w-5 h-5 transition-transform ${isOverviewExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isOverviewExpanded && (
                         <div className="h-48 sm:h-64 mt-4 -mx-6 -mb-6 sm:mx-0 sm:mb-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <Treemap
                                    data={treemapData}
                                    dataKey="size"
                                    ratio={4 / 3}
                                    stroke="#fff"
                                    fill="#8884d8"
                                    content={<CustomizedTreemapContent colors={COLORS} />}
                                >
                                    <RechartsTooltip content={<TreemapTooltip />} />
                                </Treemap>
                            </ResponsiveContainer>
                        </div>
                    )}
                </Card>
             )}
            
            <div className="space-y-6">
                {courses.length > 0 ? (
                    courses.map(course => (
                         <div key={course.id}>
                            {view === 'list' ? (
                                <CourseItem course={course} onToggleTopic={handleToggleTopic} onDeleteCourse={handleDeleteCourse} onPrerequisiteClick={handleGetPrereqResources} />
                            ) : (
                                <SkillTreeView course={course} onToggleTopic={handleToggleTopic} />
                            )}
                        </div>
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
                    <p className="text-muted">Enter a subject or topic, and our AI will generate a structured, week-by-week study plan for you, complete with prerequisites and diverse resources.</p>
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
            
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} courses={courses} />

            <PrerequisiteModal 
                state={prereqModalState}
                onClose={() => setPrereqModalState({ isOpen: false, skill: null, resources: [], isLoading: false, error: null })}
            />
        </div>
    );
};

const PrerequisiteModal: React.FC<{
    state: {
        isOpen: boolean;
        skill: string | null;
        resources: Resource[];
        isLoading: boolean;
        error: string | null;
    };
    onClose: () => void;
}> = ({ state, onClose }) => {
    const { isOpen, skill, resources, isLoading, error } = state;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Learning Resources for: ${skill}`}>
            <div className="space-y-4">
                {isLoading && (
                    <div className="flex items-center justify-center h-32 text-muted">
                        <SpinnerIcon /> <span className="ml-2">AI is finding the best resources...</span>
                    </div>
                )}
                {error && <p className="text-red-600 text-sm">{error}</p>}
                {!isLoading && !error && (
                    <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-2">
                        {resources.length > 0 ? (
                            resources.map((res, i) => <ResourceLink key={i} resource={res} />)
                        ) : (
                            <p className="text-muted text-center w-full py-10">No specific resources found. Try rephrasing the skill.</p>
                        )}
                    </div>
                )}
                 <div className="flex justify-end pt-2">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </div>
        </Modal>
    );
};

const ShareModal: React.FC<{ isOpen: boolean; onClose: () => void; courses: Course[] }> = ({ isOpen, onClose, courses }) => {
    const [copied, setCopied] = useState(false);

    const shareLink = useMemo(() => {
        if (!isOpen) return '';
        try {
            const data = JSON.stringify(courses);
            // Use a robust base64 encoding method for UTF-8 characters
            const encodedData = btoa(unescape(encodeURIComponent(data)));
            return `${window.location.origin}${window.location.pathname}#roadmap-${encodedData}`;
        } catch (e) {
            console.error("Failed to generate share link", e);
            return 'Could not generate link.';
        }
    }, [isOpen, courses]);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Share Your Roadmap">
            <div className="space-y-4">
                <p className="text-muted">Share this link with others to let them view your study roadmap.</p>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        readOnly
                        value={shareLink}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border rounded-md shadow-sm bg-slate-100 dark:bg-slate-700"
                    />
                    <Button onClick={handleCopy} size="md">
                        {copied ? 'Copied!' : 'Copy'}
                    </Button>
                </div>
                <p className="text-xs text-muted">Note: This link contains your current roadmap data. Any future changes you make will not be reflected unless you generate a new link.</p>
            </div>
        </Modal>
    );
};

export default Roadmap;