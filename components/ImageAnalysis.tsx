import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { geminiService } from '../services/geminiService';
import type { ImageAnalysisResponse } from '../types';
import { UploadCloudIcon, SparklesIcon } from './icons/Icons';

interface ImageAnalysisProps {
    onAnalysisComplete: (result: ImageAnalysisResponse) => void;
}

const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ onAnalysisComplete }) => {
    const { t, language } = useI18n();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setError(null);
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setError('Please select a valid image file.');
        }
    };

    const handleAnalyze = async () => {
        if (!file || !imagePreview) return;
        setIsAnalyzing(true);
        setError(null);
        try {
            // Get base64 data from the data URL
            const base64Data = imagePreview.split(',')[1];
            const result = await geminiService.analyzeFarmImage(base64Data, file.type, language);
            onAnalysisComplete(result);
        } catch (err) {
            setError(t('errorGenerating'));
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };
    
    return (
        <div className="bg-base-100 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-primary-content mb-4">{t('farmAnalysis')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                    <label 
                        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-base-300' : 'border-base-300 bg-base-200 hover:bg-base-300'}`}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                    >
                        {imagePreview ? (
                             <img src={imagePreview} alt="Farm preview" className="object-cover h-full w-full rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                <UploadCloudIcon className="w-10 h-10 mb-3 text-base-content" />
                                <p className="mb-2 text-sm text-base-content"><span className="font-semibold">{t('clickToUpload')}</span> {t('dragAndDrop')}</p>
                                <p className="text-xs text-base-content">{t('imageFormat')}</p>
                            </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                    </label>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                    <p className="mb-4 text-base-content">Upload a satellite image of your farm to get an AI-powered analysis of your crop health, including fertilizer and irrigation advice.</p>
                     <button
                        onClick={handleAnalyze}
                        disabled={!file || isAnalyzing}
                        className="bg-primary hover:bg-primary-focus text-primary-content font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 disabled:bg-neutral disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isAnalyzing ? (
                             <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <SparklesIcon className="w-5 h-5" />
                        )}
                        <span>{isAnalyzing ? t('analyzing') : t('analyzePlot')}</span>
                    </button>
                    {error && <p className="text-error mt-4 text-sm">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ImageAnalysis;
