/**
 * Download utility functions for handling file downloads
 */

/**
 * Extract filename from a URL
 * @param url - The URL to extract filename from
 * @returns The extracted filename or 'download' as fallback
 */
export function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || 'download';
    return filename;
  } catch {
    return 'download';
  }
}

/**
 * Download a file from a URL using blob method with fallback
 * @param url - The URL of the file to download
 * @param filename - Optional custom filename (will be extracted from URL if not provided)
 * @returns Promise that resolves when download is initiated
 */
export async function downloadFile(url: string, filename?: string): Promise<void> {
  const downloadFilename = filename || getFilenameFromUrl(url);

  try {
    // Fetch the file as a blob to force download behavior
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();

    // Create a blob URL and trigger download
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = downloadFilename;
    link.style.display = 'none';

    // Add to DOM temporarily to ensure download works
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL to free memory
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback to the original method if fetch fails
    downloadFileDirectly(url, downloadFilename);
  }
}

/**
 * Download a file directly using anchor element (fallback method)
 * @param url - The URL of the file to download
 * @param filename - Optional custom filename (will be extracted from URL if not provided)
 */
export function downloadFileDirectly(url: string, filename?: string): void {
  const downloadFilename = filename || getFilenameFromUrl(url);

  const link = document.createElement('a');
  link.href = url;
  link.download = downloadFilename;
  link.target = '_blank';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
