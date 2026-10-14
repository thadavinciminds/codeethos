import { defineConfig } from 'vite';

// Local LLM proxy: requests to /llm/* are forwarded to your local model server.
// This avoids CORS problems (e.g. Ollama blocks browser origins by default).
// Override the target with:  $env:LLM_TARGET="http://localhost:1234"; npm run dev
const LLM_TARGET = process.env.LLM_TARGET || 'http://localhost:11434';

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    fs: { allow: ['..'] }, // lets the app read ../CURRICULUM_TRACKER.md for export
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/llm': {
        target: LLM_TARGET,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/llm/, ''),
      },
    },
  },
  worker: { format: 'es' },
});
