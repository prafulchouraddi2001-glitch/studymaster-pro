import React, { useState, useRef, useEffect } from 'react';
import type { Note, Quiz, Deck, Flashcard, NoteVersion } from '../types';
import { generateQuiz, summarizeNote, explainConcept, processImportedContent, generateAudioSummary } from '../services/geminiService';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import { TrashIcon, QuizIcon, SpinnerIcon, SummarizeIcon, ExplainIcon, FlashcardIcon, MindMapIcon, BrainIcon, UploadIcon, MicrophoneIcon, StopIcon, SpeakerIcon, HistoryIcon } from './Icons';

interface NotesProps {
    notes: Note[];
    onNotesChange: (notes: Note[]) => void;
    decks: Deck[];
    onDecksChange: (decks: Deck[]) => void;
    onGenerateMindMap: (note: Note) => void;
    onOpenFeynmanTutor: (note: Note) => void;
}

const NoteItem: React.FC<{ 
    note: Note, 
    onSelect: (note: Note) => void, 
    onDelete: (id: string) => void, 
    onGenerateQuiz: (note: Note) => void,
    onSummarize: (note: Note) => void,
    onGenerateMindMap: (note: Note) => void,
    onOpenFeynmanTutor: (note: Note) => void,
    onGenerateAudioSummary: (note: Note) => void,
}> = ({ note, onSelect, onDelete, onGenerateQuiz, onSummarize, onGenerateMindMap, onOpenFeynmanTutor, onGenerateAudioSummary }) => (
    <Card>
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-base">{note.title}</h3>
             <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors p-1 rounded-full"><TrashIcon /></button>
        </div>
        <div className="prose prose-sm max-w-none text-muted mt-2 h-20 overflow-hidden" dangerouslySetInnerHTML={{ __html: note.content }} />
        
        {note.audioUrl && (
            <div className="mt-3">
                <p className="text-xs font-semibold text-muted mb-1">Original Recording</p>
                <audio src={note.audioUrl} controls className="w-full h-8" />
            </div>
        )}
        {note.audioSummaryUrl && (
            <div className="mt-3">
                <p className="text-xs font-semibold text-muted mb-1">AI Audio Summary</p>
                <audio src={note.audioSummaryUrl} controls className="w-full h-8" />
            </div>
        )}

        <div className="flex gap-1.5 mt-2 flex-wrap">
            {note.tags.map(tag => <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">#{tag}</span>)}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">Last modified: {new Date(note.lastModified).toLocaleString()}</p>
        <div className="mt-4 flex gap-2 flex-wrap">
            <Button size="sm" variant="secondary" onClick={() => onSelect(note)}>Edit</Button>
            <Button size="sm" variant="secondary" onClick={() => onGenerateQuiz(note)} className="flex items-center gap-1.5"><QuizIcon/> Quiz</Button>
            <Button size="sm" variant="secondary" onClick={() => onSummarize(note)} className="flex items-center gap-1.5"><SummarizeIcon/> Summarize</Button>
            <Button size="sm" variant="secondary" onClick={() => onGenerateMindMap(note)} className="flex items-center gap-1.5"><MindMapIcon/> Mind Map</Button>
            <Button size="sm" variant="secondary" onClick={() => onOpenFeynmanTutor(note)} className="flex items-center gap-1.5"><BrainIcon/> Feynman</Button>
            <Button size="sm" variant="secondary" onClick={() => onGenerateAudioSummary(note)} className="flex items-center gap-1.5"><SpeakerIcon /> Audio Summary</Button>
        </div>
    </Card>
);

const Notes: React.FC<NotesProps> = ({ notes, onNotesChange, decks, onDecksChange, onGenerateMindMap, onOpenFeynmanTutor }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isVoiceNoteModalOpen, setIsVoiceNoteModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState<string | null>(null);

    // Context Menu for Explain/Flashcard
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, text: string } | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // AI Explanation State
    const [explanation, setExplanation] = useState('');
    const [isExplainLoading, setIsExplainLoading] = useState(false);

    // Flashcard Creation State
    const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);
    const [flashcardFront, setFlashcardFront] = useState('');
    
    // Quiz State (simplified for brevity)
    const [quizNote, setQuizNote] = useState<Note | null>(null);
    
    // Summary State (simplified for brevity)
    const [summaryNote, setSummaryNote] = useState<Note | null>(null);

    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 5) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setContextMenu({
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY - 40,
                text: selection.toString().trim(),
            });
        } else {
            setContextMenu(null);
        }
    };
    
    useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExplain = async () => {
        if (!contextMenu) return;
        setIsExplainLoading(true);
        setExplanation('');
        try {
            const result = await explainConcept(contextMenu.text);
            setExplanation(result);
        } catch (error) {
            setExplanation('Sorry, I had trouble explaining that.');
        } finally {
            setIsExplainLoading(false);
        }
    };

    const handleCreateFlashcard = () => {
        if (!contextMenu) return;
        setFlashcardFront(contextMenu.text);
        setIsFlashcardModalOpen(true);
    };

    const handleOpenFeynmanFromSelection = () => {
        if (!contextMenu) return;
        const syntheticNote: Note = {
            id: `selection-${Date.now()}`,
            title: 'Selected Concept',
            content: contextMenu.text,
            lastModified: new Date().toISOString(),
            tags: [],
        };
        onOpenFeynmanTutor(syntheticNote);
        setContextMenu(null);
    };
    
    const handleSaveFlashcard = (back: string, noteId: string) => {
        const deckIndex = decks.findIndex(d => d.noteId === noteId);
        const newFlashcard: Flashcard = {
            id: `fc-${Date.now()}`, front: flashcardFront, back,
            nextReview: new Date(), interval: 1, easeFactor: 2.5
        };

        if (deckIndex > -1) {
            const updatedDecks = [...decks];
            updatedDecks[deckIndex].flashcards.push(newFlashcard);
            onDecksChange(updatedDecks);
        } else {
            const newDeck: Deck = {
                id: `deck-${Date.now()}`, name: currentNote?.title || 'New Deck', noteId: noteId,
                flashcards: [newFlashcard]
            };
            onDecksChange([...decks, newDeck]);
        }
        setIsFlashcardModalOpen(false);
        setContextMenu(null);
    };

    const openModalForEdit = (note: Note) => {
        setCurrentNote(note);
        setIsEditModalOpen(true);
    };

    const handleSaveNote = (noteToSave: Note) => {
        if (!noteToSave) return;
        const tags = Array.isArray(noteToSave.tags) ? noteToSave.tags : (noteToSave.tags as unknown as string).split(',').map(t => t.trim()).filter(Boolean);
        const finalNote: Note = { ...noteToSave, tags, lastModified: new Date().toISOString() };

        if (finalNote.id && notes.some(n => n.id === finalNote.id)) {
            const originalNote = notes.find(n => n.id === finalNote.id);
            let updatedHistory = originalNote?.history || [];

            if (originalNote && originalNote.content !== finalNote.content) {
                const newVersion: NoteVersion = {
                    content: originalNote.content,
                    timestamp: originalNote.lastModified,
                };
                updatedHistory = [newVersion, ...updatedHistory];
            }
            finalNote.history = updatedHistory;
            onNotesChange(notes.map(n => n.id === finalNote.id ? finalNote : n));
        } else {
            const newNote: Note = { ...finalNote, id: `note-${Date.now()}`, history: [] };
            onNotesChange([newNote, ...notes]);
        }
        setIsEditModalOpen(false);
        setCurrentNote(null);
        setIsVoiceNoteModalOpen(false);
    };


    const handleDeleteNote = (id: string) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            onNotesChange(notes.filter(n => n.id !== id));
        }
    };

    const openModalForNew = () => {
        setCurrentNote({ id: '', title: '', content: '', lastModified: new Date().toISOString(), tags: [], history: [] });
        setIsEditModalOpen(true);
    };
    
    const handleGenerateAudioSummary = async (note: Note) => {
        setIsSummaryLoading(note.id);
        try {
            const audioB64 = await generateAudioSummary(note.content);
            const audioUrl = `data:audio/webm;base64,${audioB64}`;
            const updatedNote = { ...note, audioSummaryUrl: audioUrl };
            onNotesChange(notes.map(n => n.id === note.id ? updatedNote : n));
        } catch (error) {
            console.error("Failed to generate audio summary:", error);
            alert("Sorry, there was an error generating the audio summary.");
        } finally {
            setIsSummaryLoading(null);
        }
    };
    
    const handleRestoreVersion = (version: NoteVersion) => {
        if (currentNote) {
            setCurrentNote({ ...currentNote, content: version.content });
            setIsHistoryModalOpen(false);
        }
    };

    return (
        <div onMouseUp={handleMouseUp} ref={contentRef}>
            {contextMenu && (
                <div style={{ top: contextMenu.y, left: contextMenu.x }} className="absolute z-50 bg-card border shadow-lg rounded-md flex" onMouseDown={e => e.stopPropagation()}>
                    <button onClick={handleExplain} className="flex items-center gap-1.5 px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-l-md"><ExplainIcon/> Explain</button>
                    <button onClick={handleCreateFlashcard} className="flex items-center gap-1.5 px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 border-l"><FlashcardIcon/> New Card</button>
                    <button onClick={handleOpenFeynmanFromSelection} className="flex items-center gap-1.5 px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-md border-l"><BrainIcon/> Feynman</button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-base flex items-center gap-3">📝 Study Notes</h1>
                <div className="flex gap-2 self-end sm:self-center">
                    <Button onClick={() => setIsImportModalOpen(true)} variant="secondary" className="flex items-center gap-1.5"><UploadIcon /> Import</Button>
                    <Button onClick={() => setIsVoiceNoteModalOpen(true)} variant="secondary" className="flex items-center gap-1.5"><MicrophoneIcon /> Record</Button>
                    <Button onClick={openModalForNew}>+ New Note</Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(note => <NoteItem key={note.id} note={note} onSelect={openModalForEdit} onDelete={handleDeleteNote} onGenerateQuiz={setQuizNote} onSummarize={setSummaryNote} onGenerateMindMap={onGenerateMindMap} onOpenFeynmanTutor={onOpenFeynmanTutor} onGenerateAudioSummary={note.id === isSummaryLoading ? () => {} : handleGenerateAudioSummary} />)}
            </div>

            {currentNote && isEditModalOpen && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={currentNote.id ? 'Edit Note' : 'Add New Note'}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-base mb-1">Title</label>
                            <input type="text" value={currentNote.title} onChange={e => setCurrentNote({ ...currentNote, title: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-transparent"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-base mb-1">Content</label>
                            <textarea value={currentNote.content.replace(/<br\s*\/?>/gi, '\n')} onChange={e => setCurrentNote({ ...currentNote, content: e.target.value.replace(/\n/g, '<br>') })} rows={6} className="w-full px-3 py-2 border rounded-md bg-transparent"></textarea>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-base mb-1">Tags (comma-separated)</label>
                            <input type="text" value={Array.isArray(currentNote.tags) ? currentNote.tags.join(', ') : currentNote.tags} onChange={e => setCurrentNote({ ...currentNote, tags: e.target.value.split(',').map(t=>t.trim()) })} className="w-full px-3 py-2 border rounded-md bg-transparent"/>
                        </div>
                        <div className="flex justify-between items-center gap-3">
                            <Button variant="secondary" onClick={() => setIsHistoryModalOpen(true)} disabled={!currentNote.history || currentNote.history.length === 0} className="flex items-center gap-1.5"><HistoryIcon /> History</Button>
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                                <Button onClick={() => handleSaveNote(currentNote)}>Save Note</Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {currentNote && (
                <VersionHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    note={currentNote}
                    onRestore={handleRestoreVersion}
                />
            )}
            
            <ImportNoteModal 
                isOpen={isImportModalOpen} 
                onClose={() => setIsImportModalOpen(false)}
                onImport={(noteData) => {
                    const newNote = { ...noteData, content: noteData.summary.replace(/\n/g, '<br>'), id: '', lastModified: '' };
                    setCurrentNote(newNote as Note);
                    setIsEditModalOpen(true);
                }}
            />
            
            <VoiceNoteModal 
                isOpen={isVoiceNoteModalOpen}
                onClose={() => setIsVoiceNoteModalOpen(false)}
                onSave={handleSaveNote}
            />

            <Modal isOpen={!!explanation || isExplainLoading} onClose={() => setExplanation('')} title="AI Explanation">
                {isExplainLoading && <div className="flex justify-center items-center h-24"><SpinnerIcon /></div>}
                {explanation && <p className="text-muted leading-relaxed">{explanation}</p>}
            </Modal>

            <FlashcardModal 
                isOpen={isFlashcardModalOpen}
                onClose={() => setIsFlashcardModalOpen(false)}
                frontContent={flashcardFront}
                onSave={(back) => handleSaveFlashcard(back, currentNote?.id || '')}
            />

            {/* Placeholder for Quiz and Summary Modals */}
        </div>
    );
};

const VersionHistoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    note: Note;
    onRestore: (version: NoteVersion) => void;
}> = ({ isOpen, onClose, note, onRestore }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={`Version History for "${note.title}"`}>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {(note.history || []).map((version, index) => (
                <div key={index} className="p-3 border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-muted">
                            Saved on: {new Date(version.timestamp).toLocaleString()}
                        </p>
                        <Button size="sm" variant="secondary" onClick={() => onRestore(version)}>
                            Restore
                        </Button>
                    </div>
                    <div className="prose prose-sm max-w-none text-muted bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md h-24 overflow-y-auto" dangerouslySetInnerHTML={{ __html: version.content }} />
                </div>
            ))}
        </div>
    </Modal>
);


const FlashcardModal: React.FC<{isOpen: boolean, onClose: () => void, frontContent: string, onSave: (back: string) => void}> = ({ isOpen, onClose, frontContent, onSave }) => {
    const [backContent, setBackContent] = useState('');
    useEffect(() => { if (isOpen) setBackContent(''); }, [isOpen]);
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Flashcard">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Front (from note)</label>
                    <p className="p-3 border rounded-md bg-slate-50 dark:bg-slate-700 text-sm">{frontContent}</p>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-base mb-1">Back (Answer/Definition)</label>
                    <textarea value={backContent} onChange={e => setBackContent(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded-md bg-transparent" placeholder="Enter the answer or definition..."></textarea>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => onSave(backContent)} disabled={!backContent.trim()}>Save Flashcard</Button>
                </div>
            </div>
        </Modal>
    );
}

const ImportNoteModal: React.FC<{ isOpen: boolean, onClose: () => void, onImport: (data: { title: string; summary: string; tags: string[] }) => void }> = ({ isOpen, onClose, onImport }) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleProcess = async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await processImportedContent(content);
            onImport(result);
            onClose();
            setContent('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Content via AI">
            <div className="space-y-4">
                <p className="text-muted text-sm">Paste any content (e.g., from a web article) below. The AI will automatically create a title, summary, and tags for a new note.</p>
                <textarea 
                    value={content} 
                    onChange={e => setContent(e.target.value)}
                    rows={10}
                    placeholder="Paste your content here..."
                    className="w-full p-2 border rounded-md bg-transparent"
                    disabled={isLoading}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleProcess} disabled={isLoading || !content.trim()}>
                        {isLoading ? <span className="flex items-center gap-2"><SpinnerIcon /> Processing...</span> : 'Process with AI'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

const VoiceNoteModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (note: Note) => void }> = ({ isOpen, onClose, onSave }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const speechRecognitionRef = useRef<any | null>(null);

    useEffect(() => {
        if (!isOpen) {
            // Cleanup on close
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
            }
            if (speechRecognitionRef.current) {
                speechRecognitionRef.current.stop();
            }
            setIsRecording(false);
            setTranscribedText('');
            setAudioBlob(null);
            return;
        }

        // Setup Speech Recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setTranscribedText(prev => prev + finalTranscript);
            };
            speechRecognitionRef.current = recognition;
        }

    }, [isOpen]);

    const handleToggleRecording = async () => {
        if (isRecording) {
            // Stop recording
            mediaRecorderRef.current?.stop();
            speechRecognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                mediaRecorderRef.current = recorder;
                const audioChunks: BlobPart[] = [];

                recorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                recorder.onstop = () => {
                    const blob = new Blob(audioChunks, { type: 'audio/webm' });
                    setAudioBlob(blob);
                    stream.getTracks().forEach(track => track.stop()); // Release microphone
                };
                
                setTranscribedText('');
                setAudioBlob(null);
                recorder.start();
                speechRecognitionRef.current?.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Could not access microphone. Please check permissions.");
            }
        }
    };

    const handleSaveNote = () => {
        if (!transcribedText && !audioBlob) return;
        const newNote: Note = {
            id: ``,
            title: `Voice Note - ${new Date().toLocaleDateString()}`,
            content: transcribedText.replace(/\n/g, '<br>'),
            audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : undefined,
            lastModified: new Date().toISOString(),
            tags: ['voice-note']
        };
        onSave(newNote);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record a Voice Note">
            <div className="space-y-4 flex flex-col items-center">
                <Button onClick={handleToggleRecording} size="lg" className={`rounded-full h-24 w-24 flex items-center justify-center transition-colors ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}>
                    {isRecording ? <StopIcon /> : <MicrophoneIcon />}
                </Button>
                <p className="text-muted text-sm">{isRecording ? 'Recording...' : 'Click to start recording'}</p>
                <div className="w-full p-3 border rounded-md bg-slate-50 dark:bg-slate-700/50 min-h-[120px]">
                    <p className="text-base">{transcribedText || <span className="text-muted">Your transcribed text will appear here...</span>}</p>
                </div>
                {audioBlob && <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />}
                <div className="flex justify-end gap-3 w-full pt-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSaveNote} disabled={isRecording || (!transcribedText && !audioBlob)}>Save Note</Button>
                </div>
            </div>
        </Modal>
    )
}

export default Notes;