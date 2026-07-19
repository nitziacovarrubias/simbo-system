import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
    resolve: {
        alias: {
            '@main': resolve(__dirname, 'src/main'),
            '@preload': resolve(__dirname, 'src/preload'),
            '@renderer': resolve(__dirname, 'src/renderer'),
            '@shared': resolve(__dirname, 'src/shared')
        }
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx']
    }
});