import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/heartfelt-designs/', // Replace 'heartfelt-designs' with your actual repo name
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    }
})
