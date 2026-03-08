import { baseApiClient } from '@/libs/api/axios';
import { APIRoutes } from '@/libs/apiRoutes';

interface UploadResponse {
  message: string;
  data: {
    path: string;
    miniPath: string;
    pngPath: string;
    url?: string;
    miniUrl?: string;
    pngUrl?: string;
    size: number;
    mimetype: string;
    originalName: string;
    warning?: string; // Present if optimization failed
  };
}

interface UploadResult {
  path: string;
  miniPath: string;
  pngPath: string;
  warning?: string;
}

/**
 * Upload an image or video file to the backend
 * @param file - The file to upload (image or video)
 * @param category - The upload category (default: 'user')
 * @returns Object with path, miniPath, and optional warning
 */
export async function uploadImage(file: File, category: string = 'user'): Promise<UploadResult> {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  // Validate file type
  if (!isImage && !isVideo) {
    throw new Error('Only image and video files are allowed');
  }

  // Validate file size based on type
  const imageMaxSize = 10 * 1024 * 1024; // 10MB
  const videoMaxSize = 50 * 1024 * 1024; // 50MB

  if (isImage && file.size > imageMaxSize) {
    throw new Error('Image size must be less than 10MB');
  }

  if (isVideo && file.size > videoMaxSize) {
    throw new Error('Video size must be less than 50MB');
  }

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  try {
    // Upload to backend
    const response = await baseApiClient.post<UploadResponse>(
      APIRoutes.uploadSingleFile,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Validate response
    if (!response.data.data?.path) {
      throw new Error('Upload failed: No path returned from server');
    }

    const result: UploadResult = {
      path: response.data.data.path,
      miniPath: response.data.data.miniPath,
      pngPath: response.data.data.pngPath,
      warning: response.data.data.warning,
    };

    // Show warning if optimization failed (optional - can be handled by component)
    if (result.warning) {
      console.warn('Upload warning:', result.warning);
      // You can add toast notification here if you have a toast system
      // Example: toast.warning(result.warning);
    }

    return result;
  } catch (error) {
    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload file');
  }
}

/**
 * Alias for uploadImage with clearer naming for media files
 */
export const uploadMedia = uploadImage;
