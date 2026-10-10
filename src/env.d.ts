/// <reference types="vite/client" />

interface Window {
  hitthebeat?: {
    getAppInfo(): Promise<{ version: string; platform: string }>;
  };
}
