import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        habits: resolve(__dirname, 'habits.html'),
        tasks: resolve(__dirname, 'tasks.html'),
        progress: resolve(__dirname, 'progress.html'),
      },
    },
  },
});
