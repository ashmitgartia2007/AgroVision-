
import type { Tab, Language } from './types';
import { LayoutDashboardIcon, LineChartIcon, CloudIcon, SparklesIcon } from './components/icons/Icons';

export const LANGUAGES: { id: Language, name: string }[] = [
    { id: 'en', name: 'English' },
    { id: 'hi', name: 'हिन्दी' },
    { id: 'mr', name: 'मराठी' },
];

export const TABS: Tab[] = [
    { id: 'overview', labelKey: 'overview', icon: LayoutDashboardIcon },
    { id: 'trends', labelKey: 'trends', icon: LineChartIcon },
    { id: 'weather', labelKey: 'weather', icon: CloudIcon },
    { id: 'ai-insights', labelKey: 'aiInsights', icon: SparklesIcon },
];

export const INDIAN_CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ludhiana', 'Agra', 'Nashik'
];
