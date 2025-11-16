import type { Course, Reminder } from '../types';

const MLOPS_PLAN_COURSES: Omit<Course, 'id' | 'tags'>[] = [
    {
        name: 'Phase 1: ML Foundations (Weeks 1-8)',
        topics: [
            { id: 'p1-t1', text: 'Supervised Machine Learning (Course 1) - Complete Week 1 & 2', completed: true },
            { id: 'p1-t2', text: 'Neural Networks and Deep Learning - Complete foundational concepts', completed: true },
            { id: 'p1-t3', text: 'Machine Learning in Production - Complete all modules', completed: true },
            { id: 'p1-t4', text: 'Improving Deep Neural Networks - Complete regularization & optimization', completed: true },
        ]
    },
    {
        name: 'Phase 2: MLOps Core (Weeks 9-16)',
        topics: [
            { id: 'p2-t1', text: 'MLOps Specialization (Duke) - Course 1 & 2', completed: false },
            { id: 'p2-t2', text: 'Google Cloud MLOps: Getting Started', completed: false },
            { id: 'p2-t3', text: 'MLOps Specialization (Duke) - Course 3', completed: false },
        ]
    },
    {
        name: 'Phase 3: Containers & Cloud (Weeks 17-20)',
        topics: [
            { id: 'p3-t1', text: 'Docker & Kubernetes (IBM)', completed: false },
            { id: 'p3-t2', text: 'AWS ML Solutions (FREE!)', completed: false },
            { id: 'p3-t3', text: 'Docker & Kubernetes Masterclass (advanced)', completed: false },
        ]
    },
    {
        name: 'Phase 4: Advanced & Projects (Weeks 21-24)',
        topics: [
            { id: 'p4-t1', text: 'Advanced Learning Algorithms', completed: true },
            { id: 'p4-t2', text: 'Structuring Machine Learning Projects', completed: true },
            { id: 'p4-t3', text: 'Portfolio Project: Deploy with Docker + Kubernetes', completed: false },
            { id: 'p4-t4', text: 'Portfolio Project: Create CI/CD pipeline', completed: false },
            { id: 'p4-t5', text: 'Portfolio Project: Build MLflow tracking system', completed: false },
            { id: 'p4-t6', text: 'Portfolio Project: Deploy on AWS/GCP with monitoring', completed: false },
        ]
    },
];

const MLOPS_PLAN_REMINDERS: { week: number, title: string }[] = [
    { week: 1, title: "Start Week 1-2: Supervised Machine Learning" },
    { week: 3, title: "Start Week 3-4: Neural Networks and Deep Learning" },
    { week: 5, title: "Start Week 5-6: Machine Learning in Production" },
    { week: 7, title: "Start Week 7-8: Improving Deep Neural Networks" },
    { week: 9, title: "Start Week 9-12: MLOps Specialization (Duke) - Course 1 & 2" },
    { week: 13, title: "Start Week 13-16: Google Cloud MLOps & MLOps Tools" },
    { week: 17, title: "Start Week 17-18: Docker & Kubernetes (IBM)" },
    { week: 19, title: "Start Week 19-20: AWS ML & Advanced Kubernetes" },
    { week: 21, title: "Start Week 21-22: Advanced Algorithms & Structuring Projects" },
    { week: 23, title: "Start Week 23-24: MLOps Portfolio Projects" },
];


export const generateMLOpsCourses = (): Course[] => {
    return MLOPS_PLAN_COURSES.map((course, index) => ({
        ...course,
        id: `mlops-course-${index + 1}`,
        tags: ['mlops', 'career-plan']
    }));
};

export const generateMLOpsReminders = (): Reminder[] => {
    const today = new Date();
    return MLOPS_PLAN_REMINDERS.map(item => {
        const reminderDate = new Date(today);
        reminderDate.setDate(today.getDate() + (item.week - 1) * 7);
        reminderDate.setHours(9, 0, 0, 0); // Set to 9 AM

        return {
            id: `mlops-rem-${item.week}`,
            title: `MLOps Plan: ${item.title}`,
            date: reminderDate,
            completed: false,
            type: 'reminder',
            tags: ['mlops', 'weekly-goal']
        };
    });
};
