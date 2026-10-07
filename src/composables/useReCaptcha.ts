import { env } from '@/env';

declare global {
  interface Window {
    grecaptcha?: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options?: { action?: string }) => Promise<string>;
      };
    };
  }
}

let scriptLoad: Promise<void> | null = null;

const loadScript = (siteKey: string) =>
  (scriptLoad ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoad = null;
      reject(new Error('Failed to load reCAPTCHA'));
    };
    document.head.appendChild(script);
  }));

/** reCAPTCHA Enterprise token for `/fan/signup-start`. Requires `VITE_RECAPTCHA_SITE_KEY`. */
export function useReCaptcha() {
  const siteKey = env.VITE_RECAPTCHA_SITE_KEY;

  const preload = () => {
    if (siteKey) loadScript(siteKey).catch(console.error);
  };

  const execute = async (action: string): Promise<string> => {
    if (!siteKey) throw new Error('VITE_RECAPTCHA_SITE_KEY is not set');
    await loadScript(siteKey);
    return new Promise((resolve, reject) =>
      window.grecaptcha!.enterprise.ready(() =>
        window.grecaptcha!.enterprise.execute(siteKey, { action }).then(resolve, reject),
      ),
    );
  };

  return { preload, execute };
}
