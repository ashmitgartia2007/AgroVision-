import React from 'react';

interface AirPressureGaugeProps {
    value: number; // in hPa
}

const AirPressureGauge: React.FC<AirPressureGaugeProps> = ({ value }) => {
    const minPressure = 980;
    const maxPressure = 1040;
    const range = maxPressure - minPressure;
    const percentage = Math.min(Math.max((value - minPressure) / range, 0), 1);
    const rotation = -90 + percentage * 180; // from -90 to +90 degrees

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
                    className="stroke-current text-blue-500"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={Math.PI * 45}
                    strokeDashoffset={0}
                />
            </svg>

            {/* Needle */}
            <div
                className="absolute bottom-2.5 left-1/2 w-0.5 h-[calc(50%-5px)] bg-gray-800 origin-bottom transition-transform duration-1000"
                style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            ></div>
            <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-gray-800 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>


            <div className="absolute bottom-0 w-full text-center">
                <span className="text-3xl font-bold text-gray-800">{value}</span>
                <span className="text-lg text-gray-600"> hPa</span>
            </div>
        </div>
    );
};

export default AirPressureGauge;
