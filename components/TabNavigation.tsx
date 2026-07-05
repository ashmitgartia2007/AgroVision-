
import React from 'react';
import type { Tab, TabID } from '../types';
import { useI18n } from '../hooks/useI18n';

interface TabNavigationProps {
    tabs: Tab[];
    activeTab: TabID;
    setActiveTab: (tabId: TabID) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, setActiveTab }) => {
    const { t } = useI18n();

    return (
        <div className="sticky top-[81px] z-20 bg-base-200/80 backdrop-blur-sm -mx-4 px-4">
            <div className="border-b border-base-300">
                <nav className="flex space-x-2 -mb-px" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-base-content hover:text-primary-content hover:border-gray-500'
                                }
                            `}
                        >
                            <tab.icon className="-ml-0.5 mr-2 h-5 w-5" />
                            <span>{t(tab.labelKey)}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default TabNavigation;
