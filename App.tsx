import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Header from './components/Header';
import DashboardHeader from './components/DashboardHeader';
import TabNavigation from './components/TabNavigation';
import Overview from './components/Overview';
import Trends from './components/Trends';
import Weather from './components/Weather';
import AIInsights from './components/AIInsights';
import ChatAssistant from './components/ChatAssistant';
import { I18nContext, translations } from './context/I18nContext';
import type { Language, TabID, FarmStatus } from './types';
import { TABS } from './constants';
import { ChatBubbleIcon } from './components/icons/Icons';
import { farmService } from './services/farmService';

const App: React.FC = () => {
    const [language, setLanguage] = useState<Language>('en');
    const [activeTab, setActiveTab] = useState<TabID>('overview');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [farmStatus, setFarmStatus] = useState<FarmStatus | null>(null);
    const [farmProfile] = useState({
        name: 'Green Valley Farms',
        location: 'Nashik, Maharashtra'
    });

    // Poll for farm status updates every 30 seconds
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const status = await farmService.getFarmStatus();
                setFarmStatus(status);
            } catch (error) {
                console.error("Failed to fetch farm status:", error);
            }
        };

        fetchStatus(); // Initial fetch
        const intervalId = setInterval(fetchStatus, 30000); // Poll every 30 seconds

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    const t = useCallback((key: string) => {
        return translations[language][key] || key;
    }, [language]);

    const contextValue = useMemo(() => ({
        language,
        setLanguage,
        t
    }), [language, t]);

    const handleAnalysisComplete = (status: FarmStatus) => {
        // Overwrite the polled status with the new, specific analysis result for other tabs to use
        setFarmStatus(status);
    };

    const handleLocationClick = () => {
        setActiveTab('weather');
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'overview':
                return <Overview onAnalysisComplete={handleAnalysisComplete} />;
            case 'trends':
                return <Trends />;
            case 'weather':
                return <Weather />;
            case 'ai-insights':
                return <AIInsights farmStatus={farmStatus} />;
            default:
                return <Overview onAnalysisComplete={handleAnalysisComplete} />;
        }
    };

    return (
        <I18nContext.Provider value={contextValue}>
            <div className="min-h-screen bg-base-200">
                <Header />
                <main className="container mx-auto px-4 pb-8">
                    <DashboardHeader 
                        farmName={farmProfile.name} 
                        location={farmProfile.location}
                        onLocationClick={handleLocationClick} 
                    />
                    <TabNavigation tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="mt-6">
                        {renderActiveTab()}
                    </div>
                </main>
                
                <div className="fixed bottom-6 right-6 z-40">
                    <button 
                        onClick={() => setIsChatOpen(true)} 
                        className="bg-primary hover:bg-primary-focus text-primary-content rounded-full p-4 shadow-lg transform transition-transform hover:scale-110"
                        aria-label="Open Agri Assistant"
                    >
                        <ChatBubbleIcon className="w-8 h-8" />
                    </button>
                </div>

                {isChatOpen && <ChatAssistant onClose={() => setIsChatOpen(false)} />}
            </div>
        </I18nContext.Provider>
    );
};

export default App;