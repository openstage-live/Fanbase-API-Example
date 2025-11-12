/**
 * Not official. Guessed by Openstage devs.
 */
interface CloudinaryWidgetOptions {
  cloudName: string;
  folder: string;
  cropping: boolean;
  croppingAspectRatio: number;
  showSkipCropButton: boolean;
  clientAllowedFormats: string[];
  showPoweredBy: boolean;
  uploadPreset: string;
  sources: string[];
  styles: {
    palette: {
      window: string;
      windowBorder: string;
      tabIcon: string;
      menuIcons: string;
      textDark: string;
      textLight: string;
      link: string;
      action: string;
      inactiveTabIcon: string;
      error: string;
      inProgress: string;
      complete: string;
      sourceBg: string;
    };
    frame: {
      background: string;
    };
    fonts: {
      [key: string]: string;
    };
  };
}

interface CloudinaryResult {
  event: string;
  info: {
    secure_url: string;
  };
}

interface CloudinaryUploadWidget {
  open: (source?: string | null, options?: { files: string[] } | null) => void;
}

declare const cloudinary: {
  createUploadWidget: (
    options: CloudinaryWidgetOptions,
    callback: (error: Error | null, result: CloudinaryResult | null) => void,
  ) => {
    open: (source?: string | null, options?: { files: string[] } | null) => void;
  };
  openUploadWidget: (
    options: CloudinaryWidgetOptions,
    callback: (error: Error | null, result: CloudinaryResult | null) => void,
  ) => void;
};
