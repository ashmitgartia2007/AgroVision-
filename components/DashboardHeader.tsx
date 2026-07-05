import React from 'react';

interface DashboardHeaderProps {
    farmName: string;
    location: string;
    onLocationClick?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ farmName, location, onLocationClick }) => {
    const LocationElement = onLocationClick ? 'button' : 'p';
    
    // New styles for text shadow to match the user's image
    const textShadowStyle = { textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)' };

    return (
        <div 
            className="relative h-48 rounded-2xl overflow-hidden my-6 bg-cover bg-center" 
            // Updated background image to feature an Indian farmer, providing a more authentic look
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620352538982-a3457c6d9c84?q=80&w=1470&auto=format&fit=crop')" }}
        >
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative h-full flex flex-col justify-end p-8 text-white">
                <h2 
                    className="text-4xl font-bold text-primary-content"
                    style={textShadowStyle}
                >
                    {farmName}
                </h2>
                <LocationElement 
                     className={`text-lg text-base-content text-left ${onLocationClick ? 'hover:underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-focus rounded' : ''}`}
                     onClick={onLocationClick}
                     style={textShadowStyle}
                >
                    {location}
                </LocationElement>
            </div>
        </div>
    );
};

export default DashboardHeader;