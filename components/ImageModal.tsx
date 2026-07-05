
import React from 'react';
import { XIcon } from './icons/Icons';
import { useI18n } from '../hooks/useI18n';

interface ImageModalProps {
    imageUrl: string;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
    const { t } = useI18n();
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative bg-base-100 p-4 rounded-lg shadow-2xl max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-base-content hover:text-primary-content transition-colors z-10" aria-label={t('close')}>
                    <XIcon className="w-8 h-8" />
                </button>
                <div className="overflow-hidden rounded-md">
                   <img src={imageUrl} alt="High resolution satellite view" className="w-full h-auto object-contain max-h-[80vh]" />
                </div>
            </div>
        </div>
    );
};

export default ImageModal;
