import React from 'react';

interface MetricCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, icon, children }) => {
    return (
        <div className="bg-white rounded-2xl p-4 flex flex-col">
            <div className="flex items-center text-sm text-gray-500 mb-2">
                {icon}
                <span className="ml-2 font-semibold">{title}</span>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
};

export default MetricCard;
