import React from 'react';
import Card from './Card';
import Button from './Button';
import { BrainIcon } from './Icons';

interface ApiKeyPromptProps {
    onSelectKey: () => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onSelectKey }) => {
    return (
        <div className="fixed inset-0 bg-base flex items-center justify-center p-4">
            <Card className="max-w-md text-center">
                <BrainIcon className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-2xl font-bold mt-4">API Key Required</h1>
                <p className="text-muted mt-2">
                    To power the AI features of this application, you need to select a Gemini API key.
                </p>
                <p className="text-xs text-muted mt-2">
                    Your key is used directly by your browser to communicate with the Google AI API and is not stored by this application.
                </p>
                <Button onClick={onSelectKey} className="mt-6" fullWidth>
                    Select API Key
                </Button>
                 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-muted mt-4 hover:text-primary underline block">
                    Learn about Gemini API billing
                </a>
            </Card>
        </div>
    );
};

export default ApiKeyPrompt;
