import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.srdan_technical.app',
  appName: 'Srdan Technical',
  webDir: 'www',
  plugins: {
    Camera: {
      iosUsePhotoLibrary: true,
    },
  },
};

export default config;
