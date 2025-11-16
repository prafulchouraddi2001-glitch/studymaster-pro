import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { SpinnerIcon } from './Icons';
import { critiqueFeynmanExplanation } from '../services/geminiService';
import type { Note } from '../types';

interface FeynmanTutorProps {
    note: Note;
    onClose: () => void;
}

const FeynmanTutor: React.FC<FeynmanTutorProps> = ({ note, onClose }) => {
    const [explanation, setExplanation] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');
        setFeedback('');
        try {
            const result = await critiqueFeynmanExplanation(note.content, explanation);
            setFeedback(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Feynman Tutor: ${note.title}`}>
            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold text-base mb-1">Your Task</h3>
                    <p className="text-sm text-muted">Explain the concepts from this note in your own words, as if you were teaching it to someone else. Be simple and clear.</p>
                </div>
                <textarea
                    value={explanation}
                    onChange={e => setExplanation(e.target.value)}
                    rows={8}
                    className="w-full p-2 border rounded-md bg-transparent"
                    placeholder="Start your explanation here..."
                    disabled={isLoading}
                />
                <div className="flex justify-end">
                    <Button onClick={handleSubmit} disabled={isLoading || !explanation.trim()}>
                        {isLoading ? <span className="flex items-center gap-2"><SpinnerIcon/> Getting Feedback...</span> : 'Get Feedback'}
                    </Button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {feedback && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                        <h3 className="font-semibold text-base mb-2">AI Tutor Feedback</h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br>') }} />
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default FeynmanTutor;
