
import React, { useState, useRef, useEffect } from 'react';
import { LANGUAGES } from '../constants';
import { useI18n } from '../hooks/useI18n';
import { GlobeIcon, ChevronDownIcon } from './icons/Icons';
import type { Language } from '../types';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLanguageChange = (langId: Language) => {
        setLanguage(langId);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-ghost flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-300 transition-colors"
            >
                <GlobeIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{LANGUAGES.find(l => l.id === language)?.name}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-base-300 rounded-lg shadow-lg z-40 overflow-hidden">
                    <ul className="py-1">
                        {LANGUAGES.map((lang) => (
                            <li key={lang.id}>
                                <button
                                    onClick={() => handleLanguageChange(lang.id)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-primary hover:text-primary-content ${language === lang.id ? 'bg-primary text-primary-content' : 'text-base-content'}`}
                                >
                                    {lang.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
