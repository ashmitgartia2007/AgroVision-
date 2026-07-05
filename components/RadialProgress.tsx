
import React from 'react';

interface RadialProgressProps {
    value: number;
    max?: number;
    color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
    isWaiting?: boolean;
}

const RadialProgress: React.FC<RadialProgressProps> = ({ value, max = 1, color = 'primary', isWaiting = false }) => {
    const percentage = isWaiting ? 0 : Math.round((value / max) * 100);
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;

    const colorClasses: Record<string, string> = {
      primary: 'stroke-primary',
      secondary: 'stroke-secondary',
      accent: 'stroke-accent',
      success: 'stroke-success',
      warning: 'stroke-warning',
      error: 'stroke-error',
      info: 'stroke-info',
    };

    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="stroke-current text-base-300"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                ></circle>
                <circle
                    className={`stroke-current transition-all duration-1000 ${colorClasses[color] || 'stroke-primary'}`}
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 50 50)"
                ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-primary-content">
                    {isWaiting ? '?' : value.toFixed(2)}
                </span>
                <span className="text-sm text-base-content">NDVI</span>
            </div>
        </div>
    );
};

export default RadialProgress;