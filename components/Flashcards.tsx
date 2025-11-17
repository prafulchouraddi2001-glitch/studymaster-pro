import React, { useState, useMemo, useCallback } from 'react';
import type { Deck, Flashcard } from '../types';
import Card from './Card';
import Button from './Button';

type ReviewRating = 'again' | 'good' | 'easy';

// Simplified SM-2 algorithm for spaced repetition
const calculateNextReview = (card: Flashcard, rating: ReviewRating): Partial<Flashcard> => {
    let { interval, easeFactor } = card;

    if (rating === 'again') {
        interval = 1; // Reset interval
    } else {
        if (rating === 'good') {
            interval = Math.round(interval * easeFactor);
        } else { // 'easy'
            interval = Math.round(interval * (easeFactor + 0.15));
        }
        easeFactor += (0.1 - (5 - (rating === 'good' ? 4 : 5)) * (0.08 + (5 - (rating === 'good' ? 4 : 5)) * 0.02));
    }
    
    if (easeFactor < 1.3) easeFactor = 1.3;
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    
    return { nextReview, interval, easeFactor };
};


interface FlashcardsProps {
    decks: Deck[];
    onDecksChange: (decks: Deck[]) => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ decks, onDecksChange }) => {
    const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const reviewQueue = useMemo(() => {
        if (!activeDeck) return [];
        const today = new Date();
        return activeDeck.flashcards
            .filter(card => new Date(card.nextReview) <= today)
            .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
    }, [activeDeck]);

    const currentCard = reviewQueue[currentCardIndex];

    const startReview = (deck: Deck) => {
        setActiveDeck(deck);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    };
    
    const handleRating = (rating: ReviewRating) => {
        if (!currentCard || !activeDeck) return;

        const updatedCardFields = calculateNextReview(currentCard, rating);
        
        const updatedDecks = decks.map(deck => {
            if (deck.id === activeDeck.id) {
                return {
                    ...deck,
                    flashcards: deck.flashcards.map(fc => 
                        fc.id === currentCard.id ? { ...fc, ...updatedCardFields } : fc
                    )
                };
            }
            return deck;
        });
        onDecksChange(updatedDecks);

        if (currentCardIndex < reviewQueue.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else {
            // End of review session
            setActiveDeck(null);
        }
        setIsFlipped(false);
    };

    if (activeDeck && currentCard) {
        return (
            <div className="flex flex-col items-center">
                 <h2 className="text-2xl font-bold mb-4 text-center">Reviewing: {activeDeck.name}</h2>
                 <p className="text-muted mb-4">{currentCardIndex + 1} / {reviewQueue.length} cards due</p>
                <div 
                    className="w-full max-w-xl h-64 sm:h-80 perspective-1000 cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        <div className="absolute w-full h-full backface-hidden"><Card className="w-full h-full flex items-center justify-center text-xl sm:text-2xl p-4 text-center">{currentCard.front}</Card></div>
                        <div className="absolute w-full h-full backface-hidden rotate-y-180"><Card className="w-full h-full flex items-center justify-center text-lg sm:text-xl p-4 text-center">{currentCard.back}</Card></div>
                    </div>
                </div>
                {isFlipped && (
                    <div className="mt-6 flex gap-4">
                        <Button onClick={() => handleRating('again')} className="bg-red-500 hover:bg-red-600">Again</Button>
                        <Button onClick={() => handleRating('good')} className="bg-blue-500 hover:bg-blue-600">Good</Button>
                        <Button onClick={() => handleRating('easy')} className="bg-green-500 hover:bg-green-600">Easy</Button>
                    </div>
                )}
                 <Button variant="secondary" onClick={() => setActiveDeck(null)} className="mt-6">End Session</Button>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base mb-6 flex items-center gap-3">
                🗂️ Flashcard Decks
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map(deck => {
                    const dueCount = deck.flashcards.filter(c => new Date(c.nextReview) <= new Date()).length;
                    return (
                        <Card key={deck.id}>
                            <h3 className="text-lg font-semibold text-base">{deck.name}</h3>
                            <p className="text-muted text-sm">{deck.flashcards.length} cards</p>
                            <p className={`font-semibold mt-4 ${dueCount > 0 ? 'text-primary' : 'text-muted'}`}>{dueCount} cards due for review</p>
                            <Button onClick={() => startReview(deck)} disabled={dueCount === 0} fullWidth className="mt-4">
                                {dueCount > 0 ? 'Start Review' : 'No Cards Due'}
                            </Button>
                        </Card>
                    );
                })}
                 {decks.length === 0 && (
                    <Card className="md:col-span-2 lg:col-span-3 text-center py-12">
                        <p className="text-muted">No flashcard decks yet. Create one by highlighting text in your notes!</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Flashcards;