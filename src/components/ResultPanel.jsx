import { Download, ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

// Using a slightly smaller target internally for safety to guarantee staying under limit
const SAFE_LIMITS = {
    '100kb': 98 * 1024,
    '50kb': 48 * 1024,
    '20kb': 19 * 1024,
};

export default function ResultPanel({ originalImage, compressedFile, targetSize, onReset, isCompressing }) {
    const [compressedPreview, setCompressedPreview] = useState(null);

    useEffect(() => {
        if (compressedFile) {
            setCompressedPreview(URL.createObjectURL(compressedFile));
        }
    }, [compressedFile]);

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const calculateReduction = () => {
        if (!originalImage || !compressedFile) return 0;
        return Math.round((1 - compressedFile.size / originalImage.originalSize) * 100);
    };

    const handleDownload = () => {
        if (!compressedFile) return;
        const url = URL.createObjectURL(compressedFile);
        const link = document.createElement('a');
        link.href = url;

        // Add prefix to clearly identify the compressed file
        const newName = `compressed-${targetSize}-${originalImage.name}`;
        link.download = newName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const isGuaranteedSafe = compressedFile && compressedFile.size <= Math.max(...Object.values(SAFE_LIMITS)); // Loose check

    return (
        <div className="result-container animate-fade-in">
            <button className="back-btn" onClick={onReset}>
                <ArrowLeft size={18} /> Back
            </button>

            {isCompressing ? (
                <div className="loading-state">
                    <Loader2 className="spinner" size={48} />
                    <h2>Compressing Image...</h2>
                    <p>Optimizing to strictly stay under {targetSize} without losing detail</p>
                </div>
            ) : (
                <>
                    <div className="preview-grid">
                        <div className="preview-card original">
                            <div className="img-wrapper">
                                <img src={originalImage.previewUrl} alt="Original" />
                            </div>
                            <div className="details">
                                <span className="badge">Original</span>
                                <span className="size">{formatSize(originalImage.originalSize)}</span>
                            </div>
                        </div>

                        <div className="preview-card compressed">
                            <div className="img-wrapper checkerboard">
                                {compressedPreview && <img src={compressedPreview} alt="Compressed" />}
                            </div>
                            <div className="details">
                                <span className="badge success">Compressed</span>
                                <span className={`size ${compressedFile.size > SAFE_LIMITS[targetSize] ? 'warning' : ''}`}>
                                    {formatSize(compressedFile?.size)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="stats">
                            <div className="stat">
                                <label>Reduction</label>
                                <span>-{calculateReduction()}%</span>
                            </div>
                            <div className="stat">
                                <label>Target Limit</label>
                                <span>{targetSize}</span>
                            </div>
                        </div>

                        <button
                            className="download-btn pulse"
                            onClick={handleDownload}
                            autoFocus
                        >
                            <Download size={20} />
                            Download Image
                        </button>

                        {compressedFile && compressedFile.size > 1024 * parseInt(targetSize) && (
                            <p className="warning-text">Note: Due to image complexity, we couldn't go completely below {targetSize} without destroying the image.</p>
                        )}

                    </div>
                </>
            )}
        </div>
    );
}
