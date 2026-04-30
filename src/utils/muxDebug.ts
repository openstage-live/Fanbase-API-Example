import type { PlaybackData } from '@api/post.api';

/**
 * Debug utility for Mux video issues
 */
class MuxDebugger {
  static detectBrowser(): { isSafari: boolean; isChrome: boolean; version?: string } {
    const userAgent = navigator.userAgent;
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent);

    let version;
    if (isSafari) {
      const safariVersion = userAgent.match(/Version\/([0-9.]+)/);
      version = safariVersion ? safariVersion[1] : 'unknown';
    }

    return { isSafari, isChrome, version };
  }
  static logPlaybackData(data: PlaybackData | null, context: string = '') {
    if (!data) {
      console.warn(`${context}: No playback data available`);
      return;
    }

    const browser = this.detectBrowser();

    console.group(`🎥 Mux Debug - ${context}`);
    console.log(
      'Browser:',
      browser.isSafari ? `Safari ${browser.version}` : browser.isChrome ? 'Chrome' : 'Other',
    );
    console.log('Playback ID:', data.playbackId);
    console.log('Has Token:', !!data.token);
    console.log('Has Thumbnail Token:', !!data.thumbnailToken);
    console.log('Has JWT:', !!data.jwt);

    if (browser.isSafari) {
      console.warn('🦊 Safari detected - may have specific compatibility issues with signed URLs');
    }

    if (data.token) {
      try {
        // Try to decode JWT to check expiry (basic check)
        const tokenParts = data.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1] ?? ''));
          const now = Math.floor(Date.now() / 1000);
          const isExpired = payload.exp && payload.exp < now;

          console.log('Token expires at:', new Date(payload.exp * 1000).toISOString());
          console.log('Token is expired:', isExpired);

          if (isExpired) {
            console.warn('⚠️ Token is expired! This may cause 403 errors.');
          }
        }
      } catch {
        console.log('Could not decode token (may not be JWT)');
      }
    }

    if (data.thumbnailToken) {
      try {
        const tokenParts = data.thumbnailToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1] ?? ''));
          const now = Math.floor(Date.now() / 1000);
          const isExpired = payload.exp && payload.exp < now;

          console.log('Thumbnail token expires at:', new Date(payload.exp * 1000).toISOString());
          console.log('Thumbnail token is expired:', isExpired);

          if (isExpired) {
            console.warn('⚠️ Thumbnail token is expired! This may cause 403 errors on thumbnails.');
          }
        }
      } catch {
        console.log('Could not decode thumbnail token (may not be JWT)');
      }
    }

    console.groupEnd();
  }

  static logVideoError(event: Event, context: string = '') {
    const browser = this.detectBrowser();

    console.group(`🚨 Mux Video Error - ${context}`);
    console.log(
      'Browser:',
      browser.isSafari ? `Safari ${browser.version}` : browser.isChrome ? 'Chrome' : 'Other',
    );

    const target = event.target as HTMLVideoElement & {
      error?: { code: number; message: string };
      readyState: number;
      networkState: number;
      currentTime: number;
      duration: number;
    };
    const errorType = event.type;
    const errorCode = target?.error?.code;
    const errorMessage = target?.error?.message;
    const readyState = target?.readyState;
    const networkState = target?.networkState;

    console.log('Error Type:', errorType);
    console.log('Error Code:', errorCode);
    console.log('Error Message:', errorMessage);
    console.log('Ready State:', readyState);
    console.log('Network State:', networkState);
    console.log('Current Time:', target?.currentTime);
    console.log('Duration:', target?.duration);

    // Safari-specific error handling
    if (browser.isSafari) {
      console.warn('🦊 Safari-specific considerations:');
      console.log('- Safari may have "Hide IP Address" enabled, interfering with signed URLs');
      console.log('- Safari handles HLS differently than Chrome');
      console.log('- Consider using MP4 fallback for Safari compatibility');
    }

    // Provide helpful error code meanings
    if (errorCode) {
      const errorMeanings = {
        1: 'MEDIA_ERR_ABORTED - The user aborted the video playback',
        2: 'MEDIA_ERR_NETWORK - A network error occurred while downloading the video',
        3: 'MEDIA_ERR_DECODE - An error occurred while decoding the video',
        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - The video format is not supported',
      };
      console.log(
        'Error Meaning:',
        errorMeanings[errorCode as keyof typeof errorMeanings] || 'Unknown error',
      );
    }

    console.groupEnd();
  }

  static checkThumbnailUrl(url: string): void {
    if (!url) {
      console.warn('Thumbnail URL is empty');
      return;
    }

    console.log('🖼️ Checking thumbnail URL:', url);

    // Test if the thumbnail URL is accessible
    const img = new Image();
    img.onload = () => {
      console.log('✅ Thumbnail loaded successfully');
    };
    img.onerror = (e) => {
      console.error('❌ Thumbnail failed to load:', e);
      console.log('This may indicate a 403 error or expired thumbnail token');
    };
    img.src = url;
  }
}

// Export as default for easier importing
export default MuxDebugger;
