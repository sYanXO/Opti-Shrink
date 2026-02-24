import { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

export default function Dropzone({ onImageSelect }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file) => {
        if (!file.type.startsWith('image/')) {
            alert("Please upload an image file.");
            return;
        }
        // Read the file for preview
        const reader = new FileReader();
        reader.onload = (e) => {
            onImageSelect({
                file: file,
                previewUrl: e.target.result,
                name: file.name,
                originalSize: file.size,
            });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div
            className={`dropzone-container ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
            <div className="dropzone-content">
                <div className="icon-circle">
                    <UploadCloud size={32} />
                </div>
                <h3>Click or drag image to upload</h3>
                <p>Supports JPG, PNG, WEBP and more</p>
            </div>
        </div>
    );
}
