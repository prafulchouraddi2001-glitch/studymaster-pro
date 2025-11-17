import type { Course, Reminder, Phase } from '../types';

const MLOPS_COURSE_DATA: Omit<Course, 'id' | 'tags'> = {
    name: 'Ultimate MLOps Study Plan (24 Weeks)',
    description: 'A comprehensive roadmap to becoming an MLOps Engineer, covering foundations, core tools, cloud platforms, and portfolio projects.',
    prerequisites: ['Proficiency in Python (including libraries like NumPy, Pandas)', 'Basic understanding of linear algebra and calculus', 'Familiarity with Git and GitHub'],
    phases: [
        {
            id: 'mlops-phase-1',
            title: 'Phase 1: ML Foundations (Weeks 1-8)',
            topics: [
                { id: 'p1-t1', text: 'Supervised Machine Learning (Course 1) - Complete Week 1 & 2', completed: true, resources: [
                    { title: 'Machine Learning Specialization', url: 'https://www.coursera.org/specializations/machine-learning-introduction', type: 'Paid Course' },
                    { title: 'StatQuest with Josh Starmer', url: 'https://www.youtube.com/c/statquest', type: 'Video' }
                ]},
                { id: 'p1-t2', text: 'Neural Networks and Deep Learning - Complete foundational concepts', completed: true, resources: [
                    { title: 'Deep Learning Specialization', url: 'https://www.coursera.org/specializations/deep-learning', type: 'Paid Course' },
                    { title: '3Blue1Brown: Neural Networks', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi', type: 'Video' }
                ]},
                { id: 'p1-t3', text: 'Machine Learning in Production - Complete all modules', completed: true, resources: [
                    { title: 'TensorFlow Developer Certificate', url: 'https://www.tensorflow.org/certificate', type: 'Paid Course' },
                    { title: 'ML Engineering on GCP', url: 'https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops', type: 'Paid Course' }
                ]},
                { id: 'p1-t4', text: 'Improving Deep Neural Networks - Complete regularization & optimization', completed: true, resources: [
                     { title: 'Deep Learning Specialization (Course 2)', url: 'https://www.coursera.org/learn/deep-neural-network', type: 'Paid Course' },
                     { title: 'Introduction to Regularization', url: 'https://towardsdatascience.com/introduction-to-regularization-in-machine-learning-5b30a15556a3', type: 'Article' }
                ]},
            ]
        },
        {
            id: 'mlops-phase-2',
            title: 'Phase 2: MLOps Core (Weeks 9-16)',
            topics: [
                { id: 'p2-t1', text: 'MLOps Specialization (Duke) - Course 1 & 2', completed: false, resources: [
                     { title: 'MLOps Specialization by Duke', url: 'https://www.coursera.org/specializations/mlops-machine-learning-duke', type: 'Paid Course' },
                     { title: 'MLOps-Basics', url: 'https://github.com/graviraja/MLOps-Basics', type: 'GitHub' }
                ]},
                { id: 'p2-t2', text: 'Google Cloud MLOps: Getting Started', completed: false, resources: [
                    { title: 'Google Cloud MLOps (Coursera)', url: 'https://www.coursera.org/learn/mlops-fundamentals', type: 'Paid Course' },
                    { title: 'Vertex AI Documentation', url: 'https://cloud.google.com/vertex-ai/docs', type: 'Documentation' },
                ]},
                { id: 'p2-t3', text: 'MLOps Specialization (Duke) - Course 3', completed: false, resources: [
                    { title: 'MLOps Specialization by Duke', url: 'https://www.coursera.org/specializations/mlops-machine-learning-duke', type: 'Paid Course' },
                    { title: 'MLflow Documentation', url: 'https://mlflow.org/docs/latest/index.html', type: 'Documentation' },
                ]},
            ]
        },
        {
            id: 'mlops-phase-3',
            title: 'Phase 3: Containers & Cloud (Weeks 17-20)',
            topics: [
                { id: 'p3-t1', text: 'Docker & Kubernetes (IBM)', completed: false, resources: [
                    { title: 'Docker for the Absolute Beginner', url: 'https://www.udemy.com/course/docker-for-the-absolute-beginner/', type: 'Paid Course'},
                    { title: 'Kubernetes Tutorial for Beginners (freeCodeCamp)', url: 'https://www.youtube.com/watch?v=X48VuDVv0do', type: 'Video'},
                ]},
                { id: 'p3-t2', text: 'AWS ML Solutions (FREE!)', completed: false, resources: [
                    { title: 'Amazon SageMaker Documentation', url: 'https://aws.amazon.com/sagemaker/', type: 'Documentation' },
                    { title: 'AWS Training and Certification', url: 'https://aws.amazon.com/training/', type: 'Free Course' },
                ]},
                { id: 'p3-t3', text: 'Docker & Kubernetes Masterclass (advanced)', completed: false, resources: [
                    { title: 'Certified Kubernetes Administrator (CKA)', url: 'https://www.cncf.io/certification/cka/', type: 'Paid Course' },
                ]},
            ]
        },
        {
            id: 'mlops-phase-4',
            title: 'Phase 4: Advanced & Projects (Weeks 21-24)',
            topics: [
                { id: 'p4-t1', text: 'Advanced Learning Algorithms', completed: true, resources: [
                    { title: 'Advanced Learning Algorithms Course', url: 'https://www.coursera.org/learn/advanced-learning-algorithms', type: 'Paid Course' }
                ]},
                { id: 'p4-t2', text: 'Structuring Machine Learning Projects', completed: true, resources: [
                    { title: 'Structuring ML Projects (Coursera)', url: 'https://www.coursera.org/learn/structuring-machine-learning-projects', type: 'Paid Course' }
                ]},
                { id: 'p4-t3', text: 'Portfolio Project: Deploy with Docker + Kubernetes', completed: false, resources: [] },
                { id: 'p4-t4', text: 'Portfolio Project: Create CI/CD pipeline', completed: false, resources: [] },
                { id: 'p4-t5', text: 'Portfolio Project: Build MLflow tracking system', completed: false, resources: [] },
                { id: 'p4-t6', text: 'Portfolio Project: Deploy on AWS/GCP with monitoring', completed: false, resources: [] },
            ]
        },
    ]
};

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
    return [{
        ...MLOPS_COURSE_DATA,
        id: 'mlops-course-main',
        tags: ['mlops', 'career-plan', 'comprehensive']
    }];
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