import React, { useRef, useState, useEffect } from 'react';

const CameraCapture = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraStream, setCameraStream] = useState(null);
    const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back

    // Start camera on mount
    useEffect(() => {
        openCamera();
        return () => {
            stopCamera();
        };
    }, []);

    // Cleanup when stream changes
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    const openCamera = async (mode = facingMode) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Fitur kamera tidak tersedia. Pastikan menggunakan HTTPS atau akses dari localhost.');
            onClose();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode },
                audio: false
            });
            setCameraStream(stream);

            // Set stream to video element
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Failed to access camera:', error);
            if (error.name === 'NotAllowedError') {
                alert('Izin kamera ditolak. Mohon izinkan akses kamera di pengaturan browser.');
            } else if (error.name === 'NotFoundError') {
                alert('Kamera tidak ditemukan di perangkat ini.');
            } else {
                alert('Gagal mengakses kamera: ' + error.message);
            }
            onClose();
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        setCameraStream(null);
    };

    const switchCamera = async () => {
        stopCamera();
        const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newFacingMode);
        await openCamera(newFacingMode);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        const ctx = canvas.getContext('2d');

        // If front camera, flip horizontally
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
            if (blob) {
                // Create a File object from blob
                const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
                onCapture(file);
                onClose();
            }
        }, 'image/jpeg', 0.9);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">
            {/* Camera Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
                <button
                    onClick={onClose}
                    className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <i className="fi fi-rr-cross text-xl"></i>
                </button>
                <span className="text-white font-medium">Kamera</span>
                <button
                    onClick={switchCamera}
                    className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                    title="Ganti kamera"
                >
                    <i className="fi fi-rr-refresh text-xl"></i>
                </button>
            </div>

            {/* Camera View */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`h-full w-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    onLoadedMetadata={() => videoRef.current?.play()}
                />
            </div>

            {/* Camera Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center items-center bg-gradient-to-t from-black/70 to-transparent">
                <button
                    onClick={capturePhoto}
                    className="w-16 h-16 rounded-full bg-white border-4 border-white/30 hover:scale-105 transition-transform flex items-center justify-center shadow-lg"
                    title="Ambil foto"
                >
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-300"></div>
                </button>
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default CameraCapture;
