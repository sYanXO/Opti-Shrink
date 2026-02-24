import imageCompression from 'browser-image-compression';

const TARGET_SIZES = {
  '100kb': 0.1, // MAX size in MB
  '50kb': 0.05,
  '20kb': 0.02,
};

/**
 * Compresses an image strictly below the target size (in MB).
 * 
 * @param {File} file - The original image file
 * @param {string} targetKey - One of '100kb', '50kb', '20kb'
 * @returns {Promise<File>} - A Promise that resolves to the compressed File object.
 */
export async function compressImage(file, targetKey) {
  const maxSizeMB = TARGET_SIZES[targetKey];
  
  if (!maxSizeMB) {
    throw new Error(`Invalid target size: ${targetKey}`);
  }

  const options = {
    maxSizeMB: maxSizeMB,
    useWebWorker: true,
    initialQuality: 0.8,
    // Provide some maximum dimensions to help the compression algo reach the size organically
    // without completely destroying visual details. 
    maxWidthOrHeight: 1920, 
    alwaysKeepResolution: false,
  };

  try {
    let compressedFile = await imageCompression(file, options);
    
    // Safety check: The library is usually good, but just to be absolutely certain we are under the strict limit:
    // If it's still slightly over, we do a secondary more aggressive pass.
    let attempts = 0;
    while (compressedFile.size / 1024 / 1024 > maxSizeMB && attempts < 3) {
      options.initialQuality *= 0.7; // Reduce quality further
      options.maxWidthOrHeight = Math.floor(options.maxWidthOrHeight * 0.8); // Reduce dimensions
      compressedFile = await imageCompression(compressedFile, options);
      attempts++;
    }

    return compressedFile;
  } catch (error) {
    console.error("Compression Error:", error);
    throw error;
  }
}
