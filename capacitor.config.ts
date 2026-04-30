import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tetrisanakcerdas',
  appName: 'Tetris Anak Cerdas',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
