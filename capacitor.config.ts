import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aipocket.secretary',
  appName: 'AI Pocket Secretary',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
