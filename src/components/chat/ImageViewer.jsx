import React from 'react';

const ImageViewer = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
                <i className="fi fi-rr-cross text-xl"></i>
            </button>

            {/* Download button */}
            <a
                href={imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute top-4 left-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Download"
            >
                <i className="fi fi-rr-download text-xl"></i>
            </a>

            {/* Image */}
            <img
                src={imageUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

export default ImageViewer;
