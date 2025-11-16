import React, { useState, useEffect, useRef } from 'react';
import type { Tab } from '../types';
import { ThemeIcon } from './Icons';

interface NavButtonProps {
  label: string;
  tabName: Tab;
  icon: string;
  activeTab: Tab;
  onClick: (tab: Tab) => void;
  className?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ label, tabName, icon, activeTab, onClick, className = '' }) => (
  <button
    onClick={() => onClick(tabName)}
    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
      activeTab === tabName
        ? 'bg-white/30 shadow-sm'
        : 'bg-white/10 hover:bg-white/20'
    } ${className}`}
  >
    <span>{icon}</span>
    <span className="hidden sm:inline">{label}</span>
  </button>
);


interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onOpenSettings: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, onOpenSettings }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const mainNavItems: { label: string; tabName: Tab; icon: string; }[] = [
    { label: 'Dashboard', tabName: 'dashboard', icon: '📊' },
    { label: 'Roadmap', tabName: 'roadmap', icon: '🗺️' },
    { label: 'Pomodoro', tabName: 'pomodoro', icon: '🍅' },
    { label: 'Calendar', tabName: 'calendar', icon: '🗓️' },
    { label: 'Notes', tabName: 'notes', icon: '📝' },
  ];

  const moreNavItems: { label: string; tabName: Tab; icon: string; }[] = [
    { label: 'Mind Maps', tabName: 'mindmap', icon: '🧠' },
    { label: 'Flashcards', tabName: 'flashcards', icon: '🗂️' },
    { label: 'Reminders', tabName: 'reminders', icon: '🔔' },
    { label: 'Tags', tabName: 'tags', icon: '🏷️' },
    { label: 'Analytics', tabName: 'analytics', icon: '📈' },
  ];

  const isMoreMenuActive = moreNavItems.some(item => item.tabName === activeTab);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMoreItemClick = (tab: Tab) => {
    onTabChange(tab);
    setIsMoreMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-primary to-primary-dark text-white p-3 fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-xl font-bold whitespace-nowrap">📚 StudyMaster Pro</div>
        <div className="flex items-center gap-1 md:gap-2">
            {mainNavItems.map(item => (
                <NavButton 
                    key={item.tabName}
                    label={item.label}
                    tabName={item.tabName}
                    icon={item.icon}
                    activeTab={activeTab}
                    onClick={onTabChange}
                />
            ))}
            
            <div className="relative" ref={moreMenuRef}>
                <button
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                        isMoreMenuActive
                            ? 'bg-white/30 shadow-sm'
                            : 'bg-white/10 hover:bg-white/20'
                    }`}
                >
                    <span className="hidden sm:inline">More</span>
                    <span className="sm:hidden">•••</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hidden sm:inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isMoreMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-50">
                        {moreNavItems.map(item => (
                             <a
                                key={item.tabName}
                                href="#"
                                onClick={(e) => { e.preventDefault(); handleMoreItemClick(item.tabName); }}
                                className={`flex items-center gap-3 px-4 py-2 text-sm text-base ${activeTab === item.tabName ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={onOpenSettings}
                className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 hover:bg-white/20"
                aria-label="Open theme settings"
            >
                <ThemeIcon />
            </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
