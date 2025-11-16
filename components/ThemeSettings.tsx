import React from 'react';
import Modal from './Modal';
import type { Theme, AccentColor } from '../types';

interface ThemeSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
    currentAccent: AccentColor;
    onAccentChange: (color: AccentColor) => void;
}

const themes: { id: Theme; label: string }[] = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'contrast', label: 'High Contrast' },
];

const accentColors: { id: AccentColor; color: string }[] = [
    { id: 'blue', color: 'bg-blue-500' },
    { id: 'purple', color: 'bg-purple-500' },
    { id: 'green', color: 'bg-green-500' },
    { id: 'orange', color: 'bg-orange-500' },
    { id: 'pink', color: 'bg-pink-500' },
];


const ThemeSettings: React.FC<ThemeSettingsProps> = ({ isOpen, onClose, currentTheme, onThemeChange, currentAccent, onAccentChange }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Appearance Settings">
            <div className="space-y-6">
                <div>
                    <h3 className="text-base font-medium text-base mb-2">Theme</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {themes.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => onThemeChange(theme.id)}
                                className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
                                    currentTheme === theme.id
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-transparent hover:border-primary'
                                }`}
                            >
                                {theme.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-base font-medium text-base mb-3">Accent Color</h3>
                    <div className="flex justify-center gap-4">
                        {accentColors.map(accent => (
                             <button
                                key={accent.id}
                                onClick={() => onAccentChange(accent.id)}
                                className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 focus:outline-none ${accent.color} ${
                                    currentAccent === accent.id ? 'ring-2 ring-offset-2 ring-offset-card ring-primary' : ''
                                }`}
                                aria-label={`Set accent color to ${accent.id}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ThemeSettings;
