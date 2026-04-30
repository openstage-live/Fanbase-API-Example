import { onMounted, onUnmounted } from 'vue';
import { useStyleTag } from '@vueuse/core';

/**
 * Sync a CSS var --vvh and <html> height with window.visualViewport.height.
 * Helps iOS Safari resize layouts when showing the keyboard.
 */
export function useVisualViewportHeight(): void {
  let cleanup: (() => void) | null = null;
  const { css, load, unload, isLoaded } = useStyleTag('', { manual: true });

  const update = () => {
    const height = window.visualViewport?.height || window.innerHeight;
    css.value = `:root{--vvh:${height}px;} html{height:${height}px;}`;
    if (!isLoaded.value) load();
  };

  onMounted(() => {
    update();
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      ['resize', 'scroll'].forEach((eventName) =>
        visualViewport.addEventListener(eventName, update),
      );
      cleanup = () =>
        ['resize', 'scroll'].forEach((eventName) =>
          visualViewport.removeEventListener(eventName, update),
        );
    } else {
      // Fallback for browsers without visualViewport
      window.addEventListener('resize', update);
      cleanup = () => window.removeEventListener('resize', update);
    }
  });

  onUnmounted(() => {
    cleanup?.();
    unload();
  });
}
