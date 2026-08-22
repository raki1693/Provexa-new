import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// Auto-deploy uploaded logo asset on Vite reload
try {
  const srcLogo = 'C:/Users/nanda/.gemini/antigravity/brain/3bf5b750-0611-4f75-b7df-7aa681acbda1/.user_uploaded/media_1787425177409.jpg';
  const destLogo = 'C:/Users/nanda/.gemini/antigravity/scratch/provexa/client/public/logo.jpg';

  if (fs.existsSync(srcLogo)) {
    fs.mkdirSync('C:/Users/nanda/.gemini/antigravity/scratch/provexa/client/public', { recursive: true });
    fs.copyFileSync(srcLogo, destLogo);
    console.log('✅ Vite auto-deployed logo.jpg successfully!');
  }
} catch (err) {
  console.error('❌ Failed to copy logo in Vite config:', err);
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
