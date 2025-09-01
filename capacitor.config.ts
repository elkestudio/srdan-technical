import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.srdantechnical.app',
  appName: 'Srdan Technical',
  webDir: 'www',
  plugins: {
    Camera: {
      iosUsePhotoLibrary: true,
    },
  },
};

export default config;
