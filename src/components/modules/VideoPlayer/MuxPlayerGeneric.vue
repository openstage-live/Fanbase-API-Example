<template>
  <div class="mux-player group relative flex w-full cursor-pointer items-center justify-center">
    <!-- Loading overlay -->
    <div
      v-if="isLoading || isVideoLoading"
      class="absolute z-20 flex min-h-dvh w-full cursor-pointer items-center justify-center"
    >
      <div class="flex flex-col items-center justify-center gap-4">
        <Loader2 class="h-12 w-12 animate-spin stroke-white" />
      </div>
    </div>

    <!-- Error overlay -->
    <div
      v-if="error"
      class="absolute z-30 flex min-h-dvh w-full cursor-pointer items-center justify-center"
    >
      <div class="flex flex-col items-center justify-center gap-2 p-6 text-center">
        <AlertTriangle class="mb-1 h-10 w-10 stroke-white" />
        <h3 class="text-lg font-semibold text-white">
          {{ t('common.videoPlayer.videoUnavailable') }}
        </h3>
        <p class="mb-4 text-sm text-white opacity-90">{{ errorMessage }}</p>
        <button
          @click="retryLoad"
          class="bg-orange-500 hover:bg-orange-600 focus:ring-orange-500 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          {{ t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Play icon overlay (shown when not playing) -->
    <div
      v-if="!isPlaying && !isLoading && !isVideoLoading && !error && shouldShowPlayOverlay"
      @click="handlePlayClick"
      class="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-cover bg-center"
      :style="{ backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined }"
    >
      <div class="pointer-events-none absolute inset-0 bg-black/40"></div>

      <CirclePlay
        class="h-16 w-16 stroke-white stroke-1 transition-transform group-hover:scale-110"
      />
      <!-- Safari stuck state indicator -->
      <div
        v-if="isSafari && muxPlayer && muxPlayer.readyState === 1"
        class="bg-orange-500/80 absolute bottom-4 left-1/2 -translate-x-1/2 rounded px-2 py-1 text-xs text-white"
      >
        Tap to retry loading
      </div>
    </div>

    <!-- Mux Player -->
    <mux-player
      ref="muxPlayer"
      v-if="!error && (isPublicMode || fetchedPlaybackData || playbackData)"
      :playback-id="finalPlaybackId"
      v-bind="{
        ...(finalPlaybackToken ? { 'playback-token': finalPlaybackToken } : {}),
        ...(finalThumbnailToken ? { 'thumbnail-token': finalThumbnailToken } : {}),
        ...(metadataVideoId ? { 'metadata-video-id': metadataVideoId } : {}),
        ...(metadataVideoTitle ? { 'metadata-video-title': metadataVideoTitle } : {}),
        ...(metadataViewerUserId ? { 'metadata-viewer-user-id': metadataViewerUserId } : {}),
        ...(metadataSubPropertyId ? { 'metadata-sub-property-id': metadataSubPropertyId } : {}),
        ...(envKey ? { 'env-key': envKey } : {}),
      }"
      :prefer-playback="finalPreferPlayback"
      :stream-type="streamType"
      :aspect-ratio="aspectRatio"
      :debug="debug"
      :theme="theme"
      :loading="loading"
      class="mux-player-element h-full"
      :class="{ 'w-full': !customSize }"
      video
      :preload="isSafari ? 'auto' : 'metadata'"
      playsinline
      :controls="showControls"
      :loop="loop"
      :muted="muted"
      :autoplay="autoplay"
      @play="handlePlay"
      @pause="handlePause"
      @playing="handlePlaying"
      @loadstart="handleLoadStart"
      @canplay="handleCanPlay"
      @canplaythrough="handleCanPlayThrough"
      @loadeddata="handleLoadedData"
      @error="handleVideoError"
      @abort="handleSafariEvent"
      @stalled="handleSafariEvent"
      @waiting="handleWaiting"
      @ended="handleEnded"
      @volumechange="handleVolumeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, nextTick, watch } from 'vue';
import { useTranslation } from '@/locales/i18n';
import '@mux/mux-player';
import MuxDebugger from '@/utils/muxDebug';
import SafariVideoFix from '@/utils/safariVideoFix';

// Icons
import { Loader2, AlertTriangle, CirclePlay } from 'lucide-vue-next';

// Interfaces
import { getPostPlay, type PlaybackData } from '@api/post.api';

interface MuxPlayerElement extends HTMLVideoElement {
  paused: boolean;
  muted: boolean;
  volume: number;
  play: () => Promise<void>;
  pause: () => void;
}

interface Props {
  // Public mode props (playback-id only)
  playbackId?: string;

  // Private mode props (requires contentId to fetch tokens)
  contentId?: string;

  // Pre-fetched playback data (if provided, skips API call)
  playbackData?: PlaybackData;

  // If true, component will wait for playbackData from parent instead of fetching
  expectDataFromParent?: boolean;

  // Optional tokens for private mode (if you already have them)
  playbackToken?: string;
  thumbnailToken?: string;

  // Display options
  aspectRatio?: string;
  customSize?: boolean;
  showPlayOverlay?: boolean;

  // Player options
  showControls?: boolean;
  loop?: boolean;
  muted?: boolean;
  autoplay?: boolean;
  streamType?: 'on-demand' | 'live';

  // Thumbnail options
  thumbnailTime?: number;
  customThumbnailUrl?: string;

  // Metadata options
  metadataVideoId?: string;
  metadataVideoTitle?: string;
  metadataViewerUserId?: string;
  metadataSubPropertyId?: string;

  // Advanced options
  debug?: boolean;
  envKey?: string;
  theme?: string;
  loading?: 'auto' | 'lazy' | 'eager';
  preferPlayback?: 'auto' | 'mse' | 'native';
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: '16/9',
  customSize: false,
  showPlayOverlay: true,
  showControls: false,
  loop: false,
  muted: false,
  autoplay: false,
  streamType: 'on-demand',
  thumbnailTime: 0,
  metadataSubPropertyId: 'yungblud',
  debug: false,
  theme: 'microvideo',
  loading: 'auto',
  preferPlayback: 'auto',
});

// Emits
const emit = defineEmits<{
  play: [];
  pause: [];
  playing: [];
  ended: [];
  error: [message: string];
  loaded: [];
  loadstart: [];
  volumechange: [];
}>();

// Composables
const { t } = useTranslation();

// Refs
const isPlaying = ref(false);
const isLoading = ref(false);
const isVideoLoading = ref(false);
const error = ref(false);
const errorMessage = ref('');
const muxPlayer = ref<MuxPlayerElement | null>(null);
const fetchedPlaybackData = ref<PlaybackData | null>(null);
const isSafari = ref(false);
const safariRetryCount = ref(0);
const maxSafariRetries = 3;
const loadingTimeout = ref<number | null>(null);
const safariLoadingTimeout = 15000; // 15 second timeout for Safari loading
const hasLoadedData = ref(false);

// Computed
const isPublicMode = computed(() => {
  return !!props.playbackId && !props.contentId;
});

const isPrivateMode = computed(() => {
  return !!props.contentId || !!props.playbackData;
});

const shouldShowPlayOverlay = computed(() => {
  return (
    props.showPlayOverlay &&
    (isPublicMode.value ||
      fetchedPlaybackData.value ||
      props.playbackData ||
      // Show overlay for private mode even when data is still loading
      (isPrivateMode.value && (props.contentId || props.expectDataFromParent)))
  );
});

// Controls visibility of Mux's built-in big play button overlay.
// Hide it when using our custom overlay; show it otherwise.
const muxPlayButtonDisplay = computed(() => (props.showPlayOverlay ? 'none' : 'initial'));

const finalPlaybackId = computed(() => {
  if (isPublicMode.value) {
    return props.playbackId;
  }
  return fetchedPlaybackData.value?.playbackId || props.playbackData?.playbackId;
});

const finalPlaybackToken = computed(() => {
  if (isPublicMode.value) {
    return undefined; // Public mode doesn't need tokens
  }
  return props.playbackToken || fetchedPlaybackData.value?.token || props.playbackData?.token;
});

const finalThumbnailToken = computed(() => {
  if (isPublicMode.value) {
    return undefined; // Public mode doesn't need tokens
  }
  return (
    props.thumbnailToken ||
    fetchedPlaybackData.value?.thumbnailToken ||
    props.playbackData?.thumbnailToken
  );
});

const finalPreferPlayback = computed(() => {
  if (props.preferPlayback !== 'auto') {
    return props.preferPlayback;
  }
  return isSafari.value ? 'native' : 'mse';
});

const thumbnailUrl = computed(() => {
  if (props.customThumbnailUrl) {
    return props.customThumbnailUrl;
  }

  if (!finalPlaybackId.value) {
    return '';
  }

  // For public mode, use basic thumbnail URL
  if (isPublicMode.value) {
    return `https://image.mux.com/${finalPlaybackId.value}/thumbnail.jpg?time=${props.thumbnailTime}`;
  }

  // For private mode, use Safari-optimized thumbnail URL
  if (finalThumbnailToken.value) {
    return SafariVideoFix.getOptimalThumbnailUrl(finalPlaybackId.value, finalThumbnailToken.value);
  }

  return '';
});

// Methods
const clearLoadingTimeout = () => {
  if (loadingTimeout.value) {
    clearTimeout(loadingTimeout.value);
    loadingTimeout.value = null;
  }
};

const handlePlayClick = async () => {
  // If data is still loading, wait for it to complete
  if (
    !fetchedPlaybackData.value &&
    !props.playbackData &&
    isPrivateMode.value &&
    !hasLoadedData.value
  ) {
    console.log('🎥 Play clicked but data not loaded yet - triggering load');

    // If we're expecting data from parent, we can't do much but wait
    if (props.expectDataFromParent === true) {
      console.warn('🎥 Waiting for parent data, cannot play yet');
      return;
    }

    // If we have contentId, trigger loading now
    if (props.contentId) {
      isLoading.value = true;
      try {
        await loadVideoData();
        // Wait for Vue to update the DOM with the new playback data
        await nextTick();
        console.log('🎥 Data loaded and DOM updated, ready to play');
      } catch (err) {
        console.error('Failed to load video data on play click:', err);
        return;
      } finally {
        isLoading.value = false;
      }
    } else {
      console.error('🎥 No data source available for playback');
      return;
    }
  }

  // Special handling for Safari stuck at readyState 1
  if (isSafari.value && muxPlayer.value) {
    const videoElement = muxPlayer.value as HTMLVideoElement;

    if (videoElement.readyState === 1) {
      console.warn('🦊 Safari readyState 1 on play click - forcing retry');

      // Clear any existing timeouts
      clearLoadingTimeout();

      // Force reload to try to get past readyState 1
      try {
        videoElement.preload = 'auto';
        videoElement.load();

        // Show loading state briefly
        isVideoLoading.value = true;

        // Wait a bit for Safari to process
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check if we made progress
        if (videoElement.readyState > 1) {
          console.log('🦊 Safari retry successful, readyState now:', videoElement.readyState);
          isVideoLoading.value = false;
        } else {
          console.warn('🦊 Safari still stuck after retry, attempting play anyway');
          isVideoLoading.value = false;
        }
      } catch (e) {
        console.warn('Safari retry failed:', e);
        isVideoLoading.value = false;
      }
    }
  }

  // Ensure mux-player element is ready before playing
  if (!muxPlayer.value) {
    console.error('🎥 Mux player element not ready, cannot play');
    return;
  }

  // Proceed with normal play
  await playVideo();
};

const playVideo = async () => {
  if (muxPlayer.value) {
    try {
      if (props.showControls) {
        muxPlayer.value.setAttribute('controls', 'true');
      }

      // For Safari, ensure video is ready before attempting play
      if (isSafari.value) {
        const videoElement = muxPlayer.value as HTMLVideoElement;

        // If still loading, try to force readiness
        if (isVideoLoading.value && videoElement.readyState < 3) {
          console.log(
            '🦊 Safari: Video still loading, checking readyState:',
            videoElement.readyState,
          );

          // If we have metadata but stuck at readyState 1, try to force progress
          if (videoElement.readyState === 1) {
            console.warn('🦊 Safari stuck at readyState 1 during play - forcing progress');
            try {
              // Force more aggressive preloading
              videoElement.preload = 'auto';

              // Clear loading state anyway - we'll try to play
              isVideoLoading.value = false;
              clearLoadingTimeout();

              // Try to load more data
              videoElement.load();
            } catch (e) {
              console.warn('Failed to force Safari video loading:', e);
            }
          } else if (videoElement.readyState >= 2) {
            // If we have some data, clear loading state and try to play
            isVideoLoading.value = false;
            clearLoadingTimeout();
          }
        }

        // Add a small delay for Safari to ensure it's ready
        if (videoElement.readyState < 2) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      await muxPlayer.value.play();
    } catch (err) {
      console.error('Failed to play video:', err);

      // Special handling for Safari interaction errors
      if (isSafari.value && err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          console.warn('🦊 Safari requires user interaction to play video');
          // Don't set error state for interaction issues, just log
          return;
        }
      }

      setError(t('common.videoPlayer.playbackFailed'));
    }
  }
};

const pauseVideo = () => {
  if (muxPlayer.value) {
    muxPlayer.value.pause();
  }
};

const handlePlay = () => {
  isPlaying.value = true;
  error.value = false; // Clear any previous errors when video starts playing
  emit('play');
};

const handlePause = () => {
  isPlaying.value = false;
  emit('pause');
};

const handlePlaying = () => {
  emit('playing');
};

const handleEnded = () => {
  isPlaying.value = false;
  emit('ended');
};

const handleLoadStart = () => {
  isVideoLoading.value = true;
  error.value = false; // Clear errors when loading starts

  // Set a timeout for Safari to prevent indefinite loading
  if (isSafari.value) {
    clearLoadingTimeout();
    loadingTimeout.value = setTimeout(() => {
      console.warn('🦊 Safari loading timeout - forcing canplay state');
      if (isVideoLoading.value && muxPlayer.value) {
        const videoElement = muxPlayer.value as HTMLVideoElement;

        // Check if video is actually ready to play
        if (videoElement.readyState >= 3) {
          isVideoLoading.value = false;
          console.log('🦊 Safari timeout recovery: Video was actually ready');
        } else if (videoElement.readyState >= 1) {
          console.warn('🦊 Safari stuck at readyState 1 - attempting recovery strategies');

          // Strategy 1: Try to force loading more data
          try {
            videoElement.preload = 'auto';
            videoElement.load();
            console.log('🦊 Safari recovery: Forced preload=auto and reload');
          } catch (e) {
            console.warn('Failed to reload video element:', e);
          }

          // Strategy 2: If still stuck after a short delay, clear loading anyway
          setTimeout(() => {
            if (isVideoLoading.value && videoElement.readyState >= 1) {
              console.warn('🦊 Safari recovery: Clearing loading state despite readyState 1');
              isVideoLoading.value = false;

              // Try to trigger canplay manually
              videoElement.dispatchEvent(new Event('canplay'));
            }
          }, 3000);
        } else {
          // No metadata at all - this is a more serious issue
          console.error('🦊 Safari has no video metadata after timeout');
          setError('Video failed to load. Try refreshing or check your network connection.');
        }
      }
    }, safariLoadingTimeout);
  }

  emit('loadstart');
};

const handleCanPlay = () => {
  clearLoadingTimeout();
  isVideoLoading.value = false;
  error.value = false; // Clear errors when video can play
};

const handleCanPlayThrough = () => {
  // This event is more reliable than canplay for Safari
  clearLoadingTimeout();
  isVideoLoading.value = false;
  error.value = false;

  if (isSafari.value) {
    console.log('🦊 Safari canplaythrough - video is fully ready');
  }
};

const handleLoadedData = () => {
  clearLoadingTimeout();
  isVideoLoading.value = false;
  error.value = false; // Clear errors when data is loaded
  safariRetryCount.value = 0; // Reset retry count on successful load
  emit('loaded');
};

const handleVolumeChange = () => {
  emit('volumechange');
};

const handleWaiting = () => {
  // Handle waiting event (buffering)
  console.log('Video is waiting/buffering');
  isVideoLoading.value = true;
};

const handleSafariEvent = (event: Event) => {
  const eventType = event.type;
  const target = event.target as HTMLVideoElement & {
    readyState: number;
    paused: boolean;
  };

  // Log Safari events for debugging but don't treat as errors
  console.log(`🦊 Safari ${eventType} event:`, {
    readyState: target?.readyState,
    paused: target?.paused,
    timestamp: Date.now(),
  });

  // Safari frequently fires stalled/abort events that aren't actual errors
  if (eventType === 'stalled') {
    // Stalled events in Safari are often temporary network hiccups
    console.log('🦊 Safari stalled event - this is normal Safari behavior, not an error');

    // Only show loading if we're actually not ready to play
    if (target?.readyState < 3) {
      isVideoLoading.value = true;

      // Set a shorter timeout for stalled events
      clearLoadingTimeout();
      loadingTimeout.value = setTimeout(() => {
        if (target?.readyState >= 1) {
          console.log('🦊 Safari stalled timeout - clearing loading state');
          isVideoLoading.value = false;
        }
      }, 5000); // 5 second timeout for stalled events
    } else {
      // If ready state is good, clear loading
      isVideoLoading.value = false;
      clearLoadingTimeout();
    }
    return;
  }

  if (eventType === 'abort') {
    // Abort events in Safari happen during normal operation, especially after pause
    console.log('🦊 Safari abort event - this is normal Safari behavior, not an error');

    // Don't change loading state or show errors for abort events
    // But clear any existing timeout
    clearLoadingTimeout();
    return;
  }
};

const handleVideoError = (event: Event) => {
  // Use debug utility for detailed error logging
  MuxDebugger.logVideoError(event, 'MuxPlayer');

  const target = event.target as HTMLVideoElement & {
    error?: { code: number; message: string };
    readyState: number;
  };
  const errorType = event.type;
  const errorCode = target?.error?.code;

  // Use Safari-specific error handling
  if (SafariVideoFix.shouldRetryOnError(errorType, errorCode, safariRetryCount.value)) {
    const retryDelay = SafariVideoFix.getRetryDelay(errorType, safariRetryCount.value);

    console.warn(`Retrying video load (attempt ${safariRetryCount.value + 1}/${maxSafariRetries})`);

    setTimeout(() => {
      if (target && (target.readyState < 3 || errorType === 'abort')) {
        safariRetryCount.value++;
        retryLoad();
      }
    }, retryDelay);
    return;
  }

  // Handle non-retryable errors or max retries reached
  isVideoLoading.value = false;

  const safariErrorMessage = SafariVideoFix.getSafariErrorMessage(errorType, errorCode);
  if (safariErrorMessage && isSafari.value) {
    setError(safariErrorMessage);
  } else {
    setError(t('common.videoPlayer.playbackFailed'));
  }
};

const setError = (message: string) => {
  error.value = true;
  errorMessage.value = message;
  isVideoLoading.value = false;
  clearLoadingTimeout();
  emit('error', message);
};

const retryLoad = async () => {
  error.value = false;
  errorMessage.value = '';

  if (isPrivateMode.value) {
    isLoading.value = true;
    try {
      // Force refresh to get new tokens
      await loadVideoData(true);
    } catch (err) {
      console.error('Retry failed:', err);
      setError(t('common.videoPlayer.loadFailed'));
    } finally {
      isLoading.value = false;
    }
  } else {
    // For public mode, just try to reload the player
    if (muxPlayer.value) {
      muxPlayer.value.load();
    }
  }
};

const loadVideoData = async (forceRefresh = false) => {
  if (!isPrivateMode.value) {
    return; // No need to load data for public mode
  }

  // If we have pre-fetched playback data and not forcing refresh, use it
  if (props.playbackData && !forceRefresh && !fetchedPlaybackData.value) {
    console.log('🎥 Using pre-fetched playback data');
    fetchedPlaybackData.value = props.playbackData;
    hasLoadedData.value = true;

    // Use debug utility to log playback data
    MuxDebugger.logPlaybackData(fetchedPlaybackData.value, 'MuxPlayer - Pre-fetched Data');

    // Check thumbnail URL accessibility
    if (thumbnailUrl.value) {
      MuxDebugger.checkThumbnailUrl(thumbnailUrl.value);
    }
    return;
  }

  // If no contentId and no pre-fetched data, we can't proceed
  if (!props.contentId) {
    throw new Error('No contentId provided and no pre-fetched playback data available');
  }

  try {
    // Clear previous data if forcing refresh
    if (forceRefresh) {
      fetchedPlaybackData.value = null;
    }

    const result = await getPostPlay({
      contentId: props.contentId!,
      thumbnailTime: props.thumbnailTime,
    });

    if (!result.success) {
      throw new Error(t('common.videoPlayer.noVideoData'));
    }

    fetchedPlaybackData.value = result.data;
    hasLoadedData.value = true;

    // Validate tokens exist
    if (!fetchedPlaybackData.value?.token || !fetchedPlaybackData.value?.playbackId) {
      throw new Error('Invalid playback data received');
    }

    // Use debug utility to log playback data
    MuxDebugger.logPlaybackData(fetchedPlaybackData.value, 'MuxPlayer - Data Loaded');

    // Check thumbnail URL accessibility
    if (thumbnailUrl.value) {
      MuxDebugger.checkThumbnailUrl(thumbnailUrl.value);
    }
  } catch (err) {
    console.error('Failed to load video data:', err);

    // Handle different types of errors
    if (err instanceof Error) {
      if (err.message.includes('401') || err.message.includes('403')) {
        setError(t('common.videoPlayer.permissionDenied'));
      } else if (err.message.includes('404')) {
        setError(t('common.videoPlayer.videoNotFound'));
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        setError(t('common.videoPlayer.networkError'));
      } else {
        setError(t('common.videoPlayer.loadFailed'));
      }
    } else {
      setError(t('common.videoPlayer.unexpectedError'));
    }

    throw err; // Re-throw to be caught by the calling function
  }
};

// Expose methods
defineExpose({
  playVideo,
  pauseVideo,
  retryLoad,
  isPlaying: computed(() => isPlaying.value),
  isLoading: computed(() => isLoading.value || isVideoLoading.value),
  hasError: computed(() => error.value),
  muxPlayer: computed(() => muxPlayer.value),
  // Volume control
  setVolume: (volume: number) => {
    if (muxPlayer.value) {
      muxPlayer.value.volume = volume;
    }
  },
  setMuted: (muted: boolean) => {
    if (muxPlayer.value) {
      muxPlayer.value.muted = muted;
    }
  },
  // Time control
  setCurrentTime: (time: number) => {
    if (muxPlayer.value) {
      muxPlayer.value.currentTime = time;
    }
  },
  getCurrentTime: () => {
    return muxPlayer.value?.currentTime || 0;
  },
});

// Watcher for playbackData prop changes (handles async data from parent)
watch(
  () => props.playbackData,
  async (newData) => {
    if (
      newData &&
      !hasLoadedData.value &&
      isPrivateMode.value &&
      props.expectDataFromParent === true
    ) {
      console.log('🎥 Expected playback data received from parent - loading');
      isLoading.value = true;
      try {
        await loadVideoData();

        // Safari-specific post-load handling
        if (isSafari.value && muxPlayer.value) {
          await nextTick();
          SafariVideoFix.applyVideoElementFixes(muxPlayer.value as HTMLVideoElement);
        }
      } catch {
        // Error is already handled in loadVideoData
      } finally {
        isLoading.value = false;
      }
    }
  },
  { immediate: true },
);

// Lifecycle hooks
onMounted(async () => {
  // Detect Safari
  isSafari.value = SafariVideoFix.isSafari();

  if (isSafari.value) {
    SafariVideoFix.logSafariSpecificInfo();
  }

  // For private mode, check if we should load data immediately
  if (isPrivateMode.value) {
    // If expectDataFromParent is explicitly true, wait for the watcher to handle it
    // Otherwise, load data immediately if we have contentId (default behavior)
    if (props.expectDataFromParent === true) {
      console.log('🎥 Waiting for playback data from parent...');
    } else if (props.contentId && !hasLoadedData.value) {
      console.log('🎥 Loading data immediately (self-fetch mode)');
      isLoading.value = true;
      try {
        await loadVideoData();

        // Safari-specific post-load handling
        if (isSafari.value && muxPlayer.value) {
          await nextTick();
          SafariVideoFix.applyVideoElementFixes(muxPlayer.value as HTMLVideoElement);
        }
      } catch {
        // Error is already handled in loadVideoData
      } finally {
        isLoading.value = false;
      }
    }
  } else {
    // For public mode, apply Safari fixes after next tick
    if (isSafari.value) {
      await nextTick();
      if (muxPlayer.value) {
        SafariVideoFix.applyVideoElementFixes(muxPlayer.value as HTMLVideoElement);
      }
    }
  }
});

// Cleanup
onUnmounted(() => {
  clearLoadingTimeout();
});
</script>

<style scoped lang="postcss">
.mux-player {
  aspect-ratio: v-bind('aspectRatio');
}

mux-player {
  --media-primary-color: hsla(var(--white));
  --media-accent-color: hsla(var(--white), 0.8);
  --play-button: v-bind('muxPlayButtonDisplay');

  &::part(bottom) {
    --media-time-range-buffered-color: hsla(var(--white), 0.25);
  }
  &:host {
    --media-control-hover-background: hsla(var(--white), 0.25);
  }
}
</style>
