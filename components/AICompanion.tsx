import React, { useState, useEffect, useRef } from 'react';
import type { Message } from '../types';
import { SendIcon, CloseIcon } from './Icons';

interface AICompanionProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isModel = message.role === 'model';
  return (
    <div className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${
          isModel ? 'bg-slate-200 dark:bg-slate-700 text-base' : 'bg-primary text-white'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.parts[0].text}</p>
      </div>
    </div>
  );
};

const AICompanion: React.FC<AICompanionProps> = ({ isOpen, onClose, messages, onSendMessage, isLoading }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !isLoading) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-[60] flex justify-center items-end sm:items-center">
      <div 
        className="bg-slate-50 dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg h-[80vh] sm:h-[70vh] flex flex-col transform transition-transform duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
        aria-modal="true"
        role="dialog"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-base">🤖 AI Study Companion</h2>
          <button onClick={onClose} className="text-muted hover:text-base transition-colors p-1 rounded-full">
            <CloseIcon />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.length === 0 && (
             <div className="text-center text-muted pt-10">
                <p>Hello! How can I help you study today?</p>
                <p className="text-sm mt-2">Ask me to explain a concept, give you a quiz, or offer some motivation!</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-base">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask a question..."
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-transparent text-base"
              disabled={isLoading}
              aria-label="Your message"
            />
            <button
              type="submit"
              disabled={isLoading || !newMessage.trim()}
              className="bg-primary text-white rounded-full p-2.5 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AICompanion;