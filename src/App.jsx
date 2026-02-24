import { useState } from 'react';
import Dropzone from './components/Dropzone';
import ResultPanel from './components/ResultPanel';
import { compressImage } from './utils/compressor';
import './index.css';

function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [targetSize, setTargetSize] = useState('100kb');
  const [compressedFile, setCompressedFile] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState(null);

  const handleImageSelect = (imageData) => {
    setOriginalImage(imageData);
    setCompressedFile(null);
    setError(null);
    handleCompress(imageData.file, targetSize);
  };

  const handleSizeChange = (newSize) => {
    setTargetSize(newSize);
    if (originalImage) {
      handleCompress(originalImage.file, newSize);
    }
  };

  const handleCompress = async (file, sizePreset) => {
    setIsCompressing(true);
    setCompressedFile(null);
    setError(null);

    try {
      // Small timeout to allow UI to show loading state before intense CPU work
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = await compressImage(file, sizePreset);
      setCompressedFile(result);
    } catch (err) {
      setError("Failed to compress image. Please try another file.");
      console.error(err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setCompressedFile(null);
    setError(null);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Opti<span className="accent">Shrink</span></h1>
        <p>Premium privacy-first image compression directly in your browser.</p>
      </header>

      <main className="main-content">
        {!originalImage ? (
          <div className="upload-view">
            <Dropzone onImageSelect={handleImageSelect} />
            <div className="features">
              <div className="feature">⚡ Lightning Fast</div>
              <div className="feature">🔒 Zero Server Uploads</div>
              <div className="feature">🎯 Strict Size Targets</div>
            </div>
          </div>
        ) : (
          <div className="compress-view">
            <div className="controls panel">
              <h3>Select Target Size</h3>
              <div className="size-options">
                {['100kb', '50kb', '20kb'].map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${targetSize === size ? 'active' : ''}`}
                    onClick={() => handleSizeChange(size)}
                    disabled={isCompressing}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div className="error-panel">
                <p>{error}</p>
                <button onClick={handleReset}>Try Again</button>
              </div>
            ) : (
              <ResultPanel
                originalImage={originalImage}
                compressedFile={compressedFile}
                targetSize={targetSize}
                onReset={handleReset}
                isCompressing={isCompressing}
              />
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Built for speed and precision.</p>
      </footer>
    </div>
  );
}

export default App;
