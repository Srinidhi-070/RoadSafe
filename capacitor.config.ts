
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8189f408c70640d3a5550ee8058a8df6', // Keep the existing appId
  appName: 'RoadSafe',
  webDir: 'dist',
  server: {
    url: 'https://8189f408-c706-40d3-a555-0ee8058a8df6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
    }
  }
};

export default config;
