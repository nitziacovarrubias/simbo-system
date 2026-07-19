import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'node:path';

const alias = {
    '@main': resolve('src/main'),
    '@preload': resolve('src/preload'),
    '@renderer': resolve('src/renderer'),
    '@shared': resolve('src/shared')
};

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
        resolve: {
            alias
        },
        build: {
            rollupOptions: {
                input: resolve('src/main/main.ts')
            }
        }
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        resolve: {
            alias
        },
        build: {
            rollupOptions: {
                input: resolve('src/preload/index.ts')
            }
        }
    },
    renderer: {
        root: resolve('src/renderer'),
        plugins: [react()],
        resolve: {
            alias
        }
    }
});