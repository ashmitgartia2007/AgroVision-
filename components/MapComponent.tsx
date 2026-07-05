import React, { useState, useEffect, useRef } from 'react';
import type { MapType, FarmStatus, Rectangle } from '../types';
import { useI18n } from '../hooks/useI18n';
import { geminiService } from '../services/geminiService';
import { MapPinIcon, ScanIcon, CheckCircleIcon, SquareIcon, PolygonIcon } from './icons/Icons';

interface Point { x: number; y: number; }
type DrawTool = 'polygon' | 'rectangle' | 'none';

interface MapComponentProps {
    mapType: MapType;
    locationName?: string;
    backgroundKey: string;
    onAnalysisComplete?: (status: FarmStatus) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ mapType, locationName, backgroundKey, onAnalysisComplete }) => {
    const { t, language } = useI18n();
    const mapRef = useRef<HTMLDivElement>(null);

    // Farm Map State
    const [activeTool, setActiveTool] = useState<DrawTool>('none');
    const [isInteracting, setIsInteracting] = useState(false); // For drag-drawing
    
    // Plot states
    const [points, setPoints] = useState<Point[]>([]);
    const [rectangle, setRectangle] = useState<Rectangle | null>(null);

    // Analysis state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [analysisText, setAnalysisText] = useState('');

    // City Map State
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        let timer: ReturnType<typeof window.setTimeout>;
        if (analysisComplete) {
            timer = setTimeout(() => {
                setAnalysisComplete(false);
                setAnalysisText('');
            }, 4000);
        }
        if (locationError) {
            timer = setTimeout(() => setLocationError(null), 5000);
        }
        return () => clearTimeout(timer);
    }, [analysisComplete, locationError]);

    const handleClearPlot = () => {
        setPoints([]);
        setRectangle(null);
        setActiveTool('none');
        setAnalysisComplete(false);
        setAnalysisText('');
    };
    
    const selectTool = (tool: DrawTool) => {
        handleClearPlot();
        setActiveTool(tool);
    };

    const handleAnalyzePlot = async () => {
        if (!isPlotDefined || !onAnalysisComplete) return;
        setIsAnalyzing(true);
        setAnalysisComplete(false);
        setAnalysisText('');
        try {
            const result = await geminiService.analyzeLocationData(language);
            onAnalysisComplete({
                ndvi_avg: result.estimated_ndvi,
                soil_moisture: result.estimated_soil_moisture,
            });
            setAnalysisText(result.analysis_text);
        } catch (error) {
            console.error("Plot analysis failed", error);
            setAnalysisText(t('errorGenerating'));
        } finally {
            setIsAnalyzing(false);
            setAnalysisComplete(true);
        }
    };
    
    const getCoords = (e: React.MouseEvent<HTMLDivElement>): Point => {
        const rect = mapRef.current!.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;
        return { x, y };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (activeTool !== 'rectangle' || !mapRef.current) return;
        setIsInteracting(true);
        const startPoint = getCoords(e);
        setRectangle({ x: startPoint.x, y: startPoint.y, width: 0, height: 0 });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (activeTool !== 'rectangle' || !isInteracting || !rectangle) return;
        const currentPoint = getCoords(e);
        const newRect = {
            x: Math.min(rectangle.x, currentPoint.x),
            y: Math.min(rectangle.y, currentPoint.y),
            width: Math.abs(currentPoint.x - rectangle.x),
            height: Math.abs(currentPoint.y - rectangle.y),
        };
        setRectangle(newRect);
    };

    const handleMouseUp = () => {
        if (activeTool !== 'rectangle') return;
        setIsInteracting(false);
        if (rectangle && (rectangle.width < 2 || rectangle.height < 2)) {
             setRectangle(null); // Clear if too small
        }
        setActiveTool('none');
    };

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (activeTool !== 'polygon' || !mapRef.current) return;
        const point = getCoords(e);
        
        if (points.length > 2) {
            const firstPoint = points[0];
            const distance = Math.sqrt(Math.pow(firstPoint.x - point.x, 2) + Math.pow(firstPoint.y - point.y, 2));
            if (distance < 5) {
                setActiveTool('none');
                return;
            }
        }
        setPoints([...points, point]);
    };

    const handleCityMapClick = () => {
        setIsLocating(true);
        setLocationError(null);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const url = `https://www.google.com/maps/search/weather/@${latitude},${longitude},12z`;
                window.open(url, '_blank');
                setIsLocating(false);
            }, (error: GeolocationPositionError) => {
                console.error("Geolocation error:", error.message);
                setLocationError(t('locationError'));
                setIsLocating(false);
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
            setLocationError(t('geolocationNotSupported'));
            setIsLocating(false);
        }
    };
    
    const isPolygonClosed = points.length > 2 && activeTool === 'none';
    const isRectangleDrawn = rectangle && rectangle.width > 0 && rectangle.height > 0 && activeTool === 'none';
    const isPlotDefined = isPolygonClosed || isRectangleDrawn;

    const getHelperText = () => {
        if (activeTool === 'polygon') {
            return points.length > 2 ? t('clickFirstPointToClose') : t('clickToAddPoints');
        }
        if (activeTool === 'rectangle' || isInteracting) {
            return t('dragToDraw');
        }
        if (isPlotDefined) {
            return t('plotSelected');
        }
        return t('selectTool');
    };

    const renderFarmOverlay = () => (
        <>
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                <div className="flex items-center bg-base-100/80 backdrop-blur-sm rounded-full shadow-lg">
                    <button onClick={() => selectTool('rectangle')} title={t('drawRectangleTool')} className={`p-2 rounded-full transition-colors ${activeTool === 'rectangle' ? 'bg-primary text-primary-content' : 'text-primary-content hover:bg-base-200'}`}>
                        <SquareIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => selectTool('polygon')} title={t('drawPolygonTool')} className={`p-2 rounded-full transition-colors ${activeTool === 'polygon' ? 'bg-primary text-primary-content' : 'text-primary-content hover:bg-base-200'}`}>
                        <PolygonIcon className="w-5 h-5" />
                    </button>
                </div>

                <button onClick={handleClearPlot} disabled={points.length === 0 && !rectangle} className="px-3 py-2 text-sm font-semibold bg-base-100/80 backdrop-blur-sm text-primary-content rounded-full shadow-lg hover:bg-primary hover:text-primary-content transition-colors disabled:bg-neutral disabled:cursor-not-allowed">
                    {t('clearPlot')}
                </button>
                <button onClick={handleAnalyzePlot} disabled={!isPlotDefined || isAnalyzing} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-success/80 backdrop-blur-sm text-white rounded-full shadow-lg hover:bg-success transition-colors disabled:bg-neutral disabled:cursor-not-allowed">
                    <ScanIcon className="w-4 h-4" />
                    {t('analyzePlot')}
                </button>
            </div>

            <div className="absolute bottom-4 left-4 text-primary-content text-sm font-semibold bg-black/50 px-3 py-1 rounded-full z-10">
                {getHelperText()}
            </div>

            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                {points.length > 0 && (
                    <polygon
                        points={points.map(p => `${p.x},${p.y}`).join(' ')}
                        fill={isPolygonClosed ? "rgba(54, 211, 153, 0.4)" : "none"}
                        stroke={isPolygonClosed ? "#36D399" : "#FBBD23"}
                        strokeWidth="0.5"
                        strokeDasharray={isPolygonClosed ? "" : "2 2"}
                        vectorEffect="non-scaling-stroke"
                    />
                )}
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="1" fill={i === 0 && activeTool === 'polygon' ? '#F87272' : '#FBBD23'} vectorEffect="non-scaling-stroke" />
                ))}
                 {rectangle && (
                    <rect
                        x={rectangle.x}
                        y={rectangle.y}
                        width={rectangle.width}
                        height={rectangle.height}
                        fill={isRectangleDrawn ? "rgba(54, 211, 153, 0.4)" : "none"}
                        stroke={isRectangleDrawn ? "#36D399" : "#FBBD23"}
                        strokeWidth="0.5"
                        strokeDasharray={isRectangleDrawn ? "" : "2 2"}
                        vectorEffect="non-scaling-stroke"
                    />
                )}
            </svg>
            
            {(isAnalyzing || analysisComplete) && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center animate-fade-in z-20">
                    {isAnalyzing ? (
                        <>
                            <div className="w-20 h-20 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
                            <p className="mt-4 text-lg font-semibold text-primary-content">{t('analyzing')}</p>
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon className="w-20 h-20 text-success"/>
                            <p className="mt-2 text-lg font-semibold text-primary-content">{t('analysisComplete')}</p>
                            <p className="mt-2 text-sm text-base-content text-center max-w-sm px-4">{analysisText}</p>
                        </>
                    )}
                </div>
            )}
        </>
    );

    const renderCityOverlay = () => (
        <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="relative h-full flex flex-col items-center justify-center text-white p-4 text-center">
                <MapPinIcon className="w-12 h-12 text-error" style={{filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))'}} />
                 <h4 className="text-2xl font-bold mt-2 text-primary-content" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.6)'}}>{locationName}</h4>
                 {isLocating ? (
                     <p className="text-base-content font-semibold animate-pulse" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.6)'}}>{t('locating')}</p>
                 ) : locationError ? (
                     <p className="text-error font-semibold px-4" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.6)'}}>{locationError}</p>
                 ) : (
                     <p className="text-base-content font-semibold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.6)'}}>{t('mapView')}</p>
                 )}
            </div>
        </>
    );

    return (
        <div 
            ref={mapRef}
            className={`h-80 md:h-96 w-full relative rounded-2xl shadow-lg overflow-hidden select-none
                ${mapType === 'city' ? 'cursor-pointer' : ''} 
                ${activeTool === 'polygon' ? 'cursor-crosshair' : ''}
                ${activeTool === 'rectangle' ? 'cursor-crosshair' : ''}
            `}
            onClick={mapType === 'farm' ? handleMapClick : handleCityMapClick}
            onMouseDown={mapType === 'farm' ? handleMouseDown : undefined}
            onMouseMove={mapType === 'farm' ? handleMouseMove : undefined}
            onMouseUp={mapType === 'farm' ? handleMouseUp : undefined}
            onMouseLeave={mapType === 'farm' ? handleMouseUp : undefined} // End drawing if mouse leaves
        >
            <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-500" 
                style={{ backgroundImage: `url('https://source.unsplash.com/1200x800/?${backgroundKey}')` }}
                key={backgroundKey}
            ></div>
            {mapType === 'city' ? renderCityOverlay() : renderFarmOverlay()}
        </div>
    );
};

export default MapComponent;