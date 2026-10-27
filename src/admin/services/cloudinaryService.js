/**
 * Apna Digital Service — Cloudinary Document Upload Service
 * Handles direct, secure client-side uploading of verified documents (PDF, JPG, PNG)
 * using Cloudinary's Unsigned Upload Presets.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'apna_documents';

export const isCloudinaryConfigured = Boolean(
  CLOUD_NAME && 
  CLOUD_NAME !== 'your_cloudinary_cloud_name' &&
  UPLOAD_PRESET
);

/**
 * Upload a document file (PDF, JPG, PNG) directly to Cloudinary
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Progress callback (percentage)
 * @returns {Promise<{success: boolean, secureUrl?: string, originalName?: string, bytes?: number, error?: string}>}
 */
export async function uploadDocumentToCloudinary(file, onProgress) {
  if (!file) {
    return { success: false, error: 'No file provided for upload.' };
  }

  // Validate allowed file types
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  const isAllowed = allowedTypes.includes(file.type) || file.name.toLowerCase().endsWith('.pdf');
  
  if (!isAllowed) {
    return { 
      success: false, 
      error: 'Invalid file format. Please upload a PDF document or high-resolution image (JPG/PNG).' 
    };
  }

  // Max 15MB file size limit
  if (file.size > 15 * 1024 * 1024) {
    return { success: false, error: 'File size exceeds maximum allowed limit (15MB).' };
  }

  // If Cloudinary is not configured in .env, use local offline simulator for instant testing
  if (!isCloudinaryConfigured) {
    console.warn(
      'Cloudinary credentials not detected in .env. Using Instant Local Simulator for testing.'
    );

    if (onProgress) {
      onProgress(35);
      await new Promise(r => setTimeout(r, 200));
      onProgress(75);
      await new Promise(r => setTimeout(r, 200));
      onProgress(100);
    }

    // Convert file to local preview object URL or data URL
    const fakeUrl = URL.createObjectURL(file);
    return {
      success: true,
      secureUrl: fakeUrl,
      originalName: file.name,
      bytes: file.size,
      format: file.name.split('.').pop() || 'pdf',
      isLocalSimulation: true
    };
  }

  // Live Cloudinary REST Upload (Unsigned)
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'apna_documents/pdfs');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              secureUrl: data.secure_url,
              originalName: file.name,
              bytes: data.bytes || file.size,
              format: data.format || file.name.split('.').pop(),
              publicId: data.public_id
            });
          } catch {
            reject({ success: false, error: 'Invalid response from Cloudinary.' });
          }
        } else {
          let errMsg = `Upload failed (Status ${xhr.status})`;
          try {
            const errData = JSON.parse(xhr.responseText);
            if (errData?.error?.message) {
              errMsg = errData.error.message;
            }
          } catch {
            // keep default errMsg
          }
          resolve({ success: false, error: errMsg });
        }
      };

      xhr.onerror = () => {
        resolve({ 
          success: false, 
          error: 'Network connection error during Cloudinary upload.' 
        });
      };

      xhr.send(formData);
    });
  } catch (err) {
    return { success: false, error: err.message || 'Cloudinary upload exception.' };
  }
}
