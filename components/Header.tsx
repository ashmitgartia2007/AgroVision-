
import React from 'react';
import { LeafIcon } from './icons/Icons';
import LanguageSwitcher from './LanguageSwitcher';
import { useI18n } from '../hooks/useI18n';

const Header: React.FC = () => {
    const { t } = useI18n();

    return (
        <header className="sticky top-0 z-30 w-full p-4 bg-base-100/80 backdrop-blur-sm border-b border-base-300">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <LeafIcon className="w-8 h-8 text-success" />
                    <h1 className="text-2xl font-bold text-primary-content">{t('appTitle')}</h1>
                </div>
                <LanguageSwitcher />
            </div>
        </header>
    );
};

export default Header;
