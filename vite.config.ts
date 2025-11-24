import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Safely expose API_KEY if it exists in the environment
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
      // Prevent crashing if other process.env access occurs
      'process.env': {}
    }
  };
});