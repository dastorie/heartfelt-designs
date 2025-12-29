import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/', // Root path for custom domain
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    }
})
