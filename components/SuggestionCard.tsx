
import React from 'react';
import type { Suggestion } from '../types';
import { FireIcon, AlertTriangleIcon, InfoIcon } from './icons/Icons';

interface SuggestionCardProps {
    suggestion: Suggestion;
}

const priorityStyles = {
    High: {
        borderColor: 'border-error',
        icon: <FireIcon className="w-6 h-6 text-error" />,
    },
    Medium: {
        borderColor: 'border-warning',
        icon: <AlertTriangleIcon className="w-6 h-6 text-warning" />,
    },
    Low: {
        borderColor: 'border-info',
        icon: <InfoIcon className="w-6 h-6 text-info" />,
    },
};

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion }) => {
    const styles = priorityStyles[suggestion.priority] || priorityStyles.Low;

    return (
        <div className={`bg-base-200 rounded-xl p-4 border-l-4 ${styles.borderColor} h-full`}>
            <div className="flex items-start gap-4">
                <div>{styles.icon}</div>
                <div>
                    <h5 className="font-bold text-primary-content">{suggestion.title}</h5>
                    <p className="text-sm text-base-content mt-1">{suggestion.detail}</p>
                </div>
            </div>
        </div>
    );
};

export default SuggestionCard;
