
import React from 'react';

interface ProgressBarProps {
    value: number;
    color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, color = 'bg-primary' }) => {
    return (
        <div className="w-full bg-base-300 rounded-full h-4">
            <div
                className={`${color} h-4 rounded-full transition-all duration-500`}
                style={{ width: `${value}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;
