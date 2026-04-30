/**
 * Safari-specific video compatibility fixes
 * Addresses known issues with Safari video playback, particularly with Mux
 */

interface SafariVideoConfig {
  preferNativePlayback: boolean;
  useStaticThumbnails: boolean;
  extendedStallTimeout: number;
  maxRetries: number;
  forceMetadataPreload: boolean;
}

class SafariVideoFix {
  private static readonly DEFAULT_CONFIG: SafariVideoConfig = {
    preferNativePlayback: true,
    useStaticThumbnails: true,
    extendedStallTimeout: 8000,
    maxRetries: 3,
    forceMetadataPreload: true,
  };

  static isSafari(): boolean {
    const userAgent = navigator.userAgent;
    return /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  }

  static getSafariVersion(): string | null {
    if (!this.isSafari()) return null;
    const match = navigator.userAgent.match(/Version\/([0-9.]+)/);
    return match?.[1] ? match[1] : null;
  }

  static hasIPHidingEnabled(): boolean {
    // Cannot directly detect if "Hide IP Address" is enabled
    // But we can provide guidance to users
    return this.isSafari();
  }

  static getOptimalMuxConfig(): Record<string, unknown> {
    if (!this.isSafari()) return {};

    return {
      'prefer-playback': 'native', // Use Safari's native HLS instead of MSE
      'stream-type': 'on-demand',
      preload: 'metadata',
      playsinline: true,
      // Disable autoplay in Safari to avoid issues
      autoplay: false,
    };
  }

  static getOptimalThumbnailUrl(playbackId: string, thumbnailToken?: string): string {
    if (!playbackId) return '';

    if (this.isSafari()) {
      // Safari-optimized thumbnail URL
      if (thumbnailToken) {
        return `https://image.mux.com/${playbackId}/thumbnail.jpg?token=${thumbnailToken}&width=640&height=360&fit_mode=preserve`;
      }
      // Fallback without token - more likely to work in Safari
      return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&time=1&fit_mode=preserve`;
    }

    // Non-Safari browsers
    if (thumbnailToken) {
      return `https://image.mux.com/${playbackId}/thumbnail.jpg?token=${thumbnailToken}`;
    }
    return `https://image.mux.com/${playbackId}/animated.gif?width=640&height=360`;
  }

  static shouldRetryOnError(
    errorType: string,
    errorCode?: number,
    retryCount: number = 0,
  ): boolean {
    if (!this.isSafari()) {
      // Non-Safari: only retry on network/decode errors
      return (errorCode === 3 || errorCode === 4) && retryCount < 2;
    }

    // Safari: more aggressive retry strategy
    const maxRetries = this.DEFAULT_CONFIG.maxRetries;

    if (retryCount >= maxRetries) return false;

    // Safari-specific retry conditions
    if (errorType === 'stalled' || errorType === 'abort') {
      return true; // Always retry these in Safari
    }

    if (errorCode === 2 || errorCode === 3 || errorCode === 4) {
      return true; // Retry network, decode, and format errors
    }

    return false;
  }

  static getRetryDelay(errorType: string, retryCount: number): number {
    if (!this.isSafari()) return 2000;

    // Safari: progressive backoff with longer delays
    const baseDelay = errorType === 'stalled' ? 8000 : 3000;
    return baseDelay * Math.pow(1.5, retryCount);
  }

  static logSafariSpecificInfo(): void {
    if (!this.isSafari()) return;

    console.group('🦊 Safari Video Compatibility Info');
    console.log('Safari Version:', this.getSafariVersion());
    console.log('User Agent:', navigator.userAgent);

    console.warn('Known Safari Issues:');
    console.log('• "Hide IP Address" feature can cause 403 errors with signed URLs');
    console.log("• Native HLS implementation differs from Chrome's MSE");
    console.log('• Stalled/abort events are more common and may not indicate errors');
    console.log('• Autoplay policies are stricter');

    console.log('Applied Fixes:');
    console.log('• Using native playback instead of MSE');
    console.log('• Extended timeout for stalled events');
    console.log('• Aggressive retry strategy for network errors');
    console.log('• Static thumbnails preferred over animated');

    if (this.hasIPHidingEnabled()) {
      console.warn(
        '💡 If videos fail to load, try disabling "Hide IP Address" in Safari settings:',
      );
      console.log('Safari > Settings > Privacy & Security > Hide IP Address > Off');
    }

    console.groupEnd();
  }

  /**
   * Apply Safari-specific fixes to a video element
   */
  static applyVideoElementFixes(videoElement: HTMLVideoElement): void {
    if (!this.isSafari()) return;

    // Force Safari to prepare the video
    try {
      videoElement.load();
    } catch (e) {
      console.warn('Failed to call load() on video element:', e);
    }

    // Add Safari-specific event listeners
    videoElement.addEventListener('stalled', () => {
      console.log('Safari video stalled - this may be normal');
    });

    videoElement.addEventListener('waiting', () => {
      console.log('Safari video waiting - buffering');
    });

    // Monitor readyState changes for Safari
    videoElement.addEventListener('progress', () => {
      console.log('Safari video progress - readyState:', videoElement.readyState);
    });

    // Ensure playsinline is set for mobile Safari
    videoElement.setAttribute('playsinline', 'true');
    videoElement.setAttribute('webkit-playsinline', 'true');

    // Force more aggressive preload for Safari to get past readyState 1
    videoElement.setAttribute('preload', 'auto');

    // Add a specific handler for Safari readyState monitoring
    let readyStateCheckCount = 0;
    const maxReadyStateChecks = 10;

    const checkReadyStateProgress = () => {
      readyStateCheckCount++;
      console.log(`Safari readyState check #${readyStateCheckCount}: ${videoElement.readyState}`);

      if (videoElement.readyState === 1 && readyStateCheckCount < maxReadyStateChecks) {
        // Still stuck at metadata, try to force progress
        setTimeout(() => {
          if (videoElement.readyState === 1) {
            console.warn('Safari still stuck at readyState 1, forcing load()');
            try {
              videoElement.load();
            } catch (e) {
              console.warn('Failed to reload video:', e);
            }
          }
          checkReadyStateProgress();
        }, 1000);
      }
    };

    // Start monitoring after initial load
    setTimeout(checkReadyStateProgress, 1000);
  }

  /**
   * Get user-friendly error message for Safari-specific issues
   */
  static getSafariErrorMessage(errorType: string, errorCode?: number): string {
    if (!this.isSafari()) return '';

    if (errorType === 'stalled' || errorType === 'abort') {
      return 'Video loading was interrupted. This may be due to Safari\'s "Hide IP Address" feature. Try refreshing or disabling this feature in Safari settings.';
    }

    if (errorCode === 2) {
      return "Network error occurred. This may be related to Safari's privacy features. Try refreshing the page.";
    }

    if (errorCode === 3 || errorCode === 4) {
      return 'Video format compatibility issue. Safari handles videos differently than other browsers.';
    }

    return 'Safari-specific video loading issue. Try refreshing the page or disabling "Hide IP Address" in Safari settings.';
  }
}

export default SafariVideoFix;
