import React from 'react';

interface UvIndexGaugeProps {
    value: number;
    maxValue?: number;
}

const UvIndexGauge: React.FC<UvIndexGaugeProps> = ({ value, maxValue = 11 }) => {
    const percentage = Math.min(Math.max(value / maxValue, 0), 1);
    const circumference = Math.PI * 45; // Half circle
    const offset = circumference - percentage * circumference;

    const getColor = (val: number) => {
        if (val <= 2) return 'text-green-500';
        if (val <= 5) return 'text-yellow-500';
        if (val <= 7) return 'text-orange-500';
        if (val <= 10) return 'text-red-500';
        return 'text-purple-500';
    };

    const colorClass = getColor(value);

    return (
        <div className="relative w-40 h-20 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 50">
                <path
                    d="M 5 50 A 45 45 0 0 1 95 50"
                    className="stroke-current text-gray-200"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M 5 50 A 45 45 0 0 1 95 50"
                    className={`stroke-current ${colorClass} transition-all duration-1000`}
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="absolute bottom-0 w-full text-center">
                <span className={`text-4xl font-bold ${colorClass.replace('text-', 'text-')} `}>{value}</span>
                <span className="text-xl text-gray-500">/{maxValue}</span>
            </div>
        </div>
    );
};

export default UvIndexGauge;
